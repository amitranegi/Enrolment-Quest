#!/usr/bin/env node
/**
 * Install L2 Clinic Highlands playable pack into public/sprites (keeps L1 files).
 * Usage: node scripts/use-l2-set.mjs
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'assets/sprites/_wip/l2_playable_day');
const dest = join(root, 'public/sprites');

if (!existsSync(src)) {
  console.error('Missing', src);
  console.error('Run: python3 scripts/export_l2_playable.py');
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
const keys = [
  'bg_l2',
  'parallax_l2_far',
  'parallax_l2_mid',
  'parallax_l2_near',
  'landmark_l2_start',
  'landmark_l2_end',
];

for (const key of keys) {
  const from = join(src, `${key}.png`);
  if (!existsSync(from)) {
    console.warn('Skip missing', key);
    continue;
  }
  cpSync(from, join(dest, `${key}.png`));
}

// Also refresh oversized L1 cottage from day pack if present
const cottage = join(root, 'assets/sprites/_wip/l1_playable_day/landmark_l1_end.png');
if (existsSync(cottage)) cpSync(cottage, join(dest, 'landmark_l1_end.png'));

console.log('Installed L2 day pack (+ refreshed L1 cottage) → public/sprites/');
console.log('Hard-refresh (Cmd+Shift+R).');
console.log('Files:', readdirSync(dest).filter((f) => f.endsWith('.png')).sort().join(', '));
