/** Web Audio SFX + looping MP3 background music. */

import { assetPath } from '../config/assetPath';

type SfxName =
  | 'jump'
  | 'stomp'
  | 'coin'
  | 'hurt'
  | 'power'
  | 'desk'
  | 'confirm'
  | 'level'
  | 'click'
  | 'flag'
  | 'score';

/** BGM sits under gameplay; SFX sit above so both read clearly. */
const MUSIC_VOL = 0.32;
const SFX_MASTER = 1.35;
const MUSIC_KEY = '__eqMusicEl';

let ctx: AudioContext | null = null;
let muted = true; // off by default — user enables via title sound toggle
let musicEl: HTMLAudioElement | null = null;
let musicStarted = false;

type MusicHost = Window & { [MUSIC_KEY]?: HTMLAudioElement };

/** Stop any prior HMR / tab music instance (Audio() is not in the DOM). */
function killOrphanMusic(): void {
  if (typeof window === 'undefined') return;
  const host = window as MusicHost;
  const orphan = host[MUSIC_KEY];
  if (orphan) {
    try {
      orphan.pause();
      orphan.muted = true;
      orphan.volume = 0;
      orphan.removeAttribute('src');
      orphan.load();
    } catch {
      /* ignore */
    }
    delete host[MUSIC_KEY];
  }
}
killOrphanMusic();

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function ensureMusicEl(): HTMLAudioElement {
  if (!musicEl) {
    killOrphanMusic();
    musicEl = new Audio(assetPath('audio/Button_Mash_Management.mp3'));
    musicEl.loop = true;
    musicEl.preload = 'auto';
    musicEl.volume = muted ? 0 : MUSIC_VOL;
    musicEl.muted = muted;
    (window as MusicHost)[MUSIC_KEY] = musicEl;
  }
  return musicEl;
}

function applyMute(): void {
  if (musicEl) {
    musicEl.muted = muted;
    musicEl.volume = muted ? 0 : MUSIC_VOL;
  }
}

export function setMuted(v: boolean): void {
  muted = v;
  applyMute();
  if (muted) {
    if (musicEl) {
      musicEl.pause();
      musicStarted = false;
    }
    return;
  }
  if (musicEl && musicEl.paused) {
    void musicEl.play().catch(() => {});
  }
}

export function isMuted(): boolean {
  return muted;
}

function beep(
  freq: number,
  dur: number,
  type: OscillatorType = 'square',
  vol = 0.08,
  slide?: number,
): void {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  const v = vol * SFX_MASTER;
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide != null) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t0 + dur);
  g.gain.setValueAtTime(v, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export function playSfx(name: SfxName): void {
  switch (name) {
    case 'jump':
      beep(280, 0.12, 'square', 0.07, 520);
      break;
    case 'stomp':
      beep(160, 0.08, 'triangle', 0.1);
      beep(90, 0.14, 'square', 0.06);
      break;
    case 'coin':
      beep(880, 0.06, 'square', 0.06);
      setTimeout(() => beep(1320, 0.1, 'square', 0.05), 50);
      break;
    case 'score':
      // Short metallic clink designed to repeat rapidly during score count-up.
      // Slight pitch variation keeps a long tally from sounding mechanical.
      {
        const pitch = 1180 + Math.random() * 260;
        beep(pitch, 0.035, 'triangle', 0.045, pitch * 1.12);
        beep(pitch * 1.78, 0.024, 'sine', 0.025);
      }
      break;
    case 'hurt':
      beep(220, 0.18, 'sawtooth', 0.07, 80);
      break;
    case 'power':
      beep(440, 0.08, 'square', 0.06);
      setTimeout(() => beep(660, 0.12, 'square', 0.05), 70);
      break;
    case 'desk':
      beep(330, 0.07, 'triangle', 0.05);
      break;
    case 'confirm':
      beep(523, 0.08, 'square', 0.06);
      setTimeout(() => beep(784, 0.16, 'square', 0.05), 80);
      break;
    case 'level':
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.05), i * 90));
      break;
    case 'click':
      beep(600, 0.04, 'square', 0.035);
      break;
    case 'flag':
      beep(392, 0.1, 'triangle', 0.06);
      setTimeout(() => beep(523, 0.18, 'triangle', 0.05), 100);
      break;
  }
}

/** Looping BGM (title + gameplay). Safe to call repeatedly. */
export function startMusic(): void {
  const el = ensureMusicEl();
  applyMute();
  if (muted) return;
  // Unlock AudioContext alongside media play (browser gesture path).
  ac();
  if (musicStarted && !el.paused) return;
  const p = el.play();
  if (p && typeof p.then === 'function') {
    p.then(() => {
      musicStarted = true;
    }).catch(() => {
      // Autoplay blocked until a user gesture — next startMusic/playSfx will retry.
      musicStarted = false;
    });
  } else {
    musicStarted = true;
  }
}

export function stopMusic(): void {
  if (!musicEl) {
    killOrphanMusic();
    return;
  }
  musicEl.pause();
  musicEl.currentTime = 0;
  musicStarted = false;
  if (typeof window !== 'undefined') {
    const host = window as MusicHost;
    if (host[MUSIC_KEY] === musicEl) delete host[MUSIC_KEY];
  }
  musicEl = null;
}
