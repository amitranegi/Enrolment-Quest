#!/usr/bin/env node
/**
 * Static audit of level geometry in src/game/legacy.ts.
 *
 * Flags the three failure modes that are invisible in the level data but
 * obvious while playing:
 *   1. Enemies whose patrol zone sits under a ceiling too low to stomp them.
 *   2. Bricks / platforms / movers occupying the same cells.
 *   3. Standable surfaces you can jump onto but not jump back off of.
 *
 * Usage: node scripts/check_level_layout.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(join(ROOT, 'src/game/legacy.ts'), 'utf8');

const TILE = 32;
const GROUND_Y = 448;

// Player physics (must mirror legacy.ts)
const P_W = 22, P_H = 30;
const JUMP_VY = 11.8, GRAV = 0.58, MAX_SPD = 3.4;

/** Discrete rise: vy is incremented before the move each frame. */
function maxRise() {
  let v = -JUMP_VY, rise = 0;
  for (;;) {
    v += GRAV;
    if (v >= 0) break;
    rise -= v;
  }
  return rise;
}
function airFrames() {
  let v = -JUMP_VY, y = 0, f = 0;
  for (;;) { v += GRAV; y += v; f++; if (y >= 0) break; }
  return f;
}
const MAX_RISE = maxRise();               // ~114px
const MAX_RUN = airFrames() * MAX_SPD;    // ~136px

function extractLiteral(name) {
  const start = SRC.indexOf(`const ${name} = [`);
  if (start < 0) throw new Error(`missing ${name}`);
  const open = SRC.indexOf('[', start);
  let depth = 0, i = open;
  for (; i < SRC.length; i++) {
    const c = SRC[i];
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) break; }
  }
  const body = SRC.slice(open, i + 1);
  return eval(`(${body})`); // level data is plain literals
}
function extractObject(name) {
  const start = SRC.indexOf(`const ${name}=`);
  const open = SRC.indexOf('{', start);
  let depth = 0, i = open;
  for (; i < SRC.length; i++) {
    const c = SRC[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) break; }
  }
  return eval(`(${SRC.slice(open, i + 1)})`);
}

const ETYPES = extractObject('ETYPES');
const ROSTERS = [
  { name: 'FULL', levels: extractLiteral('LEVELS_FULL'), extra: extractLiteral('EXTRA_ENEMIES_FULL') },
  { name: 'COMPACT', levels: extractLiteral('LEVELS_COMPACT'), extra: extractLiteral('EXTRA_ENEMIES_COMPACT') },
];

/** Solid boxes in pixels, mirroring buildLevel(). */
function buildBoxes(L) {
  const boxes = [];
  let cx = 0;
  const gaps = [...(L.gaps || [])].sort((a, b) => a.x - b.x);
  for (const g of gaps) {
    if (g.x > cx) boxes.push({ kind: 'ground', x: cx * TILE, y: GROUND_Y, w: (g.x - cx) * TILE, h: 92 });
    cx = g.x + g.w;
  }
  if (cx < L.width) boxes.push({ kind: 'ground', x: cx * TILE, y: GROUND_Y, w: (L.width - cx) * TILE, h: 92 });
  for (const p of L.platforms || []) boxes.push({ kind: 'platform', x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, h: TILE });
  for (const b of L.bricks || []) {
    for (let k = 0; k < b.w; k++) {
      boxes.push({ kind: 'brick', type: b.type, x: (b.x + k) * TILE, y: b.y * TILE, w: TILE, h: TILE });
    }
  }
  for (const m of L.movers || []) {
    boxes.push({ kind: 'mover', x: m.x * TILE, y: m.y * TILE, w: m.w * TILE, h: TILE, range: m.range * TILE });
  }
  return boxes;
}

/** Lowest ceiling above ground at tile column c (pixel y of its bottom edge), or null. */
function ceilingAt(boxes, c) {
  const px = c * TILE + TILE / 2;
  let best = null;
  for (const b of boxes) {
    if (b.kind === 'ground') continue;
    if (px < b.x || px >= b.x + b.w) continue;
    const bottom = b.y + b.h;
    if (bottom > GROUND_Y) continue;
    if (best === null || bottom > best) best = bottom; // lowest = largest y
  }
  return best;
}

function groundAt(boxes, c) {
  const px = c * TILE + TILE / 2;
  return boxes.some(b => b.kind === 'ground' && px >= b.x && px < b.x + b.w);
}

/** Patrol span: enemies reverse at ledges and walls. */
function patrolSpan(boxes, L, startTile) {
  let l = startTile, r = startTile;
  while (l - 1 >= 0 && groundAt(boxes, l - 1)) l--;
  while (r + 1 < L.width && groundAt(boxes, r + 1)) r++;
  return [l, r];
}

const problems = [];
function report(roster, level, kind, msg) {
  problems.push({ roster, level, kind, msg });
}

for (const { name: roster, levels, extra } of ROSTERS) {
  levels.forEach((L, idx) => {
    const boxes = buildBoxes(L);

    // ---- 1. cell collisions -------------------------------------------
    const cells = new Map();
    for (const b of boxes) {
      if (b.kind === 'ground') continue;
      const c0 = Math.round(b.x / TILE), r0 = Math.round(b.y / TILE);
      const cw = Math.round(b.w / TILE);
      for (let k = 0; k < cw; k++) {
        const key = `${c0 + k},${r0}`;
        if (cells.has(key)) {
          report(roster, L.id, 'overlap',
            `${cells.get(key)} and ${b.kind} share tile (${c0 + k},${r0})`);
        } else cells.set(key, b.kind);
      }
    }
    // mover travel path vs static solids
    for (const m of boxes.filter(b => b.kind === 'mover')) {
      const c0 = Math.round(m.x / TILE), cw = Math.round(m.w / TILE);
      const reach = Math.round(m.range / TILE);
      const r = Math.round(m.y / TILE);
      for (let step = 0; step <= reach; step++) {
        for (let k = 0; k < cw; k++) {
          const key = `${c0 + step + k},${r}`;
          const occ = cells.get(key);
          if (occ && occ !== 'mover') {
            report(roster, L.id, 'mover',
              `mover at x${c0} reaches tile (${c0 + step + k},${r}) occupied by ${occ}`);
          }
        }
      }
    }

    // ---- 1b. bricks stacked flush against platforms ---------------------
    // A brick sitting on a platform's walking surface blocks the route along
    // it; a brick buried under a platform has an unusable top.
    for (const [key, kind] of cells) {
      if (kind !== 'brick') continue;
      const [c, r] = key.split(',').map(Number);
      if (cells.get(`${c},${r + 1}`) === 'platform') {
        report(roster, L.id, 'wall', `brick at (${c},${r}) stands on the platform surface at row ${r + 1}`);
      }
      if (cells.get(`${c},${r - 1}`) === 'platform') {
        report(roster, L.id, 'buried', `brick at (${c},${r}) is capped by the platform at row ${r - 1} — its top is unusable`);
      }
    }

    // ---- 2. enemy spawns / patrol under low ceilings --------------------
    const all = [...(L.enemies || []), ...((extra[idx] || []))];
    for (const e of all) {
      const T = ETYPES[e.t] || ETYPES.sneezy;
      const stompCeil = GROUND_Y - P_H - T.h; // ceiling bottom must be <= this
      const spawnCeil = ceilingAt(boxes, e.x);
      if (spawnCeil !== null && GROUND_Y - spawnCeil >= T.h && spawnCeil > stompCeil) {
        report(roster, L.id, 'spawn',
          `${e.t} spawns at x${e.x} under ceiling (clearance ${GROUND_Y - spawnCeil}px) — cannot be stomped there`);
      }
      const [l, r] = patrolSpan(boxes, L, e.x);
      let blocked = 0, span = 0;
      for (let c = l; c <= r; c++) {
        span++;
        const cy = ceilingAt(boxes, c);
        if (cy !== null && GROUND_Y - cy >= T.h && cy > stompCeil) blocked++;
      }
      const pct = span ? Math.round((blocked / span) * 100) : 0;
      if (pct >= 60) {
        report(roster, L.id, 'patrol',
          `${e.t} at x${e.x} patrols x${l}–${r}; ${pct}% of it is un-stompable ceiling`);
      }
    }

    // ---- 3. surface reachability ---------------------------------------
    const surfaces = [];
    for (const b of boxes) {
      if (b.kind === 'mover') {
        surfaces.push({ id: `mover@${b.x / TILE}`, x0: b.x, x1: b.x + b.w + b.range, y: b.y });
      } else {
        surfaces.push({ id: `${b.kind}@${b.x / TILE},${b.y / TILE}`, x0: b.x, x1: b.x + b.w, y: b.y });
      }
    }
    // merge contiguous same-height surfaces so brick runs act as one ledge
    surfaces.sort((a, b) => a.y - b.y || a.x0 - b.x0);
    const merged = [];
    for (const s of surfaces) {
      const prev = merged.find(m => m.y === s.y && s.x0 <= m.x1 + 1 && s.x1 >= m.x0 - 1);
      if (prev) { prev.x0 = Math.min(prev.x0, s.x0); prev.x1 = Math.max(prev.x1, s.x1); }
      else merged.push({ ...s });
    }

    const canJump = (from, to) => {
      if (to.y < from.y - MAX_RISE) return false; // too high to rise
      const dx = to.x0 > from.x1 ? to.x0 - from.x1 : (from.x0 > to.x1 ? from.x0 - to.x1 : 0);
      return dx <= MAX_RUN;
    };
    const startIdx = merged.findIndex(s => s.y === GROUND_Y && s.x0 <= 2 * TILE && s.x1 > 2 * TILE);
    if (startIdx >= 0) {
      const seen = new Set([startIdx]);
      const queue = [startIdx];
      while (queue.length) {
        const cur = queue.shift();
        merged.forEach((s, i) => {
          if (seen.has(i)) return;
          if (canJump(merged[cur], s)) { seen.add(i); queue.push(i); }
        });
      }
      merged.forEach((s, i) => {
        if (!seen.has(i)) {
          report(roster, L.id, 'unreachable',
            `${s.id} (tiles ${s.x0 / TILE}–${s.x1 / TILE}, row ${s.y / TILE}) cannot be reached`);
          return;
        }
        // can we get back to the start surface?
        const back = new Set([i]); const q2 = [i];
        let ok = false;
        while (q2.length) {
          const cur = q2.shift();
          if (cur === startIdx) { ok = true; break; }
          merged.forEach((t, j) => {
            if (back.has(j)) return;
            if (canJump(merged[cur], t)) { back.add(j); q2.push(j); }
          });
        }
        if (!ok) report(roster, L.id, 'oneway', `${s.id} is a one-way ledge — no route back`);
      });
    }

    // ---- 3b. head-room over every standable surface ---------------------
    // Includes a mover's whole travel path, where a low brick would scrape
    // the rider off.
    const stands = [];
    for (const b of boxes) {
      const reach = b.range || 0;
      stands.push({ id: `${b.kind}@${b.x / TILE},${b.y / TILE}`, x0: b.x, x1: b.x + b.w + reach, top: b.y });
    }
    for (const s of stands) {
      let ceil = null;
      for (const b of boxes) {
        if (b.kind === 'ground') continue;
        const bx1 = b.x + b.w + (b.range || 0);
        if (bx1 <= s.x0 || b.x >= s.x1) continue;
        const bottom = b.y + b.h;
        if (bottom > s.top) continue;          // not above this surface
        if (ceil === null || bottom > ceil) ceil = bottom;
      }
      if (ceil === null) continue;
      const head = s.top - ceil;
      if (head > 0 && head < P_H) {
        report(roster, L.id, 'squeeze', `${s.id} has only ${head}px of head-room (player is ${P_H}px)`);
      }
    }

    // ---- 4. ground gaps -------------------------------------------------
    for (const g of L.gaps || []) {
      const bridged = boxes.some(b =>
        (b.kind === 'platform' || b.kind === 'mover') &&
        b.x < (g.x + g.w) * TILE && b.x + b.w + (b.range || 0) > g.x * TILE);
      if (!bridged && g.w * TILE > MAX_RUN) {
        report(roster, L.id, 'gap', `gap at x${g.x} is ${g.w} tiles (${g.w * TILE}px) — max jump is ${Math.round(MAX_RUN)}px`);
      }
    }
  });
}

console.log(`player: rise ${MAX_RISE.toFixed(1)}px (${(MAX_RISE / TILE).toFixed(2)} tiles), run ${MAX_RUN.toFixed(1)}px (${(MAX_RUN / TILE).toFixed(2)} tiles)\n`);
if (!problems.length) {
  console.log('No layout problems found.');
} else {
  let last = '';
  for (const p of problems) {
    const head = `${p.roster} ${p.level}`;
    if (head !== last) { console.log(`\n── ${head} ──`); last = head; }
    console.log(`  [${p.kind}] ${p.msg}`);
  }
  console.log(`\n${problems.length} issue(s).`);
}
