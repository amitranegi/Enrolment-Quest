import type { ChooserPlan, PlanChooserConfig } from './planChooserTypes';
import { showChoiceNudge, closeChoiceNudge } from './choiceNudge';

export type { ChooserPlan, PlanChooserConfig, PlanFeature } from './planChooserTypes';

let open = false;
let root: HTMLDivElement | null = null;
let cfg: PlanChooserConfig | null = null;
let selectedId: string | null = null;
let multiIds = new Set<string>();
let nudgeAck = false;

export function isPlanChooserOpen(): boolean {
  return open;
}

function ensureRoot(): HTMLDivElement {
  if (root && root.isConnected) return root;
  if (root && !root.isConnected) {
    (document.getElementById('wrap') || document.body).appendChild(root);
    return root;
  }
  root = document.createElement('div');
  root.id = 'planZone';
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

export function closePlanChooser(): void {
  open = false;
  cfg = null;
  selectedId = null;
  multiIds = new Set();
  nudgeAck = false;
  closeChoiceNudge();
  if (root) {
    root.className = '';
    root.innerHTML = '';
  }
}

function paintBg(): void {
  if (!cfg?.paintBackground || !root) return;
  const cv = root.querySelector('canvas.pc-bg') as HTMLCanvasElement | null;
  if (!cv) return;
  const host = root.querySelector('.pc-scene') as HTMLElement | null;
  const w = Math.max(2, Math.floor(host?.clientWidth || root.clientWidth || 960));
  const h = Math.max(2, Math.floor(host?.clientHeight || root.clientHeight || 540));
  if (cv.width !== w || cv.height !== h) {
    cv.width = w;
    cv.height = h;
  }
  cfg.paintBackground(cv);
}

function isOn(id: string): boolean {
  return cfg?.multiSelect ? multiIds.has(id) : selectedId === id;
}

function cardHtml(p: ChooserPlan): string {
  const on = isOn(p.id) ? ' on' : '';
  const tone = ` tone-${esc(p.tone || 'default')}`;
  const badgeTone = ` badge-${esc(p.badgeTone || 'default')}`;

  const highlights =
    p.highlights && p.highlights.length
      ? `<ul class="pc-highlights">${p.highlights
          .slice(0, 2)
          .map((h) => `<li>${esc(h)}</li>`)
          .join('')}</ul>`
      : p.features && p.features.length
        ? `<ul class="pc-highlights">${p.features
            .slice(0, 2)
            .map((f) => `<li><b>${esc(f.label)}</b> ${esc(f.value)}</li>`)
            .join('')}</ul>`
        : p.bullets && p.bullets.length
          ? `<ul class="pc-highlights">${p.bullets
              .slice(0, 2)
              .map((b) => `<li>${esc(b)}</li>`)
              .join('')}</ul>`
          : '';

  const pickLabel = cfg?.multiSelect
    ? isOn(p.id)
      ? '✓ Selected'
      : '+ Select'
    : isOn(p.id)
      ? '✓ Chosen'
      : 'Choose';

  return `<article class="pc-card${on}${tone}" data-plan="${esc(p.id)}" tabindex="0" role="button" aria-pressed="${isOn(p.id)}">
    <div class="pc-badge-slot">
      <div class="pc-badge${badgeTone}${p.badge ? '' : ' is-empty'}">${esc(p.badge || '')}</div>
    </div>
    <header class="pc-card-head">
      <h2>${esc(p.name)}</h2>
      <span class="pc-radio" aria-hidden="true"></span>
    </header>
    ${p.sumLabel ? `<div class="pc-sum">${esc(p.sumLabel)}</div>` : ''}
    ${p.coverNote ? `<p class="pc-cover">${esc(p.coverNote)}</p>` : ''}
    ${p.priceLabel
      ? `<div class="pc-price">
      <span class="pc-price-label">Your price</span>
      <span class="pc-price-val">${esc(p.priceLabel)}</span>
      ${p.priceSub ? `<span class="pc-price-sub">${esc(p.priceSub)}</span>` : ''}
    </div>`
      : ''}
    ${highlights}
    <button type="button" class="pxbtn ${isOn(p.id) ? 'good' : ''}" data-pick="${esc(p.id)}">${pickLabel}</button>
  </article>`;
}

function dockHtml(): string {
  if (!cfg) return '';
  const list = cfg.plans;
  let summary = '';
  if (cfg.multiSelect) {
    const n = multiIds.size;
    const names = list.filter((p) => multiIds.has(p.id)).map((p) => p.name);
    summary =
      n === 0
        ? 'Tap cards to select — scroll sideways to compare.'
        : `<b>${n}</b> selected · ${esc(names.join(', '))}`;
  } else {
    const sel = list.find((p) => p.id === selectedId);
    summary = sel
      ? `<b>${esc(sel.name)}</b>${sel.sumLabel ? ' · ' + esc(sel.sumLabel) : ''}${sel.priceLabel ? ' · ' + esc(sel.priceLabel) : ''}`
      : 'Scroll to compare plans, then choose one.';
  }
  return `
    <div class="pc-summary">${summary}</div>
    <div class="pc-dock-acts">
      <button type="button" class="pxbtn" data-act="close">Back</button>
      <button type="button" class="pxbtn good" data-act="confirm">${esc(cfg.confirmLabel || 'Confirm choice ▶')}</button>
    </div>`;
}

function render(): void {
  if (!cfg) return;
  const el = ensureRoot();
  el.className = 'open';
  el.innerHTML = `
    <div class="pc-scene">
      <div class="pc-sky" aria-hidden="true"><canvas class="pc-bg" width="960" height="540"></canvas></div>
      <header class="pc-top">
        <div class="pc-heading">
          <span class="pc-kicker">Focus Zone</span>
          <h1>${esc(cfg.title)}</h1>
          ${cfg.subtitle ? `<p class="pc-sub">${esc(cfg.subtitle)}</p>` : ''}
        </div>
        <p class="pc-hint">Tap a plan · scroll ← → if needed</p>
      </header>
      <div class="pc-rail-wrap">
        <button type="button" class="pc-nav pc-nav-l" data-nav="-1" aria-label="Scroll left">‹</button>
        <div class="pc-rail" data-rail>
          ${cfg.plans.map(cardHtml).join('')}
        </div>
        <button type="button" class="pc-nav pc-nav-r" data-nav="1" aria-label="Scroll right">›</button>
      </div>
      <footer class="pc-dock">${dockHtml()}</footer>
    </div>`;

  paintBg();
  bind(el);
  // Center selected card
  requestAnimationFrame(() => {
    const on = el.querySelector('.pc-card.on') as HTMLElement | null;
    on?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  });
}

function refreshChrome(): void {
  if (!cfg || !root) return;
  root.querySelectorAll('.pc-card').forEach((node) => {
    const card = node as HTMLElement;
    const id = card.dataset.plan || '';
    const on = isOn(id);
    card.classList.toggle('on', on);
    card.setAttribute('aria-pressed', String(on));
    const btn = card.querySelector('[data-pick]') as HTMLButtonElement | null;
    if (btn) {
      btn.className = `pxbtn ${on ? 'good' : ''}`;
      btn.textContent = cfg!.multiSelect ? (on ? '✓ Selected' : '+ Select') : on ? '✓ Chosen' : 'Choose';
    }
  });
  const dock = root.querySelector('.pc-dock');
  if (dock) {
    dock.innerHTML = dockHtml();
    bindDock(dock as HTMLElement);
  }
}

function pick(id: string): void {
  if (!cfg) return;
  if (cfg.multiSelect) {
    if (multiIds.has(id)) multiIds.delete(id);
    else multiIds.add(id);
  } else {
    selectedId = id;
  }
  refreshChrome();
}

function bindDock(dock: HTMLElement): void {
  dock.querySelector('[data-act="close"]')?.addEventListener('click', () => {
    const closeFn = cfg?.onClose;
    closePlanChooser();
    closeFn?.();
  });
  dock.querySelector('[data-act="confirm"]')?.addEventListener('click', () => {
    if (!cfg) return;
    if (cfg.multiSelect) {
      if (!multiIds.size && !nudgeAck) {
        nudgeAck = true;
        const proceed = () => {
          const ids = [...multiIds];
          const fn = cfg?.onConfirmMulti;
          closePlanChooser();
          fn?.(ids);
        };
        showChoiceNudge({
          title: cfg.nudgeTitle || 'Nothing picked yet',
          message: cfg.emptyNudge || 'Sure you want to continue without picking anything?',
          skipLabel: 'No, continue',
          onSkip: proceed,
        });
        return;
      }
      const ids = [...multiIds];
      const fn = cfg.onConfirmMulti;
      closePlanChooser();
      fn?.(ids);
      return;
    }
    if (!selectedId) {
      showChoiceNudge({
        title: cfg.nudgeTitle || 'Pick a plan first',
        message: cfg.emptyNudge || 'Please choose the cover that suits you before moving on.',
      });
      return;
    }
    const id = selectedId;
    const fn = cfg.onConfirm;
    closePlanChooser();
    fn(id);
  });
}

function bind(el: HTMLDivElement): void {
  el.querySelectorAll('[data-pick]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.pick;
      if (id) pick(id);
    });
  });
  el.querySelectorAll('.pc-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-pick]')) return;
      const id = (card as HTMLElement).dataset.plan;
      if (id) pick(id);
    });
    card.addEventListener('keydown', (e) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter' || ke.key === ' ') {
        ke.preventDefault();
        const id = (card as HTMLElement).dataset.plan;
        if (id) pick(id);
      }
    });
  });

  const rail = el.querySelector('[data-rail]') as HTMLElement | null;
  el.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = Number((btn as HTMLElement).dataset.nav || 0);
      if (!rail) return;
      rail.scrollBy({ left: dir * Math.min(320, rail.clientWidth * 0.7), behavior: 'smooth' });
    });
  });

  bindDock(el.querySelector('.pc-dock') as HTMLElement);
}

/** Open a simple side-by-side plan Focus Zone (no multi-step wizard). */
export function openPlanChooser(config: PlanChooserConfig): void {
  open = true;
  cfg = config;
  nudgeAck = false;
  if (config.multiSelect) {
    multiIds = new Set(config.initialSelectedIds || []);
    selectedId = null;
  } else {
    // Never pre-pick a plan — the choice must be the player's own.
    selectedId = config.initialPlanId || null;
    multiIds = new Set();
  }
  const g = (window as unknown as { G?: { paused?: boolean } }).G;
  if (g) g.paused = true;
  render();
}
