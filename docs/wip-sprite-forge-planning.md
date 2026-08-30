# WIP — Sprite Forge (Aseprite-like tool) planning

Status: **parked** — revisit later. Captured from planning chat (Aug 2026).

## Verdict

Build an **Enrolment Quest sprite factory**, not a full Aseprite clone.

- Can beat Aseprite *for this game’s art loop* (generate → constrain → tweak → export).
- Will not match Aseprite as a general pixel editor without years of UX/feature work.

## Two products

| Aseprite | Target tool |
|----------|-------------|
| Manual pixel craft | Generate from keyframes + tweak to ship |
| Perfect control | Speed + consistency from refs + art bible |
| Success = artist can paint anything | Success = game-ready strips match `ART_BIBLE` / `sprite-defs.json` |

## Effectiveness

- **EQ-specific:** high — palette, sizes, facing, strips, Nano Banana inbox path already exist.
- **Vs Aseprite generally:** low–medium long term (layers, onion skin, tags, tilemaps, scripting, polish).
- AI strong at variants + volume; weak at 1px cleanup — needs a real pixel editor next to generation.

## Phases (when resumed)

0. Product definition — EQ factory, not Aseprite clone  
1. Spec-enforced canvas — palette, NN zoom, brush, timeline, onion skin, strip I/O  
2. Generation backend — prompt templates, refs, post-process (palette remap, grid, strips)  
3. Keyframe → in-betweens — lock extremes, fill middles, per-frame regen  
4. EQ integration — WIP folders, checklist, one-click playtest  
5. Optional Aseprite-parity extras only if needed  

## Recommendation

**Sprite Forge for EQ:** timeline + pixel tweak → slot/palette/size enforcement → keyframe-conditioned generation → export into existing strip contract.

Next step when unpaused: concrete MVP spec (screens, data model, tech stack) against current repo layout.
