import type { DeskConfig, DeskPlan, DeskStep } from './benefitsDeskTypes';

export type { DeskConfig, DeskPlan, DeskStep } from './benefitsDeskTypes';

let deskOpen = false;
let root: HTMLDivElement | null = null;

export function isBenefitsDeskOpen(): boolean {
  return deskOpen;
}

function ensureRoot(): HTMLDivElement {
  if (root) return root;
  root = document.createElement('div');
  root.id = 'benefitsDesk';
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('role', 'dialog');
  document.getElementById('wrap')?.appendChild(root) || document.body.appendChild(root);
  return root;
}

export function closeBenefitsDesk(): void {
  deskOpen = false;
  if (root) {
    root.classList.remove('open');
    root.innerHTML = '';
  }
  const g = (window as unknown as { G?: { paused?: boolean } }).G;
  if (g) g.paused = false;
}

export function openBenefitsDesk(cfg: DeskConfig): void {
  deskOpen = true;
  const g = (window as unknown as { G?: { paused?: boolean } }).G;
  if (g) g.paused = true;

  const el = ensureRoot();
  const steps: DeskStep[] = cfg.hideCompare
    ? ['browse', 'detail', 'confirm']
    : ['browse', 'detail', 'compare', 'confirm'];
  let step: DeskStep = 'browse';
  let selectedId: string | null = cfg.initialPlanId ?? null;
  let detailId: string | null = selectedId;
  const compareIds = new Set<string>(cfg.initialCompareIds || []);
  const multiIds = new Set<string>(
    cfg.multiSelect ? cfg.initialCompareIds || (cfg.initialPlanId ? [cfg.initialPlanId] : []) : [],
  );

  const planById = (id: string) => cfg.plans.find((p) => p.id === id);

  const canConfirm = () => (cfg.multiSelect ? multiIds.size > 0 : Boolean(selectedId));

  const render = () => {
    const sel = selectedId ? planById(selectedId) : null;
    el.className = 'open';
    el.innerHTML = `
      <div class="desk-backdrop"></div>
      <div class="desk-panel">
        <header class="desk-head">
          <div>
            <div class="desk-kicker">Benefits Desk</div>
            <h2>${escapeHtml(cfg.title)}</h2>
            ${cfg.subtitle ? `<p class="desk-sub">${escapeHtml(cfg.subtitle)}</p>` : ''}
          </div>
          <button type="button" class="pxbtn small desk-close" data-act="close">Back to plaza</button>
        </header>
        <nav class="desk-steps">
          ${steps
            .map(
              (s) =>
                `<button type="button" class="desk-step${step === s ? ' on' : ''}" data-step="${s}">${labelStep(s, cfg.hideCompare)}</button>`,
            )
            .join('')}
        </nav>
        <div class="desk-body">${renderStep(step, cfg, selectedId, detailId, compareIds, multiIds, sel)}</div>
        <footer class="desk-foot">
          ${step !== 'browse' ? `<button type="button" class="pxbtn" data-act="back">← Back</button>` : '<span></span>'}
          <div class="desk-foot-right">
            ${
              step === 'browse'
                ? `${
                    cfg.hideCompare
                      ? ''
                      : `<button type="button" class="pxbtn" data-act="to-compare" ${compareIds.size < 2 ? 'disabled' : ''}>Compare (${compareIds.size})</button>`
                  }
                   <button type="button" class="pxbtn primary" data-act="to-detail" ${
                     cfg.multiSelect ? (multiIds.size ? '' : 'disabled') : selectedId ? '' : 'disabled'
                   }>View details ▶</button>`
                : ''
            }
            ${
              step === 'detail'
                ? `${cfg.hideCompare ? '' : `<button type="button" class="pxbtn" data-act="to-compare">Compare</button>`}
                   <button type="button" class="pxbtn primary" data-act="to-confirm" ${canConfirm() ? '' : 'disabled'}>Choose ▶</button>`
                : ''
            }
            ${
              step === 'compare'
                ? `<button type="button" class="pxbtn primary" data-act="to-confirm" ${canConfirm() ? '' : 'disabled'}>Choose selected ▶</button>`
                : ''
            }
            ${
              step === 'confirm'
                ? `<button type="button" class="pxbtn good" data-act="commit" ${canConfirm() ? '' : 'disabled'}>Confirm choice ✔</button>`
                : ''
            }
          </div>
        </footer>
      </div>`;

    el.querySelector('.desk-close')?.addEventListener('click', () => {
      cfg.onClose();
      closeBenefitsDesk();
    });
    el.querySelector('.desk-backdrop')?.addEventListener('click', () => {
      cfg.onClose();
      closeBenefitsDesk();
    });

    el.querySelectorAll('[data-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = (btn as HTMLElement).dataset.step as DeskStep;
        if (next === 'detail' && (cfg.multiSelect ? !multiIds.size : !selectedId)) return;
        if (next === 'confirm' && !canConfirm()) return;
        step = next;
        if (next === 'detail') detailId = selectedId || [...multiIds][0] || null;
        render();
      });
    });

    el.querySelector('[data-act="back"]')?.addEventListener('click', () => {
      const i = steps.indexOf(step);
      step = steps[Math.max(0, i - 1)];
      render();
    });
    el.querySelector('[data-act="to-detail"]')?.addEventListener('click', () => {
      detailId = selectedId || [...multiIds][0] || null;
      step = 'detail';
      render();
    });
    el.querySelector('[data-act="to-compare"]')?.addEventListener('click', () => {
      step = 'compare';
      render();
    });
    el.querySelector('[data-act="to-confirm"]')?.addEventListener('click', () => {
      step = 'confirm';
      render();
    });
    el.querySelector('[data-act="commit"]')?.addEventListener('click', () => {
      if (!canConfirm()) return;
      if (cfg.multiSelect && cfg.onConfirmMulti) cfg.onConfirmMulti([...multiIds]);
      else if (selectedId) cfg.onConfirm(selectedId);
      closeBenefitsDesk();
    });

    el.querySelectorAll('[data-pick]').forEach((card) => {
      card.addEventListener('click', () => {
        const id = (card as HTMLElement).dataset.pick || null;
        if (!id) return;
        if (cfg.multiSelect) {
          if (multiIds.has(id)) multiIds.delete(id);
          else multiIds.add(id);
          selectedId = id;
        } else {
          selectedId = id;
        }
        detailId = selectedId;
        render();
      });
    });
    el.querySelectorAll('[data-toggle-compare]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.toggleCompare!;
        if (compareIds.has(id)) compareIds.delete(id);
        else if (compareIds.size < 3) compareIds.add(id);
        render();
      });
    });
  };

  render();
}

function labelStep(s: DeskStep, hideCompare?: boolean): string {
  if (hideCompare) {
    return ({ browse: '1 · Browse', detail: '2 · Details', compare: '', confirm: '3 · Confirm' } as const)[s];
  }
  return ({ browse: '1 · Browse', detail: '2 · Details', compare: '3 · Compare', confirm: '4 · Confirm' } as const)[s];
}

function renderStep(
  step: DeskStep,
  cfg: DeskConfig,
  selectedId: string | null,
  detailId: string | null,
  compareIds: Set<string>,
  multiIds: Set<string>,
  sel: DeskPlan | null | undefined,
): string {
  if (step === 'browse') {
    return `<div class="desk-grid">${cfg.plans
      .map((p) => {
        const on = cfg.multiSelect ? multiIds.has(p.id) : p.id === selectedId;
        const inCmp = compareIds.has(p.id);
        return `<article class="desk-card${on ? ' sel' : ''}" data-pick="${escapeAttr(p.id)}">
          <div class="desk-card-top">
            <h3>${escapeHtml(p.name)}</h3>
            <span class="desk-price">${escapeHtml(p.priceLabel)}</span>
          </div>
          <p>${escapeHtml(p.shortDesc)}</p>
          <div class="desk-badges">${(p.badges || []).map((b) => `<span class="tag">${escapeHtml(b)}</span>`).join('')}</div>
          ${
            cfg.hideCompare
              ? cfg.multiSelect
                ? `<div class="muted" style="font-size:12px;">${on ? '✓ Selected' : 'Tap to select'}</div>`
                : ''
              : `<button type="button" class="pxbtn small" data-toggle-compare="${escapeAttr(p.id)}">${inCmp ? '✓ In compare' : '+ Compare'}</button>`
          }
        </article>`;
      })
      .join('')}</div>`;
  }

  if (step === 'detail') {
    const ids = cfg.multiSelect && multiIds.size ? [...multiIds] : detailId ? [detailId] : selectedId ? [selectedId] : [];
    if (!ids.length) return '<p class="muted">Select a plan first.</p>';
    return ids
      .map((id) => {
        const p = planOrNull(cfg, id);
        if (!p) return '';
        return `<div class="desk-detail" style="margin-bottom:18px;">
      <h3>${escapeHtml(p.name)}</h3>
      <p class="desk-price">${escapeHtml(p.priceLabel)}</p>
      <p>${escapeHtml(p.shortDesc)}</p>
      <div class="desk-cols">
        <section><h4 class="ok">Covered</h4><ul>${p.detail.covered.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></section>
        <section><h4 class="no">Not covered / limits</h4><ul>${p.detail.notCovered.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></section>
      </div>
      ${p.detail.notes.length ? `<section class="desk-notes"><h4>Notes</h4><ul>${p.detail.notes.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></section>` : ''}
    </div>`;
      })
      .join('');
  }

  if (step === 'compare') {
    const cols = [...compareIds].map((id) => cfg.plans.find((p) => p.id === id)).filter(Boolean) as DeskPlan[];
    if (cols.length < 2) {
      return `<p class="muted">Pick at least two plans with “+ Compare” on the Browse step.</p>`;
    }
    const keys = cfg.compareKeys;
    return `<div class="desk-compare-wrap"><table class="desk-compare">
      <thead><tr><th></th>${cols.map((p) => `<th class="${p.id === selectedId ? 'sel' : ''}" data-pick="${escapeAttr(p.id)}">${escapeHtml(p.name)}<div class="desk-price">${escapeHtml(p.priceLabel)}</div></th>`).join('')}</tr></thead>
      <tbody>
        ${keys
          .map(
            (k) =>
              `<tr><th>${escapeHtml(k.label)}</th>${cols
                .map((p) => `<td>${escapeHtml(String(p.compare[k.key] ?? '—'))}</td>`)
                .join('')}</tr>`,
          )
          .join('')}
      </tbody>
    </table>
    <p class="muted" style="margin-top:12px;">Click a column header to select that plan.</p></div>`;
  }

  // confirm
  if (cfg.multiSelect) {
    const picks = [...multiIds].map((id) => planOrNull(cfg, id)).filter(Boolean) as DeskPlan[];
    if (!picks.length) return '<p class="muted">Select at least one option.</p>';
    return `<div class="desk-confirm">
      <p>You're choosing:</p>
      <ul>${picks.map((p) => `<li><b class="gd">${escapeHtml(p.name)}</b> — ${escapeHtml(p.priceLabel)}</li>`).join('')}</ul>
      <p class="muted">You can change this later by returning to the desk in this level.</p>
    </div>`;
  }
  if (!sel) return '<p class="muted">Select a plan first.</p>';
  return `<div class="desk-confirm">
    <p>You're choosing:</p>
    <h3 class="gd">${escapeHtml(sel.name)}</h3>
    <p class="desk-price">${escapeHtml(sel.priceLabel)}</p>
    <p>${escapeHtml(sel.shortDesc)}</p>
    <ul>${sel.detail.covered
      .slice(0, 4)
      .map((x) => `<li>${escapeHtml(x)}</li>`)
      .join('')}</ul>
    <p class="muted">You can change this later by returning to the desk in this level.</p>
  </div>`;
}

function planOrNull(cfg: DeskConfig, id: string): DeskPlan | undefined {
  return cfg.plans.find((p) => p.id === id);
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
