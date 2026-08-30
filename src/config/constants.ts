/** World / sprite resolution contract (locked for parallel art). */

/** Device-pixel multiplier — canvas backing store is RES × logical size. */
export const SCALE = 2;
export const RES = SCALE;

/** Logical game space (engine coordinates, physics, levels). */
export const TILE = 32;
export const W = 960;
export const H = 540;
export const GROUND_Y = 448;

/** Canvas backing store (CSS letterboxed to fit). */
export const CANVAS_W = W * RES; // 1920
export const CANVAS_H = H * RES; // 1080

/**
 * Play-camera zoom. >1 = closer / larger on screen. Physics unchanged.
 * 1.55 ≈ 55% larger than the original full-stage framing.
 */
export const VIEW_ZOOM = 1.55;

/**
 * Extra draw scale for characters / enemies / pickups relative to tiles.
 * Combined with VIEW_ZOOM ≈ 2.5× original on-screen hero size.
 */
export const ACTOR_SCALE = 1.65;

/** Coins, power-ups, small FX (between tile and actor). */
export const ITEM_SCALE = 1.4;

/** Authored sprite frame size for characters/tiles (see docs/art-brief.md). */
export const SPRITE_BASE = 64;
