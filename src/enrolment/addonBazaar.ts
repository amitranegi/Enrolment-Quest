import type { AddonBazaarConfig, AddonCard } from './addonBazaarTypes';
import { showChoiceNudge, closeChoiceNudge } from './choiceNudge';

export type { AddonBazaarConfig, AddonCard, AddonFeature } from './addonBazaarTypes';

let open = false;
let root: HTMLDivElement | null = null;
let cfg: AddonBazaarConfig | null = null;
let selected = new Set<string>();
let detailId: string | null = null;
let nudgeAck = false;

export function isAddonBazaarOpen(): boolean {
  return open;
}

function ensureRoot(): HTMLDivElement {
  if (root && root.isConnected) return root;
  if (root && !root.isConnected) {
    (document.getElementById('wrap') || document.body).appendChild(root);
    return root;
  }
  root = document.createElement('div');
  root.id = 'addonZone';
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

export function closeAddonBazaar(): void {
  open = false;
  cfg = null;
  selected = new Set();
  detailId = null;
  nudgeAck = false;
  closeChoiceNudge();
  if (root) {
    root.className = '';
    root.innerHTML = '';
  }
}

function paintBg(): void {
  if (!cfg?.paintBackground || !root) return;
  const cv = root.querySelector('canvas.az-bg') as HTMLCanvasElement | null;
  if (!cv) return;
  const host = root.querySelector('.az-scene') as HTMLElement | null;
  const w = Math.max(2, Math.floor(host?.clientWidth || root.clientWidth || 960));
  const h = Math.max(2, Math.floor(host?.clientHeight || root.clientHeight || 540));
  if (cv.width !== w || cv.height !== h) {
    cv.width = w;
    cv.height = h;
  }
  cfg.paintBackground(cv);
}

function isOn(id: string): boolean {
  return selected.has(id);
}

function toneClass(tone?: string): string {
  return ` tone-${esc(tone || 'default')}`;
}

function cardHtml(c: AddonCard): string {
  const on = isOn(c.id);
  const badgeTone = c.badgeTone ? ` badge-${esc(c.badgeTone)}` : '';
  const promo = c.promo ? ' promo' : '';
  const hasArt = !!c.imageUrl;
  const media = c.imageUrl
    ? `<img class="az-art" src="${esc(c.imageUrl)}" alt="" data-art-fallback="${esc(c.id)}" hidden>`
    : '';
  return `<article class="az-card${on ? ' on' : ''}${toneClass(c.tone)}${promo}" data-addon="${esc(c.id)}" tabindex="0" role="button" aria-pressed="${on}">
    <div class="az-head${hasArt ? ' has-art' : ''}" aria-hidden="true">
      ${c.badge ? `<div class="az-badge${badgeTone}">${esc(c.badge)}</div>` : ''}
      ${hasArt ? '' : `<span class="az-brand">${esc(c.brand || 'Add-on')}</span>`}
      ${media}
      <div class="az-icon" data-icon="${esc(c.id)}"></div>
    </div>
    <div class="az-body">
      <h2>${esc(c.name)}</h2>
      <p class="az-desc">${esc(c.desc)}</p>
      <button type="button" class="az-details" data-details="${esc(c.id)}">Plan Details ›</button>
      ${c.priceLabel
        ? `<div class="az-price">
        <span class="az-price-label">Premium per year starts from</span>
        <span class="az-price-row">
          <span class="az-price-val">${esc(c.priceLabel)}</span>
          ${c.priceUnit ? `<span class="az-price-unit">${esc(c.priceUnit)}</span>` : ''}
        </span>
        ${c.priceSub ? `<span class="az-price-sub">${esc(c.priceSub)}</span>` : ''}
      </div>`
        : ''}
      <div class="az-foot">
        <div class="az-foot-r">
          ${c.optionsLabel ? `<span class="az-opts">${esc(c.optionsLabel)}</span>` : ''}
          <button type="button" class="az-add ${on ? 'on' : ''}" data-pick="${esc(c.id)}">
            ${on ? '✓ Added' : '+ Add Benefit'}
          </button>
        </div>
      </div>
    </div>
  </article>`;
}

function dockHtml(): string {
  if (!cfg) return '';
  const n = selected.size;
  const names = cfg.cards.filter((c) => selected.has(c.id)).map((c) => c.name);
  const summary =
    n === 0
      ? 'Nothing added yet — browse the cards and add what you would actually use.'
      : `<b>${n}</b> selected · ${esc(names.join(', '))}`;
  return `
    <div class="az-summary">${summary}</div>
    <div class="az-dock-acts">
      <button type="button" class="pxbtn" data-act="close">Back</button>
      <button type="button" class="pxbtn good" data-act="confirm">${esc(cfg.confirmLabel || 'Confirm & continue ▶')}</button>
    </div>`;
}

function detailHtml(): string {
  if (!cfg || !detailId) return '';
  const card = cfg.cards.find((c) => c.id === detailId);
  if (!card) return '';
  const feats =
    card.features && card.features.length
      ? `<ul class="az-sheet-feats">${card.features
          .map(
            (f) =>
              `<li><span>${esc(f.label)}</span><b>${esc(f.value)}</b></li>`,
          )
          .join('')}</ul>`
      : card.bullets && card.bullets.length
        ? `<ul class="az-sheet-bullets">${card.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
        : `<p class="az-sheet-desc">${esc(card.desc)}</p>`;
  return `
    <div class="az-sheet-scrim" data-sheet-close></div>
    <aside class="az-sheet" role="dialog" aria-label="Plan details">
      <header class="az-sheet-top">
        <div>
          <span class="az-kicker">Plan details</span>
          <h2>${esc(card.name)}</h2>
        </div>
        <button type="button" class="pxbtn" data-sheet-close>Close</button>
      </header>
      <div class="az-sheet-body">
        <p class="az-sheet-desc">${esc(card.desc)}</p>
        ${feats}
        ${card.priceLabel
          ? `<div class="az-price">
          <span class="az-price-label">Premium per year starts from</span>
          <span class="az-price-row">
            <span class="az-price-val">${esc(card.priceLabel)}</span>
            ${card.priceUnit ? `<span class="az-price-unit">${esc(card.priceUnit)}</span>` : ''}
          </span>
        </div>`
          : ''}
      </div>
      <footer class="az-sheet-foot">
        <button type="button" class="az-add ${isOn(card.id) ? 'on' : ''}" data-pick="${esc(card.id)}">
          ${isOn(card.id) ? '✓ Added' : '+ Add Benefit'}
        </button>
      </footer>
    </aside>`;
}

function paintIcons(el: HTMLElement): void {
  el.querySelectorAll('.az-art[data-art-fallback]').forEach((node) => {
    const img = node as HTMLImageElement;
    img.addEventListener(
      'load',
      () => {
        img.hidden = false;
        const icon = img.parentElement?.querySelector('.az-icon') as HTMLElement | null;
        if (icon) icon.style.display = 'none';
      },
      { once: true },
    );
    img.addEventListener(
      'error',
      () => {
        img.remove();
      },
      { once: true },
    );
    // Kick load for cached images
    if (img.complete && img.naturalWidth > 0) {
      img.hidden = false;
      const icon = img.parentElement?.querySelector('.az-icon') as HTMLElement | null;
      if (icon) icon.style.display = 'none';
    }
  });

  el.querySelectorAll('.az-icon[data-icon]').forEach((node) => {
    const host = node as HTMLElement;
    if (host.style.display === 'none') return;
    const id = host.dataset.icon || '';
    const cv = document.createElement('canvas');
    cv.width = 96;
    cv.height = 96;
    cv.className = 'az-icon-cv';
    const g = cv.getContext('2d');
    if (!g) return;
    g.imageSmoothingEnabled = false;
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.beginPath();
    g.arc(48, 48, 36, 0, Math.PI * 2);
    g.fill();
    drawMiniIcon(g, id, 48, 48, 3.1);
    host.innerHTML = '';
    host.appendChild(cv);
  });
}

/** Lightweight icons matching in-world add-on boards. */
function drawMiniIcon(g: CanvasRenderingContext2D, id: string, cx: number, cy: number, sc: number): void {
  g.save();
  g.translate(cx, cy);
  g.scale(sc, sc);
  if (id === 'womens_care') {
    g.strokeStyle = '#fff0f8';
    g.lineWidth = 2.4;
    g.beginPath();
    g.arc(0, -3, 5, 0, 7);
    g.stroke();
    g.beginPath();
    g.moveTo(0, 2);
    g.lineTo(0, 9);
    g.moveTo(-3.5, 5.5);
    g.lineTo(3.5, 5.5);
    g.stroke();
  } else if (id === 'dental_vision') {
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(-3, -2, 5, Math.PI, 0);
    g.arc(3, -2, 5, Math.PI, 0);
    g.lineTo(6, 4);
    g.lineTo(3, 9);
    g.lineTo(1, 4);
    g.lineTo(-1, 9);
    g.lineTo(-4, 4);
    g.closePath();
    g.fill();
  } else if (id === 'opd_wallet') {
    g.fillStyle = '#c98a2e';
    g.fillRect(-9, -6, 18, 13);
    g.fillStyle = '#e8b054';
    g.fillRect(-9, -6, 18, 4);
    g.fillStyle = '#2a1a08';
    g.font = 'bold 10px monospace';
    g.textAlign = 'center';
    g.fillText('₹', 0, 6);
  } else if (id === 'ultrahuman_ring') {
    g.strokeStyle = '#fff';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(0, 0, 8, 0, 7);
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.55)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(0, 0, 4, 0, 7);
    g.stroke();
  } else if (id === 'annual_check') {
    g.strokeStyle = '#fff';
    g.lineWidth = 2.2;
    g.beginPath();
    g.arc(-4, -1, 4, 0, 7);
    g.stroke();
    g.beginPath();
    g.moveTo(0, -1);
    g.lineTo(7, -1);
    g.lineTo(7, 5);
    g.stroke();
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(7, 6.5, 2.2, 0, 7);
    g.fill();
  } else if (id === 'parent_screen') {
    g.fillStyle = '#ff5d6c';
    g.beginPath();
    g.arc(-3.5, -2, 4.5, 0, 7);
    g.arc(3.5, -2, 4.5, 0, 7);
    g.moveTo(-7.5, 0);
    g.lineTo(0, 9);
    g.lineTo(7.5, 0);
    g.closePath();
    g.fill();
  } else {
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(0, 0, 8, 0, 7);
    g.fill();
  }
  g.restore();
}

function render(): void {
  if (!cfg) return;
  const el = ensureRoot();
  el.className = 'open';
  el.innerHTML = `
    <div class="az-scene">
      <div class="az-sky" aria-hidden="true"><canvas class="az-bg" width="960" height="540"></canvas></div>
      <header class="az-top">
        <div class="az-heading">
          <span class="az-kicker">Focus Zone · Level 3</span>
          <h1>${esc(cfg.title)}</h1>
          ${cfg.subtitle ? `<p class="az-sub">${esc(cfg.subtitle)}</p>` : ''}
        </div>
        <p class="az-hint">Scroll ↓ · tap + Add on any card</p>
      </header>
      <div class="az-grid-wrap">
        <div class="az-grid" data-grid>
          ${cfg.cards.map(cardHtml).join('')}
        </div>
      </div>
      <footer class="az-dock">${dockHtml()}</footer>
      <div class="az-sheet-host" data-sheet-host>${detailHtml()}</div>
    </div>`;

  paintBg();
  paintIcons(el);
  bind(el);
}

function refreshChrome(): void {
  if (!cfg || !root) return;
  root.querySelectorAll('.az-card').forEach((node) => {
    const card = node as HTMLElement;
    const id = card.dataset.addon || '';
    const on = isOn(id);
    card.classList.toggle('on', on);
    card.setAttribute('aria-pressed', String(on));
    const btn = card.querySelector('[data-pick]') as HTMLButtonElement | null;
    if (btn) {
      btn.className = `az-add ${on ? 'on' : ''}`;
      btn.textContent = on ? '✓ Added' : '+ Add Benefit';
    }
  });
  const dock = root.querySelector('.az-dock');
  if (dock) {
    dock.innerHTML = dockHtml();
    bindDock(dock as HTMLElement);
  }
  const host = root.querySelector('[data-sheet-host]');
  if (host) {
    host.innerHTML = detailHtml();
    bindSheet(host as HTMLElement);
  }
}

function toggle(id: string): void {
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  refreshChrome();
}

function openDetails(id: string): void {
  detailId = id;
  refreshChrome();
}

function closeDetails(): void {
  detailId = null;
  refreshChrome();
}

function bindDock(dock: HTMLElement): void {
  dock.querySelector('[data-act="close"]')?.addEventListener('click', () => {
    const closeFn = cfg?.onClose;
    closeAddonBazaar();
    closeFn?.();
  });
  dock.querySelector('[data-act="confirm"]')?.addEventListener('click', () => {
    if (!cfg) return;
    if (!selected.size && !nudgeAck) {
      nudgeAck = true;
      showChoiceNudge({
        title: cfg.nudgeTitle || 'No add-ons yet',
        message: cfg.emptyNudge || 'Sure you want to skip? Add the wellness benefits you would actually use.',
        skipLabel: 'No, continue',
        onSkip: () => {
          const ids = [...selected];
          const fn = cfg?.onConfirm;
          closeAddonBazaar();
          fn?.(ids);
        },
      });
      return;
    }
    const ids = [...selected];
    const fn = cfg.onConfirm;
    closeAddonBazaar();
    fn(ids);
  });
}

function bindSheet(host: HTMLElement): void {
  host.querySelectorAll('[data-sheet-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeDetails());
  });
  host.querySelectorAll('[data-pick]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.pick;
      if (id) toggle(id);
    });
  });
}

function bind(el: HTMLDivElement): void {
  el.querySelectorAll('.az-grid [data-pick]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.pick;
      if (id) toggle(id);
    });
  });
  el.querySelectorAll('[data-details]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.details;
      if (id) openDetails(id);
    });
  });
  el.querySelectorAll('.az-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-pick],[data-details]')) return;
      const id = (card as HTMLElement).dataset.addon;
      if (id) toggle(id);
    });
    card.addEventListener('keydown', (e) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter' || ke.key === ' ') {
        ke.preventDefault();
        const id = (card as HTMLElement).dataset.addon;
        if (id) toggle(id);
      }
    });
  });

  bindDock(el.querySelector('.az-dock') as HTMLElement);
  bindSheet(el.querySelector('[data-sheet-host]') as HTMLElement);
}

/** Open the Wellbeing Bazaar add-on Focus Zone (multi-pick, optional). */
export function openAddonBazaar(config: AddonBazaarConfig): void {
  open = true;
  cfg = config;
  selected = new Set(config.initialSelectedIds || []);
  detailId = null;
  nudgeAck = false;
  const g = (window as unknown as { G?: { paused?: boolean } }).G;
  if (g) g.paused = true;
  render();
}
