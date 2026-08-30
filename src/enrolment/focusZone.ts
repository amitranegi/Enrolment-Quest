import type { PartySlot, PartyZoneConfig } from './focusZoneTypes';
import { showChoiceNudge, closeChoiceNudge } from './choiceNudge';

export type { PartySlot, PartyZoneConfig, PartyRelation } from './focusZoneTypes';

let open = false;
let root: HTMLDivElement | null = null;
let cfg: PartyZoneConfig | null = null;
let anim = 0;
let selected: string | null = 'self';
let editing: string | null = null;
let covered = new Set<string>();
let nudgeAck = false;
let t0 = 0;
let frameIdx = 0;
/** When true, lineup canvases already exist — avoid wiping them (fixes self-sprite flash/vanish). */
let shellBuilt = false;
let outsideBound = false;

export function isFocusZoneOpen(): boolean {
  return open;
}

/** @deprecated alias — same as isFocusZoneOpen */
export function isPartyZoneOpen(): boolean {
  return open;
}

function ensureRoot(): HTMLDivElement {
  if (root && root.isConnected) return root;
  if (root && !root.isConnected) {
    (document.getElementById('wrap') || document.body).appendChild(root);
    return root;
  }
  root = document.createElement('div');
  root.id = 'partyZone';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  (document.getElementById('wrap') || document.body).appendChild(root);
  return root;
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toast(msg: string): void {
  (window as unknown as { toast?: (m: string) => void }).toast?.(msg);
}

function unbindOutside(): void {
  if (!outsideBound) return;
  document.removeEventListener('pointerdown', onOutsidePointer, true);
  outsideBound = false;
}

export function closeFocusZone(): void {
  open = false;
  cfg = null;
  selected = 'self';
  editing = null;
  shellBuilt = false;
  nudgeAck = false;
  closeChoiceNudge();
  unbindOutside();
  if (anim) {
    cancelAnimationFrame(anim);
    anim = 0;
  }
  if (root) {
    root.className = '';
    root.innerHTML = '';
  }
}

function slots(): PartySlot[] {
  if (!cfg) return [];
  return cfg.getSlots().map((s) => ({
    ...s,
    covered: s.relation === 'self' ? true : !!(s.memberId && covered.has(s.memberId)),
  }));
}

function paintBg(): void {
  if (!cfg || !root) return;
  const cv = root.querySelector('canvas.pz-bg') as HTMLCanvasElement | null;
  if (cv && cfg.paintBackground) {
    const host = root.querySelector('.pz-scene') as HTMLElement | null;
    const w = Math.max(2, Math.floor(host?.clientWidth || root.clientWidth || 960));
    const h = Math.max(2, Math.floor(host?.clientHeight || root.clientHeight || 540));
    if (cv.width !== w || cv.height !== h) {
      cv.width = w;
      cv.height = h;
    }
    cfg.paintBackground(cv);
  }
  paintGroundStrip();
}

function paintGroundStrip(): void {
  if (!cfg?.paintGround || !root) return;
  const cv = root.querySelector('canvas.pz-ground') as HTMLCanvasElement | null;
  if (!cv) return;
  const host = root.querySelector('.pz-stage') as HTMLElement | null;
  const w = Math.max(2, Math.floor(host?.clientWidth || root.clientWidth || 960));
  const h = 96;
  if (cv.width !== w || cv.height !== h) {
    cv.width = w;
    cv.height = h;
  }
  cfg.paintGround(cv);
}

function plateName(s: PartySlot): string {
  if (s.relation === 'self') return 'Self';
  return s.empty ? s.label : s.name;
}

function paintAll(frame: number): void {
  if (!cfg || !root) return;
  frameIdx = frame;
  for (const s of slots()) {
    const cv = root.querySelector(`canvas[data-cv="${CSS.escape(s.slot)}"]`) as HTMLCanvasElement | null;
    if (cv) cfg.paintMember(cv, s, frame);
  }
}

function startAnim(): void {
  if (anim) cancelAnimationFrame(anim);
  t0 = performance.now();
  const tick = (now: number) => {
    if (!open) return;
    const frame = Math.floor((now - t0) / 180) % 5;
    paintAll(frame);
    anim = requestAnimationFrame(tick);
  };
  anim = requestAnimationFrame(tick);
}

function figHtml(s: PartySlot): string {
  const on = selected === s.slot ? ' on' : '';
  const cov = !s.empty && s.covered ? ' cov' : '';
  const emp = s.empty ? ' empty' : '';
  const role = ` role-${esc(s.relation)}`;
  return `<button type="button" class="pz-fig${on}${cov}${emp}${role}" data-slot="${esc(s.slot)}" aria-label="${esc(s.empty ? 'Add ' + s.label : s.relation === 'self' ? 'Self' : s.name)}">
    <span class="pz-pedestal" aria-hidden="true"></span>
    <canvas class="pz-cv" width="140" height="140" data-cv="${esc(s.slot)}"></canvas>
    ${s.empty ? `<span class="pz-plus" aria-hidden="true">+</span>` : ''}
    <span class="pz-tag">
      <span class="pz-tag-name">${esc(plateName(s))}</span>
      ${
        !s.empty
          ? `<span class="pz-cover${s.covered ? ' on' : ''}" data-shield="${esc(s.memberId || '')}" title="${s.relation === 'self' ? 'Always covered' : 'Toggle cover'}" ${s.relation === 'self' ? '' : 'role="button"'}>${s.covered ? 'C' : '·'}</span>`
          : ''
      }
    </span>
  </button>`;
}

function genderLabel(g: string): string {
  if (g === 'male') return 'Male';
  if (g === 'female') return 'Female';
  return 'Other';
}

function tipFormHtml(editSlot: PartySlot): string {
  const defaultG =
    editSlot.gender ||
    (editSlot.relation === 'spouse' ? 'female' : editSlot.relation === 'parent' ? 'male' : 'other');
  return `<div class="pz-tip-title">${editSlot.empty ? 'Add' : 'Edit'} · ${esc(editSlot.label)}</div>
    <div class="pz-fields">
      <label>Name<input id="pz_name" type="text" maxlength="24" autocomplete="off" value="${esc(editSlot.empty ? '' : editSlot.name)}" placeholder="Name"></label>
      <div class="pz-gender" role="group" aria-label="Look">
        ${(['male', 'female', 'other'] as const)
          .map(
            (g) =>
              `<label class="pz-gend"><input type="radio" name="pz_gender" value="${g}"${g === defaultG ? ' checked' : ''}><span>${genderLabel(g)}</span></label>`,
          )
          .join('')}
      </div>
      <div class="pz-tip-acts">
        <button type="button" class="pxbtn small" data-act="cancel">Cancel</button>
        <button type="button" class="pxbtn good small" data-act="save">${editSlot.empty ? 'Add ★' : 'Save'}</button>
      </div>
    </div>`;
}

function tipManageHtml(selSlot: PartySlot): string {
  return `<div class="pz-tip-title">${esc(selSlot.label)}</div>
    <p class="pz-tip-meta"><b>${esc(selSlot.name)}</b>${selSlot.gender ? ' · ' + esc(genderLabel(selSlot.gender)) : ''}</p>
    <div class="pz-tip-acts">
      <button type="button" class="pxbtn small" data-act="edit">Edit</button>
      <button type="button" class="pxbtn small" data-act="remove">Remove</button>
    </div>`;
}

function tipHtml(): string {
  if (!cfg || !editing) return '';
  const list = slots();
  const slotId = tipEditingSlot();
  const editSlot = slotId ? list.find((s) => s.slot === slotId) : null;
  if (!editSlot) return '';
  if (editSlot.relation === 'self') {
    return `<div class="pz-tip-title">Self</div><p class="pz-tip-meta">You are always covered.</p>`;
  }
  if (editing.startsWith('manage:') && !editSlot.empty) {
    return tipManageHtml(editSlot);
  }
  return tipFormHtml(editSlot);
}

/** editing can be slot id, or `manage:slot` for the compact manage tip. */
function tipEditingSlot(): string | null {
  if (!editing) return null;
  return editing.startsWith('manage:') ? editing.slice(7) : editing;
}

function dockHtml(): string {
  if (!cfg) return '';
  const list = slots();
  const nCov = list.filter((s) => !s.empty && s.memberId && covered.has(s.memberId)).length;
  const hint = editing
    ? ''
    : `<p class="pz-muted">Tap a <b>+</b> silhouette to add family · tap <b>C</b> to cover</p>`;
  return `${hint}
    <footer class="pz-foot">
      <div class="pz-count">${nCov} covered</div>
      <button type="button" class="pxbtn good" data-act="confirm">Confirm &amp; continue ▶</button>
    </footer>`;
}

/** Update name tags / empty / cover / selection without destroying canvases. */
function syncLineup(): void {
  if (!root) return;
  const list = slots();
  const lineup = root.querySelector('[data-lineup]') as HTMLElement | null;
  if (!lineup) return;

  const want = new Set(list.map((s) => s.slot));
  lineup.querySelectorAll('.pz-fig').forEach((btn) => {
    const slot = (btn as HTMLElement).dataset.slot;
    if (slot && !want.has(slot)) btn.remove();
  });

  for (const s of list) {
    let btn = lineup.querySelector(`.pz-fig[data-slot="${CSS.escape(s.slot)}"]`) as HTMLButtonElement | null;
    if (!btn) {
      lineup.insertAdjacentHTML('beforeend', figHtml(s));
      btn = lineup.querySelector(`.pz-fig[data-slot="${CSS.escape(s.slot)}"]`) as HTMLButtonElement | null;
      if (btn) bindFig(btn);
      continue;
    }

    btn.classList.toggle('on', selected === s.slot);
    btn.classList.toggle('cov', !s.empty && s.covered);
    btn.classList.toggle('empty', s.empty);
    btn.setAttribute('aria-label', s.empty ? 'Add ' + s.label : s.relation === 'self' ? 'Self' : s.name);

    const nameEl = btn.querySelector('.pz-tag-name');
    if (nameEl) nameEl.textContent = plateName(s);

    let plus = btn.querySelector('.pz-plus');
    if (s.empty && !plus) {
      btn.insertAdjacentHTML('beforeend', `<span class="pz-plus" aria-hidden="true">+</span>`);
    } else if (!s.empty && plus) {
      plus.remove();
    }

    let cover = btn.querySelector('.pz-cover') as HTMLElement | null;
    if (s.empty) {
      cover?.remove();
    } else if (!cover) {
      const tag = btn.querySelector('.pz-tag');
      tag?.insertAdjacentHTML(
        'beforeend',
        `<span class="pz-cover${s.covered ? ' on' : ''}" data-shield="${esc(s.memberId || '')}" title="${s.relation === 'self' ? 'Always covered' : 'Toggle cover'}" ${s.relation === 'self' ? '' : 'role="button"'}>${s.covered ? 'C' : '·'}</span>`,
      );
      const sh = btn.querySelector('[data-shield]') as HTMLElement | null;
      if (sh) bindShield(sh);
    } else {
      cover.classList.toggle('on', s.covered);
      cover.textContent = s.covered ? 'C' : '·';
      cover.dataset.shield = s.memberId || '';
    }
  }
}

function positionTip(): void {
  if (!root) return;
  const tip = root.querySelector('.pz-tip') as HTMLElement | null;
  if (!tip || !editing) {
    tip?.classList.remove('open');
    return;
  }
  const slot = tipEditingSlot();
  if (!slot) {
    tip.classList.remove('open');
    return;
  }
  const fig = root.querySelector(`.pz-fig[data-slot="${CSS.escape(slot)}"]`) as HTMLElement | null;
  const stage = root.querySelector('.pz-stage') as HTMLElement | null;
  if (!fig || !stage) {
    tip.classList.remove('open');
    return;
  }

  tip.classList.add('open');
  tip.style.visibility = 'hidden';
  tip.style.left = '0';
  tip.style.top = '0';

  const stageRect = stage.getBoundingClientRect();
  const figRect = fig.getBoundingClientRect();
  const tipW = tip.offsetWidth || 260;
  const tipH = tip.offsetHeight || 160;
  let left = figRect.left - stageRect.left + figRect.width / 2 - tipW / 2;
  left = Math.max(8, Math.min(left, stageRect.width - tipW - 8));
  let top = figRect.top - stageRect.top - tipH - 14;
  let below = false;
  if (top < 8) {
    top = figRect.bottom - stageRect.top + 10;
    below = true;
  }
  tip.classList.toggle('below', below);
  tip.style.left = `${Math.round(left)}px`;
  tip.style.top = `${Math.round(top)}px`;
  tip.style.visibility = 'visible';
}

function syncTip(): void {
  if (!root) return;
  const tip = root.querySelector('.pz-tip') as HTMLElement | null;
  if (!tip) return;
  if (!editing) {
    tip.classList.remove('open');
    tip.innerHTML = '';
    unbindOutside();
    return;
  }
  tip.innerHTML = tipHtml();
  bindTip(tip);
  positionTip();
  if (!outsideBound) {
    document.addEventListener('pointerdown', onOutsidePointer, true);
    outsideBound = true;
  }
  requestAnimationFrame(() => {
    positionTip();
    (root!.querySelector('#pz_name') as HTMLInputElement | null)?.focus();
  });
}

function onOutsidePointer(e: PointerEvent): void {
  if (!open || !editing || !root) return;
  const t = e.target as Node;
  if (root.querySelector('.pz-tip')?.contains(t)) return;
  if ((t as HTMLElement).closest?.('.pz-fig')) return;
  editing = null;
  refresh();
}

function syncDock(): void {
  if (!root) return;
  const dock = root.querySelector('.pz-dock');
  if (!dock) return;
  dock.innerHTML = dockHtml();
  bindDock(dock as HTMLElement);
}

function bindFig(btn: HTMLElement): void {
  btn.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-shield]')) return;
    const slot = btn.dataset.slot;
    if (!slot || !cfg) return;
    const s = slots().find((x) => x.slot === slot);
    if (!s) return;
    selected = slot;
    if (s.relation === 'self') {
      editing = null;
    } else if (s.empty) {
      editing = slot;
    } else {
      editing = 'manage:' + slot;
    }
    refresh();
  });
}

function bindShield(sh: HTMLElement): void {
  sh.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = sh.dataset.shield;
    if (!id || id === 'self') return;
    if (covered.has(id)) covered.delete(id);
    else covered.add(id);
    refresh();
  });
}

function bindTip(tip: HTMLElement): void {
  if (!cfg) return;

  tip.querySelector('[data-act="cancel"]')?.addEventListener('click', () => {
    editing = null;
    refresh();
  });

  tip.querySelector('[data-act="edit"]')?.addEventListener('click', () => {
    const slot = tipEditingSlot();
    if (!slot) return;
    editing = slot;
    refresh();
  });

  tip.querySelector('[data-act="remove"]')?.addEventListener('click', () => {
    const slot = tipEditingSlot();
    if (!slot || !cfg) return;
    const before = slots().find((s) => s.slot === slot);
    if (before?.memberId) covered.delete(before.memberId);
    cfg.onClearSlot(slot);
    editing = null;
    selected = 'self';
    refresh();
  });

  tip.querySelector('[data-act="save"]')?.addEventListener('click', () => {
    const slot = tipEditingSlot();
    if (!slot || !cfg) return;
    const name = (tip.querySelector('#pz_name') as HTMLInputElement)?.value.trim() || '';
    const gender =
      (tip.querySelector('input[name="pz_gender"]:checked') as HTMLInputElement | null)?.value || '';
    const err = cfg.onSaveSlot(slot, { name, gender });
    if (err) {
      toast(err);
      return;
    }
    const saved = cfg.getSlots().find((s) => s.slot === slot);
    if (saved?.memberId) covered.add(saved.memberId);
    selected = slot;
    editing = null;
    refresh();
    toast((saved?.name || 'Member') + ' joined the party!');
  });
}

function bindDock(dock: HTMLElement): void {
  if (!cfg) return;
  dock.querySelector('[data-act="confirm"]')?.addEventListener('click', () => {
    if (!cfg) return;
    const list = cfg.getSlots();
    const valid = new Set(list.filter((s) => s.memberId && !s.empty).map((s) => s.memberId as string));
    const final = ['self', ...[...covered].filter((id) => id !== 'self' && valid.has(id))];
    if (final.length === 1 && !nudgeAck) {
      nudgeAck = true;
      showChoiceNudge({
        title: 'No family added',
        message: 'Sure you want to continue solo? Add the dependants you would actually cover.',
        skipLabel: 'No, continue',
        onSkip: () => cfg?.onConfirm(final),
      });
      return;
    }
    cfg.onConfirm(final);
  });
}

function bindLineup(): void {
  if (!root) return;
  root.querySelectorAll('.pz-fig').forEach((btn) => bindFig(btn as HTMLElement));
  root.querySelectorAll('[data-shield]').forEach((sh) => bindShield(sh as HTMLElement));
}

/** Soft refresh — keep canvases alive so self sprite never blanks. */
function refresh(): void {
  if (!cfg || !root) return;
  syncLineup();
  syncDock();
  syncTip();
  paintBg();
  paintAll(frameIdx);
}

function buildShell(): void {
  if (!cfg) return;
  const el = ensureRoot();
  const list = slots();
  const logoSrc = cfg.logoUrl || cfg.logoFallbackUrl || '';
  const logo = logoSrc
    ? `<img class="pz-logo" src="${esc(logoSrc)}" alt="${esc(cfg.companyName)}" data-logo data-fallback="${esc(cfg.logoFallbackUrl || '')}">`
    : '';

  el.className = 'open';
  el.innerHTML = `
    <div class="pz-scene">
      <div class="pz-sky" aria-hidden="true">
        <canvas class="pz-bg" width="960" height="540"></canvas>
      </div>

      <header class="pz-top">
        <div class="pz-brand">${logo}</div>
        <div class="pz-heading">
          <span class="pz-kicker">Focus Zone · Level 1</span>
          <h1>${esc(cfg.title)}</h1>
        </div>
        <p class="pz-hint">${esc(cfg.structureNote)}</p>
      </header>

      <div class="pz-stage">
        <canvas class="pz-ground" width="960" height="96" aria-hidden="true"></canvas>
        <div class="pz-lineup" data-lineup>
          ${list.map(figHtml).join('')}
        </div>
        <div class="pz-tip" role="dialog" aria-label="Member details"></div>
      </div>

      <div class="pz-dock">${dockHtml()}</div>
    </div>`;

  const logoImg = el.querySelector('[data-logo]') as HTMLImageElement | null;
  logoImg?.addEventListener('error', () => {
    const fb = logoImg.dataset.fallback || '';
    if (fb && logoImg.dataset.triedFallback !== '1') {
      logoImg.dataset.triedFallback = '1';
      logoImg.src = fb;
      return;
    }
    logoImg.style.display = 'none';
  });

  shellBuilt = true;
  bindLineup();
  bindDock(el.querySelector('.pz-dock') as HTMLElement);
  paintBg();
  paintAll(0);
  startAnim();
  requestAnimationFrame(() => {
    if (!open) return;
    paintBg();
    paintAll(frameIdx);
    syncTip();
  });
}

function render(): void {
  if (!cfg) return;
  if (!shellBuilt || !root?.querySelector('[data-lineup]')) {
    buildShell();
    return;
  }
  refresh();
}

/** Open the Family Party Focus Zone (sprite lineup). */
export function openFocusZone(config: PartyZoneConfig): void {
  open = true;
  cfg = config;
  editing = null;
  selected = 'self';
  shellBuilt = false;
  nudgeAck = false;
  const list = config.getSlots();
  covered = new Set(
    list.filter((s) => s.memberId && s.covered).map((s) => s.memberId as string).concat(['self']),
  );
  render();
}

export function closePartyZone(): void {
  closeFocusZone();
}
