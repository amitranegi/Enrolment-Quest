# Sprite slot checklist

Status: `todo` → `wip` → `approved` → `in-game`

Last audited: 2026-08-04

## Uniformity contract (characters)

| Role | Standing / idle | Move L/R | Jump | Unique action |
|------|-----------------|----------|------|---------------|
| Playable hero (male / female / other) | `player_idle` (5) | `player_run` + engine flip (5) | `player_jump` (1) | `hero_front` (8) |
| Playable hero geared | `*_geared` idle | `*_geared` run | `*_geared` jump | (same front strip for now) |
| Family adult (spouse / parent) | `family_front` idle loop | N/A (front-only) | N/A | Gesture baked into 6f strip |
| Family child | `family_front_child` idle loop | N/A | N/A | Gesture baked into 6f strip |

Left/right are **not** separate PNGs — characters face right; the engine flips for left.

---

## Playable heroes — gender packs

Shipped under `src/assets/sprites/hero/{male,female,other}/` (bundled, not `public/`).

| Slot | Size | Frames | Strip | male | female | other |
|------|------|--------|-------|------|--------|-------|
| player_idle | 64×64 | 5 | 320×64 | in-game | in-game | in-game |
| player_run | 64×64 | 5 | 320×64 | in-game | in-game | in-game |
| player_jump | 64×64 | 1 | 64×64 | in-game | in-game | in-game |
| player_idle_geared | 64×64 | 5 | 320×64 | in-game | in-game | in-game |
| player_run_geared | 64×64 | 5 | 320×64 | in-game | in-game | in-game |
| player_jump_geared | 64×64 | 1 | 64×64 | in-game | in-game | in-game |
| focus_hero | 96×96 | 5 | 480×96 | in-game | in-game | in-game |
| hero_front | 96×96 | 8 | 768×96 | in-game | in-game | in-game |
| hero_front_title | 128×128 | 8 | 1024×128 | in-game | in-game | in-game |

**Hero polish still open:** confirm each `hero_front` strip has a distinct unique gesture (wave / wink / nod) per gender, not just idle bob. Promote WIP → `approved/` when locked.

---

## Family members

| Slot | Size | Frames | Strip | Status | Notes |
|------|------|--------|-------|--------|-------|
| family_front | 64×64 | 6 | 384×64 | in-game | Spouse female default (blink + wave). Installed `public/sprites/family_front.png` |
| family_front_child | 64×64 | 6 | 384×64 | in-game | Hop + wave. Installed `public/sprites/family_front_child.png` |

WIP variants in `assets/sprites/_wip/family/` (not separate engine slots yet):
- `family_front_spouse_male_strip.png` — wink + nod
- `family_front_parent_strip.png` — grey hair, wave

Longer-term: gender/relation packs mirroring heroes (`src/assets/sprites/family/...`).

---

## Enemies (L1 & L2 visible)

| Slot | Size | Frames | Strip | Status |
|------|------|--------|-------|--------|
| enemy_sneezy | 64×64 | 5 | 320×64 | in-game — teal jelly + hanky |
| enemy_bill | 64×96 | 5 | 320×96 | in-game — bill stack + ₹ |
| enemy_junk | 64×64 | 5 | 320×64 | in-game — burger / pizza hat |
| enemy_bone | 64×80 | 5 | 320×80 | in-game — skeleton + cast |
| enemy_bone_pile | 64×32 | 1 | 64×32 | in-game |

Sources: `assets/sprites/_wip/enemies/`

---

## Items / FX / sky

| Slot | Size | Frames | Strip | Status |
|------|------|--------|-------|--------|
| pickup_kit | 40×40 | 1 | 40×40 | todo |
| coin | 32×32 | 5 | 160×32 | todo |
| flag | 64×128 | 1 | 64×128 | todo |
| cloud | 128×64 | 1 | 128×64 | in-game (L1 day pack) |
| bird | 48×32 | 5 | 240×32 | todo — title uses procedural |
| fx_puff | 32×32 | 1 | 32×32 | todo |
| fx_bill | 32×20 | 1 | 32×20 | todo |
| fx_splash | 32×32 | 1 | 32×32 | todo |
| fx_bone | 24×24 | 1 | 24×24 | todo |
| fx_pill | 28×16 | 1 | 28×16 | todo |

---

## Terrain

| Slot | Size | Frames | Status |
|------|------|--------|--------|
| tile_top | 64×64 | 1 | in-game (shared L1/L2) |
| tile_ground | 64×64 | 1 | in-game |
| tile_platform | 64×64 | 1 | in-game |
| tile_brick | 64×64 | 1 | in-game |
| tile_metal | 64×64 | 1 | in-game |

---

## Backgrounds & world (L1 / L2)

| Slot | Size | Status |
|------|------|--------|
| bg_title | 1920×1080 | in-game — Bangalore green park + hero stage + tall wooden board (8-row HoF) |
| bg_setup | 1920×1080 | in-game — same scenic plate as title |
| bg_l1 | 960×540 | in-game (`l1_playable_day`) |
| bg_l2 | 960×540 | in-game (`l2_playable_day`) |
| bg_l3 | 960×540 | todo (scenic ref only) |
| bg_l4 | 960×540 | todo (scenic ref only) |
| bg_complete | 960×540 | in-game |
| parallax_l1_far/mid/near | 960×540 | in-game |
| parallax_l2_far/mid/near | 960×540 | in-game |
| landmark_l1_start / end | 128×128 / 384×448 | in-game |
| landmark_l2_start / end | 128×128 / 384×448 | in-game |

Night L1 pack exists in `_wip/l1_playable_night/` — switch via `npm run use:l1-night`.

---

## Generation order (next)

1. ~~Family fronts~~ — adult + child in-game; spouse-male + parent WIP variants ready
2. ~~Enemies~~ — sneezy / junk / bill / bone / pile in-game
3. Wire family relation/gender packs (optional) so parent ≠ spouse visually in Focus Zone
4. **Items / FX / bird**
5. ~~bg_setup~~ — same scenic plate as title, wired for hero setup
6. Hero polish — unique-action QA on `hero_front`; promote to `approved/`
7. L3 / L4 skies when those levels ship
8. Title/setup UI polish pass on hero-setup form chrome over the new plate

Install helpers: `npm run use:l1-day` | `use:l1-night` | `use:l2-day` — see `docs/level-art.md`.
