# Enrolment Quest — Art Brief

**Locked style: C (mythic storybook pixel)** — base hero and fully geared variants.
Approve the three gender turnarounds below before generating full idle / run / jump strips.

Canonical references:
- Base run: `assets/sprites/_wip/player_run_style_c_mythic_v1.png`
- Fully geared run: `assets/sprites/_wip/player_run_style_c_fully_geared_v1.png`
- Machine contract: `docs/sprite-defs.json`

---

## Canvas / world (size guide)

| Constant | Value |
|----------|-------|
| Canvas backing store | **1920 × 1080** |
| Logical game space | 960 × 540 |
| Play camera zoom | **1.55×** (`VIEW_ZOOM`) |
| Actor draw scale | **1.65×** (`ACTOR_SCALE`) vs tiles |
| Item draw scale | **1.4×** (`ITEM_SCALE`) |
| Tile art | **64 × 64** |
| Pixel look | Nearest-neighbour only — no blur, no anti-alias |

Heroes/enemies read ~**2.5×** larger on screen than raw PNG framing (zoom × actor scale).
Gear and silhouette detail must survive that scale.

### Recommended authoring sizes

| Kind | Author at | 5-frame strip | Notes |
|------|-----------|---------------|-------|
| Hero idle / run / jump | **96×96** preferred (or 64×64 until wired) | **480×96** (or 320×64) | Prefer 96 so gear reads |
| Focus Zone portrait | **96×96** | **480×96** | Front-facing (`focus_hero`) |
| Enemies | **96×96** body (bill taller, bone taller) | matching | Match hero visual weight |
| Tiles | **64×64** | — | Denser than actors |
| Coin / kit | **48×48** preferred (32–40 OK) | coin 5f | |
| Flag | **64×128** or **96×192** | — | Landmark |
| FX | **32–48** | — | Small pops |
| Backgrounds / parallax | **1920 × 1080** | — | Native 1:1 device px; never author at 960 then upscale |
| Start landmarks | **384 × 448** | — | Contextual trailhead; true alpha; storybook soft blit |
| Walk-in landmarks | **384 × 448** | — | Doorway faces LEFT; solid opaque; magenta-key only |

Until 96×96 slots are updated in `SPRITE_DEFS`, ship **64×64** strips; the game upscales crisply.
When switching a slot to 96×96, update `w`/`h` in `SPRITE_DEFS` and `docs/sprite-defs.json`.

**Never** upscale blurry 32px sources into hero frames. Soft AI backgrounds must be exported at **1920×1080** so they match tile/character sharpness on large screens.

---

## Strip format

- Animated: **N frames left → right in one PNG**
- Face **right** (engine flips for left)
- Transparent background; hard pixel edges; limited palette
- Feet near bottom of cell; small padding; no clipping
- Same baseline / scale across frames in a strip

Examples:
- `player_idle` / `player_run` @ 64 → **320×64**; @ 96 → **480×96**
- `player_jump` @ 64 → **64×64**; @ 96 → **96×96**

---

## Style C — locked look

- Chunky modern 16-bit / mythic-storybook pixel
- Clear dark outline, 2–3 shades per material
- Contemporary **Indian** casting: warm brown skin, dark hair, natural facial proportions
- Subtle — **no** flags, tilak, turban caricature, religious marks, or costume clichés
- Pure **side profile** for platformer slots (not ¾ RPG view)
- **Matched scale across genders** — same canvas footprint, ~same character height, shared baseline; gender differences are hair/collar/color, not size
- Readable silhouette at tiny size; gear attachment zones kept clear on base

### Attire (base, all genders)

Subtle **Indian office** — still workplace-readable, not costume:
- Short-sleeve shirt with soft **mandarin / Nehru-style collar**
- Thin **cream piping** at collar (and light hem accent)
- One tiny **gold button**
- Charcoal trousers + black office shoes (all genders; no skirt default)
- Shirt color by gender: male blue `#4a6cd4`, female pink `#e0559a`, other teal `#3fbf8f`
- Other: thin purple `#b05ce0` hair band only
- Footwear varies by gender (still office):
  - male — black formal oxfords / derby (tiny gold buckle OK)
  - female — deep burgundy / maroon closed flats
  - other — warm brown loafers with thin cream sole stripe

### Palette (hero)

| Role | Hex | Use |
|------|-----|-----|
| Outline / eyes | `#101018` | |
| Skin (canonical) | `#e0ac69` | Medium; other skin swatches exist in-game |
| Hair | `#3d2b1f` | Dark brown / black volume |
| Pants | `#2b2b3d` | |
| Shoes | `#1a1a26` | |
| Shirt — male | `#4a6cd4` | Blue |
| Shirt — female | `#e0559a` | Pink |
| Shirt — other | `#3fbf8f` | Teal |
| Other accent | `#b05ce0` | Small hair band / streak only |
| Gold | `#ffd24a` | Coins, gear trim |
| Armor teal | `#3fc9c0` / deeper teal | Mythic armor + bracers |
| Headscarf | lavender / indigo | Calm Headscarf of Term |

---

## Hero genders (approve before animation pass)

Same Style C body language, proportions, and side-view camera. Differentiate by hair, silhouette cues, and shirt color — not stereotypes.

| Gender key | Shirt | Hair / cues | Status |
|------------|-------|-------------|--------|
| `male` | Blue `#4a6cd4` | Shorter voluminous dark hair | **In game** — base + geared + front |
| `female` | Pink `#e0559a` | Longer dark hair / side volume | **In game** — base + geared + front |
| `other` | Teal `#3fbf8f` | Soft mid-length hair + thin purple accent band | **In game** — base + geared + front |

Approval concepts (standing, base, no gear) — size-normalized, footwear varied:
- `assets/sprites/_wip/hero_style_c_male_stand_v3_norm.png`
- `assets/sprites/_wip/hero_style_c_female_stand_v3_norm.png`
- `assets/sprites/_wip/hero_style_c_other_stand_v3_norm.png`
- Compare strip: `assets/sprites/_wip/hero_style_c_genders_v3_compare.png`

After approval, generate per gender:
1. `player_idle` (5)
2. `player_run` (5)
3. `player_jump` (1)
4. Geared variants (same poses) — see progression below
5. `focus_hero` front portrait (5) once side set is locked
6. `hero_front` full-body user-facing showcase (8) — title + summary
7. Family: `family_front` / `family_front_child` (6) — summary party line

### User-facing sprites (engine)

| Key | Size | Frames | Used on |
|-----|------|--------|---------|
| `hero_front` | 96×96 | 8 | Title showcase, summary (self) |
| `family_front` | 64×64 | 6 | Summary adults (spouse/parent) |
| `family_front_child` | 64×64 | 6 | Summary children |

Play motions as a **predictable sequential loop** per character. Stagger **start delays** across people on the summary line so gestures don’t sync — do not randomly jump frames within one character.

All three genders ship `hero_front` + `hero_front_title` under `src/assets/sprites/hero/{gender}/`. Title lineup shows all three.

---

## Progression gear (archived for the pilot)

The gear strips remain as source material, but the current pilot deliberately keeps the hero in the same base office attire throughout every level. Benefits still upgrade coverage, scoring, and game state; they do not swap idle, run, or jump art.

| Stage | Trigger | Visual |
|-------|---------|--------|
| `base` | Start | Office attire only |
| `armor` | GMC chosen | **Mythic Armor of Health** — teal + gold chestplate |
| `armor_bracers` | GMC + any add-on | Armor + **Bracers of Wellbeing** |
| `full` (`*_geared`) | GMC + add-ons + GTL | + **Calm Headscarf of Term** |

Engine: `Sprites.activeGenderPack()` currently resolves all playable motions directly from `pack.base`.

Files per gender under `src/assets/sprites/hero/{gender}/`:
`player_{idle,run,jump}.png`, `_*_armor.png`, `_*_armor_bracers.png`, `_*_geared.png`.

Rules:
- Base hero keeps clear **head / torso / forearm / belt** anchors
- Gear variants must remain optional and cannot be assumed by gameplay
- Full-set reference: `player_run_style_c_fully_geared_*`
- Gear must not hide the face or break the run silhouette

## Family packs

`src/assets/sprites/family/{spouse,child,parent}_{male,female,other}.png` — 6-frame front strips.
Resolved by `Sprites.familyFramesFor(relation, gender)`. Focus Zone has a Look picker.

Runtime display hierarchy, relative to the main hero: spouse `0.92`, parent `0.88`, child `0.74`. Keep feet aligned; do not enlarge all 64×64 source cells to equal perceived height.

---

## Sprite slots (`SPRITE_DEFS`)

### Characters

| Key | Size (current) | Frames | Notes |
|-----|----------------|--------|-------|
| `player_idle` | 64×64 | 5 | Soft bob |
| `player_run` | 64×64 | 5 | Clear stride |
| `player_jump` | 64×64 | 1 | Arms up / tucked |
| `focus_hero` | 96×96 | 5 | Front Focus Zone |
| `enemy_sneezy` | 64×64 | 5 | Teal jelly, red nose, hanky |
| `enemy_bill` | 64×96 | 5 | Bill stack |
| `enemy_junk` | 64×64 | 5 | Burger / junk |
| `enemy_bone` | 64×80 | 5 | Skeleton + cast |
| `enemy_bone_pile` | 64×32 | 1 | Collapsed |

### Items / FX / terrain / sky / backgrounds

See `docs/sprite-defs.json` for exact `w`/`h`/`frames` (coin, flag, tiles, BGs, parallax, FX).

---

## Delivery

1. WIP: `assets/sprites/_wip/`
2. Approved: `assets/sprites/approved/{key}.png` or `…/{gender}/{key}.png`
3. Game load: `public/sprites/{key}.png` and/or Sprite Studio — **do not rename keys**
4. Prefer Aseprite (± pixel AI) for final strips; Cursor for brief, placeholders, wiring

## Generation order (remaining)

Heroes (male / female / other) are **done** for idle / run / jump / geared / focus / front / title.
Family fronts + all four enemies (+ bone pile) are **in-game** under `public/sprites/`.

1. Items / FX / bird (`coin`, `flag`, `pickup_kit`, `fx_*`, `bird`)
2. Optional: family relation/gender packs so parent ≠ spouse in Focus Zone
3. `bg_setup` (character creator)
4. Hero polish — QA unique gestures on `hero_front`; promote WIP → `approved/`
5. L3 / L4 skies when those levels ship
