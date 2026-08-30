#!/usr/bin/env node
/**
 * Install an L1 playable art set into public/sprites.
 * Usage: node scripts/use-l1-set.mjs day|night
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sets = {
  day: 'l1_playable_day',
  night: 'l1_playable_night',
  a: 'l1_playable_day',
  b: 'l1_playable_night',
};

const which = (process.argv[2] || '').toLowerCase();
if (!sets[which]) {
  console.error('Usage: node scripts/use-l1-set.mjs day|night');
  process.exit(1);
}

const folder = sets[which];
const src = join(root, 'assets/sprites/_wip', folder);
const dest = join(root, 'public/sprites');
if (!existsSync(src)) {
  console.error('Missing set folder:', src);
  console.error('Run: python3 scripts/export_l1_playable.py');
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
const keys = [
  'bg_l1',
  'parallax_l1_far',
  'parallax_l1_mid',
  'parallax_l1_near',
  'cloud',
  'tile_top',
  'tile_ground',
  'tile_platform',
  'tile_brick',
  'tile_metal',
  'landmark_l1_start',
  'landmark_l1_end',
];

for (const key of keys) {
  const from = join(src, `${key}.png`);
  if (!existsSync(from)) {
    console.warn('Skip missing:', key);
    continue;
  }
  cpSync(from, join(dest, `${key}.png`));
}

const completeSrc = join(root, 'assets/sprites/_wip/world_neem_morning/bg_complete.png');
if (existsSync(completeSrc)) {
  cpSync(completeSrc, join(dest, 'bg_complete.png'));
}

console.log(`Installed ${which} (${folder}) → public/sprites/`);
console.log('Hard-refresh (Cmd+Shift+R). Authored fetch uses cache:no-store.');
console.log('Files:', readdirSync(dest).filter((f) => f.endsWith('.png')).sort().join(', '));
