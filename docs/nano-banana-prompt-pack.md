# Nano Banana prompt pack — Enrolment Quest

Use with **Google Gemini app** (Nano Banana image mode) or **Google AI Studio**.
Goal: generate high-res concept sheets. Cursor will later slice them into exact game strips.

---

## How to use (do this)

1. Open [gemini.google.com](https://gemini.google.com) (or AI Studio).
2. Start a **new chat** per character (Female / Male / Other / Family). Keeps consistency.
3. Turn on **image generation** (Nano Banana).
4. **Attach the reference image** listed under each prompt (from this repo).
5. **Paste the prompt** exactly.
6. Download the PNG → drop into the matching `_inbox` folder below.
7. Tell Cursor: *“normalize the inbox for female”* (or male / other / family).

### Drop folders

```
assets/sprites/_wip/nano_inbox/female/
assets/sprites/_wip/nano_inbox/male/
assets/sprites/_wip/nano_inbox/other/
assets/sprites/_wip/nano_inbox/family/
```

### Naming when you save

Use the **Save as** name under each prompt, e.g. `F_idle_base.png`.

### Order (important)

For each hero: **lock base idle first** → then run → jump → fronts → then armor stages.  
Always attach the **previous approved** image as reference so gear stays on the same body.

### Global rules (already baked into prompts)

- Style C mythic storybook pixel, chunky dark outline
- Contemporary Indian casting, subtle (no flags / religious marks / caricature)
- Transparent background preferred (or plain white — we key it out)
- Equal frame cells, feet near bottom, same scale across frames
- Side-view faces **RIGHT**; front-view faces camera
- One character only; no text; no ground plane; no UI

---

## Shared style block (optional sticky note)

If Gemini forgets the look, paste this as a short follow-up:

```
Same Style C Enrolment Quest character. Chunky 16-bit mythic-storybook pixel art, clear near-black outline, 2–3 shades per material, warm medium-brown skin #e0ac69, dark hair #3d2b1f, charcoal pants #2b2b3d. No photorealism, no blur, no checkerboard, no text, no ground.
```

---

# A. FEMALE HERO

**Refs to attach (start):**
- `assets/sprites/export/female_complete/01_idle_base.png`
- or `src/assets/sprites/hero/female/player_idle.png`

Shirt: pink `#e0559a` · longer dark hair · burgundy flats

---

### F1 — Idle base (5 frames)
**Save as:** `F_idle_base.png`  
**Attach:** female idle base

```
Create a production pixel-art sprite sheet: exactly FIVE equal frames in one clean horizontal row.

SAME female Enrolment Quest Style C hero as the attached reference. Side-view facing RIGHT. Pink short-sleeve shirt with soft mandarin/Nehru collar, cream piping, one gold button, charcoal pants, burgundy flats, long dark wavy hair, warm brown skin.

Soft idle / breathing bob only across the 5 frames. No gear, no armor, no scarf, no bracers.

Transparent background. Equal cell widths. Feet near bottom of each cell. Same scale and baseline in every frame. No text, no ground, no labels.
```

---

### F2 — Run base (5 frames)
**Save as:** `F_run_base.png`  
**Attach:** `F_idle_base.png` (or approved F1)

```
Same exact female character as the attached reference. Style C pixel art. Side-view facing RIGHT.

Sprite sheet: exactly FIVE equal frames, clear running stride cycle, opposite arm swing. Base outfit only (pink shirt, no gear).

Transparent background. Equal cells. Feet near bottom. Same scale/baseline. No text.
```

---

### F3 — Jump base (1 frame)
**Save as:** `F_jump_base.png`  
**Attach:** F1 or F2

```
Same exact female character as the attached reference. Style C pixel art. Side-view facing RIGHT.

Single jump pose, arms up or tucked, base outfit only (no gear). Transparent background. Full body, feet near bottom. No text.
```

---

### F4 — Focus front (5 frames)
**Save as:** `F_focus_front.png`  
**Attach:** F1

```
Same exact female character as the attached reference, but FRONT-FACING toward camera (not side view). Style C pixel art.

Sprite sheet: exactly FIVE equal frames. Soft idle bob / tiny blink. Base pink outfit, no gear. Full upper body + legs readable. Transparent background. Equal cells. No text.
```

---

### F5 — Hero front showcase (8 frames)
**Save as:** `F_hero_front.png`  
**Attach:** F4 or F1

```
Same exact female character, FRONT-FACING full body. Style C pixel art.

Sprite sheet: exactly EIGHT equal frames left to right:
1 idle, 2 breathe, 3 blink, 4 idle, 5 wave start (right hand up), 6 wave full, 7 settle, 8 idle.

Pink shirt base, no gear. Transparent background. Equal cells. Feet near bottom. No text.
```

---

### F6 — Idle ARMOR only (5)
**Save as:** `F_idle_armor.png`  
**Attach:** F1 + optionally `10_idle_full_geared.png` for armor look

```
Same exact female as attached base. Side-view RIGHT. FIVE equal idle frames.

Add ONLY Mythic Armor of Health: teal/green chestplate with gold trim over her pink shirt.
NO forearm bracers. NO headscarf/bandana — hair fully visible.

Transparent BG. Same scale/baseline. No text.
```

---

### F7 — Run ARMOR only (5)
**Save as:** `F_run_armor.png`  
**Attach:** F6

```
Same armored female (armor only, no bracers, no scarf). Side RIGHT. FIVE-frame run cycle. Transparent BG. Equal cells. No text.
```

---

### F8 — Jump ARMOR only (1)
**Save as:** `F_jump_armor.png`  
**Attach:** F6

```
Same armored female (armor only, no bracers, no scarf). Side RIGHT. Single jump pose. Transparent BG. No text.
```

---

### F9 — Idle ARMOR + BRACERS (5)
**Save as:** `F_idle_armor_bracers.png`  
**Attach:** F6

```
Same female. Side RIGHT. FIVE idle frames.
Keep Mythic Armor chestplate. ADD Bracers of Wellbeing: teal/gold forearm bracers on both arms.
NO headscarf — hair fully visible.

Transparent BG. Equal cells. No text.
```

---

### F10 — Run ARMOR + BRACERS (5)
**Save as:** `F_run_armor_bracers.png`  
**Attach:** F9

```
Same female with armor + bracers, no scarf. Side RIGHT. FIVE-frame run. Transparent BG. No text.
```

---

### F11 — Jump ARMOR + BRACERS (1)
**Save as:** `F_jump_armor_bracers.png`  
**Attach:** F9

```
Same female with armor + bracers, no scarf. Side RIGHT. Single jump. Transparent BG. No text.
```

---

### F12 — Idle FULL geared (5)
**Save as:** `F_idle_full.png`  
**Attach:** F9 + female `player_idle_geared.png` if useful

```
Same female. Side RIGHT. FIVE idle frames.
Full gear: Mythic Armor + Bracers + Calm Headscarf of Term (soft lavender/indigo scarf; face stays fully readable).

Transparent BG. Equal cells. No text.
```

---

### F13 — Run FULL (5)
**Save as:** `F_run_full.png`  
**Attach:** F12

```
Same fully geared female (armor + bracers + headscarf). Side RIGHT. FIVE-frame run. Transparent BG. No text.
```

---

### F14 — Jump FULL (1)
**Save as:** `F_jump_full.png`  
**Attach:** F12

```
Same fully geared female. Side RIGHT. Single jump. Transparent BG. No text.
```

---

# B. MALE HERO

**Start refs:**
- `src/assets/sprites/hero/male/player_idle.png`
- `assets/sprites/_wip/hero_style_c_male_stand_v3_norm.png`

Shirt: blue `#4a6cd4` · shorter voluminous dark hair · black oxfords

Copy the Female prompts but change character to:

```
SAME male Enrolment Quest Style C hero as the attached reference. Blue shirt #4a6cd4, shorter voluminous dark hair, black office oxfords, warm brown skin. Matched body scale to the female hero pack (same height footprint).
```

### Save-as list (male)

| Prompt twin | Save as |
|-------------|---------|
| F1 | `M_idle_base.png` |
| F2 | `M_run_base.png` |
| F3 | `M_jump_base.png` |
| F4 | `M_focus_front.png` |
| F5 | `M_hero_front.png` |
| F6 | `M_idle_armor.png` |
| F7 | `M_run_armor.png` |
| F8 | `M_jump_armor.png` |
| F9 | `M_idle_armor_bracers.png` |
| F10 | `M_run_armor_bracers.png` |
| F11 | `M_jump_armor_bracers.png` |
| F12 | `M_idle_full.png` |
| F13 | `M_run_full.png` |
| F14 | `M_jump_full.png` |

**Example M1 (idle base) full paste:**

```
Create a production pixel-art sprite sheet: exactly FIVE equal frames in one clean horizontal row.

SAME male Enrolment Quest Style C hero as the attached reference. Side-view facing RIGHT. Blue short-sleeve shirt #4a6cd4 with soft mandarin/Nehru collar, cream piping, one gold button, charcoal pants, black oxfords, shorter voluminous dark hair, warm brown skin. Same body scale as the female Style C hero.

Soft idle / breathing bob only. No gear.

Transparent background. Equal cell widths. Feet near bottom. Same scale/baseline. No text, no ground.
```

Use F2–F14 text with “male / blue shirt / no pink” substitutions; keep gear instructions identical.

---

# C. OTHER HERO

**Start refs:**
- `src/assets/sprites/hero/other/player_idle.png`
- `assets/sprites/_wip/hero_style_c_other_stand_v3_norm.png`

Shirt: teal `#3fbf8f` · soft mid-length hair · thin purple `#b05ce0` hair band · warm brown loafers

### Save-as list (other)

Same as male but prefix `O_`: `O_idle_base.png` … `O_jump_full.png`

**Example O1:**

```
Create a production pixel-art sprite sheet: exactly FIVE equal frames in one clean horizontal row.

SAME "other" Enrolment Quest Style C hero as the attached reference. Side-view facing RIGHT. Teal shirt #3fbf8f, soft mid-length dark hair with a thin purple #b05ce0 hair band only, warm brown loafers with thin cream sole stripe, charcoal pants, warm brown skin. Same body scale as male/female heroes.

Soft idle bob. No gear, no headscarf (hair band only).

Transparent background. Equal cells. Feet near bottom. No text.
```

Gear stages: same as female (armor → bracers → scarf). Keep the purple hair band visible under/with the Calm Headscarf when full geared.

---

# D. FAMILY (front only)

Family only need **front standing + unique gesture** (6 frames). No run/jump.

**Refs:**
- Hero fronts for style: `src/assets/sprites/hero/female/hero_front.png`
- Existing family WIP: `assets/sprites/_wip/family/*_front_v1.png`

### Shared family frame recipe (use in every family prompt)

```
Sprite sheet: exactly SIX equal frames left to right:
1 idle stand, 2 soft breathe bob, 3 blink, 4 unique-action start, 5 unique-action peak, 6 settle to idle.

FRONT-FACING toward camera. Style C pixel art matching Enrolment Quest heroes. Warm brown skin. Charcoal pants. Transparent background. Equal cells. Feet near bottom. No text, no ground. Cute not scary.
```

---

### Fam1 — Spouse female
**Save as:** `Fam_spouse_female.png`  
**Action:** friendly wave  
**Outfit:** pink shirt `#e0559a`, longer dark hair, burgundy flats

```
SIX-frame FRONT sprite sheet of one contemporary Indian adult woman (spouse), Style C Enrolment Quest.

Pink shirt #e0559a, mandarin collar, cream piping, gold button, charcoal pants, burgundy flats, longer dark hair, warm brown skin.

Frames: idle, breathe, blink, wave start, wave full (right hand), settle.
Transparent BG. Equal cells. No text.
```

---

### Fam2 — Spouse male
**Save as:** `Fam_spouse_male.png`  
**Action:** wink + tiny nod  
**Outfit:** purple shirt `#5c3f8a`, shorter hair, black oxfords

```
SIX-frame FRONT sprite sheet, adult man spouse, Style C.

Purple shirt #5c3f8a, mandarin collar, charcoal pants, black oxfords, shorter dark hair.

Frames: idle, breathe, wink (one eye), wink settle, small nod, idle.
Transparent BG. Equal cells. No text.
```

---

### Fam3 — Spouse other
**Save as:** `Fam_spouse_other.png`  
**Action:** wave  
**Outfit:** teal shirt `#3fbf8f`, purple hair band, brown loafers

```
SIX-frame FRONT sprite sheet, adult spouse "other", Style C.

Teal shirt #3fbf8f, thin purple hair band, charcoal pants, brown loafers.

Frames: idle, breathe, blink, wave start, wave full, settle.
Transparent BG. Equal cells. No text.
```

---

### Fam4 — Child male (~8)
**Save as:** `Fam_child_male.png`  
**Action:** hop + wave  
**Outfit:** teal shirt `#3fc9c0`, short hair, smaller child proportions

```
SIX-frame FRONT sprite sheet, Indian child boy ~8, Style C, smaller than adults (bigger head, shorter legs).

Teal shirt #3fc9c0, short dark hair, charcoal pants.

Frames: idle, bounce, happy hop arms out, land, little wave, idle.
Transparent BG. Equal cells. No text.
```

---

### Fam5 — Child female (~8)
**Save as:** `Fam_child_female.png`  
**Action:** hop + wave  
**Outfit:** teal `#3fc9c0`, longer hair with soft side volume

```
SIX-frame FRONT sprite sheet, Indian child girl ~8, Style C, child proportions.

Teal shirt #3fc9c0, longer dark hair side volume, charcoal pants.

Frames: idle, bounce, hop arms out, land, wave, idle.
Transparent BG. Equal cells. No text.
```

---

### Fam6 — Child other (~8)
**Save as:** `Fam_child_other.png`  
**Action:** hop + wave  
**Outfit:** teal `#3fc9c0`, mid-length hair + tiny purple band

```
SIX-frame FRONT sprite sheet, Indian child ~8 "other", Style C, child proportions.

Teal shirt #3fc9c0, soft mid-length hair with tiny purple accent band.

Frames: idle, bounce, hop, land, wave, idle.
Transparent BG. Equal cells. No text.
```

---

### Fam7 — Parent male (~55–60)
**Save as:** `Fam_parent_male.png`  
**Action:** slow wave  
**Outfit:** terracotta `#c4744f`, greying short hair

```
SIX-frame FRONT sprite sheet, older Indian father ~55–60, Style C, cute not frail.

Terracotta/rust shirt #c4744f, soft greying short hair with silver streak, charcoal pants.

Frames: idle, breathe, blink, wave start, wave full, settle.
Transparent BG. Equal cells. No text.
```

---

### Fam8 — Parent female (~55–60)
**Save as:** `Fam_parent_female.png`  
**Action:** slow wave  
**Outfit:** terracotta `#c4744f`, greying longer hair

```
SIX-frame FRONT sprite sheet, older Indian mother ~55–60, Style C.

Terracotta/rust shirt #c4744f, soft greying longer hair with silver streak, charcoal pants.

Frames: idle, breathe, blink, wave start, wave full, settle.
Transparent BG. Equal cells. No text.
```

---

### Fam9 — Parent other (~55–60)
**Save as:** `Fam_parent_other.png`  
**Action:** nod + wave  
**Outfit:** terracotta `#c4744f`, greying mid hair + soft purple band

```
SIX-frame FRONT sprite sheet, older parent "other" ~55–60, Style C.

Terracotta shirt #c4744f, greying mid-length hair with soft purple accent band, charcoal pants.

Frames: idle, breathe, blink, nod, small wave, settle.
Transparent BG. Equal cells. No text.
```

---

## Checklist (tick as you download)

### Female (14)
- [ ] F_idle_base · F_run_base · F_jump_base
- [ ] F_focus_front · F_hero_front
- [ ] F_idle_armor · F_run_armor · F_jump_armor
- [ ] F_idle_armor_bracers · F_run_armor_bracers · F_jump_armor_bracers
- [ ] F_idle_full · F_run_full · F_jump_full

### Male (14) — same list with `M_`
### Other (14) — same list with `O_`
### Family (9)
- [ ] Fam_spouse_female/male/other
- [ ] Fam_child_female/male/other
- [ ] Fam_parent_female/male/other

**Total: 51 images** (do Female first if tired — 14 images unlock the whole gear story).

---

## After you have files

1. Put PNGs in `assets/sprites/_wip/nano_inbox/{female|male|other|family}/`
2. Message Cursor: **“Normalize nano inbox”**
3. I’ll convert to exact strips and install into:
   - `src/assets/sprites/hero/{gender}/`
   - `src/assets/sprites/family/`
4. Hard-refresh and playtest.

If Nano Banana returns a soft photo-look: reply in the same chat *“more chunky pixel, harder outline, flatter shading, less detail noise”* and regenerate once before moving on.
