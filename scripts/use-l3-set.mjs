#!/usr/bin/env node
/**
 * Install L3 Bangalore garden-bazaar playable pack into public/sprites.
 * Usage: node scripts/use-l3-set.mjs
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'assets/sprites/_wip/l3_playable_day');
const dest = join(root, 'public/sprites');

if (!existsSync(src)) {
  console.error('Missing', src);
  console.error('Run: npm run export:l3-playable');
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
const keys = [
  'bg_l3',
  'parallax_l3_far',
  'parallax_l3_mid',
  'parallax_l3_near',
  'landmark_l3_start',
  'landmark_l3_end',
];

for (const key of keys) {
  const from = join(src, `${key}.png`);
  if (!existsSync(from)) {
    console.warn('Skip missing', key);
    continue;
  }
  cpSync(from, join(dest, `${key}.png`));
}

console.log('Installed L3 Bangalore garden-bazaar pack → public/sprites/');
console.log('Hard-refresh (Cmd+Shift+R).');
console.log(
  'Files:',
  readdirSync(dest)
    .filter((f) => f.includes('l3'))
    .sort()
    .join(', '),
);
