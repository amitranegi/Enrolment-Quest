# Authored sprites (shipped)

Only PNGs referenced by the live game belong here. Vite copies this folder into `dist/sprites`.

- `manifest.json` — list of keys the boot loader may fetch (auto-built by `prebuild`)
- Do **not** put WIP / quarantine / alt sets here — those live in `assets/sprites/_wip/` (gitignored)

```bash
npm run compress:sprites   # lossless recompress
npm run build              # regenerates manifest + dist
```

Priority at runtime: Sprite Studio (localStorage) → these files → DefaultArt.
