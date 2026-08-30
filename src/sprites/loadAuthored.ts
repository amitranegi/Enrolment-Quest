/**
 * Authored sprite boot loader.
 * Only fetches keys that exist under public/sprites (see manifest.json).
 * Uses cache-friendly URLs so repeat visits are fast.
 */

import { assetPath } from '../config/assetPath';

const SPRITES_BASE = assetPath('sprites');

export type SpriteDefMap = Record<
  string,
  { w: number; h: number; frames: number; label?: string; group?: string }
>;

/** Bump when replacing public/sprites so clients refresh once. */
export const SPRITE_ASSET_VER =
  (import.meta.env.VITE_SPRITE_VER as string | undefined) || '20260807a';

type ProgressFn = (done: number, total: number, key: string) => void;

let cachedManifest: string[] | null = null;

/** Keys present in public/sprites — avoids dozens of 404 probes on boot. */
export async function loadSpriteManifest(
  basePath = SPRITES_BASE,
): Promise<string[]> {
  if (cachedManifest) return cachedManifest;
  try {
    const res = await fetch(
      `${basePath.replace(/\/$/, '')}/manifest.json?v=${SPRITE_ASSET_VER}`,
      { cache: 'force-cache' },
    );
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { keys?: string[] } | string[];
    const keys = Array.isArray(data) ? data : data.keys || [];
    cachedManifest = keys.filter((k) => typeof k === 'string');
    return cachedManifest;
  } catch {
    cachedManifest = [];
    return cachedManifest;
  }
}

export function authoredUrl(key: string, basePath = SPRITES_BASE): string {
  return `${basePath.replace(/\/$/, '')}/${key}.png?v=${SPRITE_ASSET_VER}`;
}

/** Load a PNG into an HTMLImageElement (browser HTTP cache friendly). */
export function fetchAuthoredImage(
  key: string,
  basePath = SPRITES_BASE,
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = authoredUrl(key, basePath);
  });
}

/** @deprecated Prefer fetchAuthoredImage — kept for Studio reset path. */
export async function fetchAuthoredStrip(
  key: string,
  basePath = SPRITES_BASE,
): Promise<string | null> {
  try {
    const res = await fetch(authoredUrl(key, basePath), { cache: 'force-cache' });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/') && blob.type !== '') return null;
    return await blobToDataURL(blob);
  } catch {
    return null;
  }
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await worker(items[i], i);
    }
  };
  const n = Math.min(concurrency, Math.max(1, items.length));
  await Promise.all(Array.from({ length: n }, () => run()));
  return out;
}

/**
 * Load authored PNGs for the given keys (parallel).
 * `applyImage` should decode the HTMLImageElement into Sprites.frames.
 */
export async function loadAuthoredKeys(
  keys: string[],
  applyImage: (key: string, img: HTMLImageElement) => Promise<boolean>,
  onProgress?: ProgressFn,
  concurrency = 8,
): Promise<string[]> {
  const loaded: string[] = [];
  let done = 0;
  const total = keys.length || 1;
  await mapPool(keys, concurrency, async (key) => {
    const img = await fetchAuthoredImage(key);
    done++;
    onProgress?.(done, total, key);
    if (!img) return;
    const ok = await applyImage(key, img);
    if (ok) loaded.push(key);
  });
  return loaded;
}

/** Title / first paint — show home screen ASAP. */
export const BOOT_TITLE_KEYS = ['bg_title'] as const;

/** Needed before first level / setup. */
export const BOOT_PLAY_KEYS = [
  'bg_setup',
  'bg_l1',
  'parallax_l1_far',
  'parallax_l1_mid',
  'parallax_l1_near',
  'landmark_l1_start',
  'landmark_l1_end',
  'cloud',
  'tile_top',
  'tile_ground',
  'tile_platform',
  'tile_brick',
  'tile_metal',
  'enemy_sneezy',
  'enemy_bill',
  'enemy_junk',
  'enemy_bone',
  'enemy_bone_pile',
  'enemy_denier',
  'enemy_spike',
  'pickup_kit',
  'pickup_beam',
  'pickup_shield',
  'fx_seal',
  'fx_beam',
  'family_front',
  'family_front_child',
] as const;

/** Loaded in background on the title screen (L2+ / summary). */
export const BOOT_DEFER_KEYS = [
  'bg_l2',
  'bg_l3',
  'bg_complete',
  'parallax_l2_far',
  'parallax_l2_mid',
  'parallax_l2_near',
  'parallax_l3_far',
  'parallax_l3_mid',
  'parallax_l3_near',
  'landmark_l2_start',
  'landmark_l2_end',
  'landmark_l3_start',
  'landmark_l3_end',
] as const;

/** Intersection of manifest ∩ requested keys (stable order). */
export function filterManifest(manifest: string[], wanted: readonly string[]): string[] {
  const have = new Set(manifest);
  return wanted.filter((k) => have.has(k));
}
