# Level Art Anatomy — Playable Neem Morning

Companion to [`world-story.md`](world-story.md) and [`art-brief.md`](art-brief.md).

## Role split

| Asset | Role |
|-------|------|
| Scenic plates in `assets/sprites/_wip/world_neem_morning/` | Inspiration + **`bg_complete`** for the summary screen |
| Layered playable pack (`l1_playable_day` / `_night`) | Sky + **seamless** parallax + tiles + cloud |
| Start / end landmarks | World-locked props (**do not tile**) — origin + destination |

## Critical rule: repeating vs landmarks

Parallax layers **tile horizontally** the whole level. Unique near objects (cottage, culvert, gate) must **never** live in parallax — they would repeat and kill the sense of moving forward.

| Layer | Content | Behaviour |
|-------|---------|-----------|
| `bg_l*` / `parallax_*` | Sky + seamless patterns | **1920×1080** native (1 art px = 1 device px) |
| `landmark_*_start` | Contextual trailhead | **384×448**, true alpha, storybook soft blit |
| `landmark_*_end` | Walk-in building | **384×448**, doorway on **LEFT**, solid opaque |

## Playable stack (bottom → top)

1. `bg_l1` — sky only (960×540)
2. `parallax_l1_far` → `_mid` → `_near` — transparent upper sky; seamless; scroll 0.18 / 0.42 / 0.68
3. `cloud` (+ birds)
4. Terrain tiles (64×64)
5. Landmarks + actors / portal

> **Playable world layers:** storybook soft plates via `scripts/fix_restore_storybook_world.py`
> (true-alpha landmarks, cleared sky on parallax, smooth BG blit). Source:
> `assets/sprites/_wip/storybook_world_l1/` + `storybook_world_l2/`.
> Chunky procedural experiments live in `chunky_world_*` (not installed).

## Object language

| Slot | Neem world material |
|------|---------------------|
| `tile_top` | Packed earth + monsoon grass, marigold flecks |
| `tile_ground` | Warm laterite / soil fill |
| `tile_platform` | Teak verandah planks |
| `tile_brick` | Terracotta clay (breakable) |
| `tile_metal` | Courtyard stone / utility block (hard) |
| `cloud` | Soft storybook cumulus |

## Lighting variants

| Set | Folder | Use |
|-----|--------|-----|
| **Day L1** | `assets/sprites/_wip/l1_playable_day/` | L1 now |
| **Night L1** | `assets/sprites/_wip/l1_playable_night/` | L4-ready |
| **Day L2** | `assets/sprites/_wip/l2_playable_day/` | Clinic Highlands |

```bash
npm run use:l1-day
npm run use:l2-day
```

Walk-in landmarks (`landmark_*_end`) author at **384×448** (logical ~192×224) so cottages/clinics read as buildings, not props.