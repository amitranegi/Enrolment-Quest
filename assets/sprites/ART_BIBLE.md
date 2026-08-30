# Enrolment Quest — Sprite Art Bible

Tone: friendly insurance-platformer, readable at small size, cute not scary.
Style: chunky 16-bit pixel art (think modern indie platformer, not photo, not vector).

## Hard technical rules

- Transparent background only (no checkerboard, no solid fill behind characters).
- No anti-aliasing / soft blur — hard pixel edges.
- Limited palette (prefer colors listed below).
- Characters face **right** by default (engine flips for left).
- Feet near bottom of frame; leave a little padding, no clipping.
- Animated slots = **one horizontal strip**: `frames × width` by `height`.
- Engine display size is listed below; draw at that pixel size (or exact integer multiple, then nearest-neighbor downscale).

## Locked palette (from game UI + default art)

| Role | Hex | Notes |
|------|-----|--------|
| Ink / outline | `#101018` | Eyes, outlines |
| Pants / dark | `#2b2b3d` | Hero pants |
| Shoes | `#1a1a26` | |
| Hero shirt (canonical) | `#4a6cd4` | Default male look |
| Skin (canonical) | `#e0ac69` | Skin index 2 |
| Hair (canonical) | `#3d2b1f` | Matches skin 2 |
| Gold | `#ffd24a` | Coins, accents |
| Red / danger | `#ff5d6c` | Cross, nose, pills |
| Teal | `#3fc9c0` | Sneezy |
| Paper cream | `#f4eeda` | Bills |
| Bone | `#f2f2f8` | Skeleton |
| Cast blue | `#5cc8ff` | Bone Rattler cast |
| Grass | `#5fae4a` / `#7ed163` | Terrain top |
| Dirt | `#7a4b2c` / `#6a4126` | Terrain |
| UI purple (BGs only) | `#2a1c4e` → `#7a4fd0` | Title screen |

## Canonical hero (for custom PNGs)

Custom uploads **replace** procedural art — skin/gender/age options no longer recolor them.
Lock this default look for all `player_*` strips:

- Contemporary Indian adult, represented subtly through warm brown skin, dark hair, facial proportions, and overall casting—not flags, religious marks, costume, or caricature
- Medium skin `#e0ac69`, short dark hair `#3d2b1f`
- Blue shirt `#4a6cd4`, dark pants `#2b2b3d`, dark shoes
- Simple face: 2 dark square eyes, tiny mouth
- Readable silhouette at 32×32 (art is drawn ~32 logical then scaled ×2 to 64)
- Pure side-scroller view facing right; avoid top-down RPG perspective

## Progression equipment

The base hero must preserve clear attachment zones at head, torso, forearms, back, and hands.
Rewards are modular visual layers, not baked into the base animation.

- **Health category:** Mythic Armor of Health — teal/gold chestplate
- **Wellbeing / add-on category:** Bracers of Wellbeing — teal/gold forearm bracers
- **Protection / term category:** Calm Headscarf of Term — soft lavender/indigo scarf; face stays readable
- Future company benefits map to stable semantic categories; their names and exact benefits may change without changing the animation contract
- Equipment should become cumulatively visible after each level without obscuring the face or run silhouette
- Each equipment piece follows the same frame size, anchor, facing direction, and five-frame run cycle as the hero

## Style directions in review

- **C** — mythic storybook, blue shirt base (previous pick; can feel generic/office)
- **D** — urban Indian streetwear (indigo jacket, mustard tee, joggers)
- **E** — modern bandi/kurta-casual hybrid (indigo vest, cream shirt, teal pants)
- **C geared** — Style C base + all three upgrade layers at once

## Animation notes

| Slot | Frames | Motion |
|------|--------|--------|
| `player_idle` | 5 | Soft vertical bob (breathing) |
| `player_run` | 5 | Clear stride cycle, opposite arm swing |
| `player_jump` | 1 | Arms up / tucked legs |
| enemies | 5 | Wobble / lean / step — keep silhouette stable |
| `coin`, `bird` | 5 | Spin / wing flap |

## Character briefs

- **Hero** — everyday enrollee, approachable, not armored.
- **Sneezy Sprinter** — teal jelly blob, red nose, tiny hanky.
- **Bill Blaster** — stack of hospital bills, ₹ marks, googly eyes, “stamp” hat.
- **JunkZilla** — walking burger, pizza-slice hat, fries on top.
- **Bone Rattler** — cute skeleton, blue cast on one arm; pile keeps the cast.

## File naming

```
assets/sprites/approved/<slot>.png   # ready for Sprite Studio
assets/sprites/_wip/<slot>_vN.png    # iterations
```

Strip example: `player_idle.png` → **320×64** (5 × 64×64).
