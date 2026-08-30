/**
 * Shared "make a choice" prompt for the Focus Zones.
 *
 * Hard gate  — one button; the player cannot continue until they pick something.
 * Soft gate  — two buttons; picking is encouraged but skipping stays possible.
 */

export type ChoiceNudgeOptions = {
  /** Short headline, e.g. "Add a plan first". */
  title: string;
  /** One concise line asking for the choice. */
  message: string;
  /** Label for the primary (keep choosing) button. */
  addLabel?: string;
  /** Soft gate only — label for the skip button. */
  skipLabel?: string;
  /** Soft gate only — called when the player skips anyway. */
  onSkip?: () => void;
};

let host: HTMLDivElement | null = null;
let lastFocus: HTMLElement | null = null;

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function closeChoiceNudge(): void {
  if (host) {
    host.remove();
    host = null;
  }
  document.removeEventListener('keydown', onKey, true);
  lastFocus?.focus?.();
  lastFocus = null;
}

function onKey(e: KeyboardEvent): void {
  if (e.key !== 'Escape' || !host) return;
  e.preventDefault();
  e.stopPropagation();
  closeChoiceNudge();
}

export function showChoiceNudge(opts: ChoiceNudgeOptions): void {
  closeChoiceNudge();
  lastFocus = document.activeElement as HTMLElement | null;

  const soft = typeof opts.onSkip === 'function';
  const addLabel = opts.addLabel || (soft ? 'Yes, let me add' : 'Got it');
  const skipLabel = opts.skipLabel || 'No, continue';

  host = document.createElement('div');
  host.className = 'cnudge';
  host.innerHTML = `
    <div class="cnudge-scrim"></div>
    <div class="cnudge-card" role="alertdialog" aria-modal="true" aria-labelledby="cnudgeTitle" aria-describedby="cnudgeMsg">
      <div class="cnudge-mark" aria-hidden="true">!</div>
      <h2 id="cnudgeTitle">${esc(opts.title)}</h2>
      <p id="cnudgeMsg">${esc(opts.message)}</p>
      <div class="cnudge-acts">
        <button type="button" class="pxbtn good" data-act="add">${esc(addLabel)}</button>
        ${soft ? `<button type="button" class="pxbtn" data-act="skip">${esc(skipLabel)}</button>` : ''}
      </div>
    </div>`;

  (document.getElementById('wrap') || document.body).appendChild(host);

  host.querySelector('[data-act="add"]')?.addEventListener('click', () => closeChoiceNudge());
  host.querySelector('[data-act="skip"]')?.addEventListener('click', () => {
    const skip = opts.onSkip;
    closeChoiceNudge();
    skip?.();
  });
  host.querySelector('.cnudge-scrim')?.addEventListener('click', () => closeChoiceNudge());
  document.addEventListener('keydown', onKey, true);

  requestAnimationFrame(() => {
    (host?.querySelector('[data-act="add"]') as HTMLElement | null)?.focus();
  });
}
