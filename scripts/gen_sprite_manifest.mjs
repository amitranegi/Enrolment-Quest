#!/usr/bin/env node
/**
 * Write public/sprites/manifest.json from the PNGs on disk.
 * Run automatically before `vite build`.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../public/sprites');
const keys = readdirSync(dir)
  .filter((f) => f.endsWith('.png'))
  .map((f) => f.replace(/\.png$/i, ''))
  .sort();
writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ keys, ver: process.env.VITE_SPRITE_VER || '20260807a' }, null, 2) + '\n');
console.log(`[manifest] ${keys.length} sprites → public/sprites/manifest.json`);
