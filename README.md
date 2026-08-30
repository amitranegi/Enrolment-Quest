# Enrolment Quest

Mario-style corporate benefits enrolment game (Loop Health pilot).

## Stack

- Vite + TypeScript client
- **Netlify** hosting (publishes `dist`)
- **Supabase** for interest-mode play telemetry + public Hall of Fame
- Local `localStorage` mirrors for Game Data / offline

## Rendering model

Gameplay code works in a **960×540 logical space** (`TILE=32`). The canvas backing
store is `RES=2`× that (**1920×1080**) and the whole 2D context is scaled by `RES`,
so every sprite, glyph and stroke lands on real 2× pixels.

Art is authored at **2× (64×64 tiles)** and drawn into 32 logical units, giving one
art pixel per device pixel. This is why level layouts, physics and canvas UI keep
their original coordinates while fidelity doubles.

## Develop

```bash
npm install
cp .env.example .env.local   # fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev                  # http://127.0.0.1:5280/
```

With those two env vars set, local dev writes to the same Supabase project as
production. Without them the game falls back to `localStorage` only, and the
Hall of Fame comes up empty.

## Authored sprites

Drop PNG strips in `public/sprites/{SPRITE_DEFS_key}.png`. At boot the game loads them
over DefaultArt (Sprite Studio uploads still win). See `docs/art-brief.md`.

## Supabase database

Project `vbyttkweuaxbsmjkrtmk`. Schema lives in `supabase/migrations/`.

| Path                        | Anon access | Contents |
|-----------------------------|-------------|----------|
| `public.plays`              | INSERT only | Sanitized play rows (no dependant/nominee names) |
| `public.hall_of_fame(int)`  | EXECUTE     | Truncated name/dept + score/grade, top N |

`plays` has RLS with an insert-only policy and no SELECT grant, so the browser can
never read rows back. The title-screen leaderboard goes through the `hall_of_fame`
RPC — a `security invoker` wrapper over a `security definer` helper in the private
schema, which keeps privileged SQL out of the exposed `public` schema.

Privacy: before write, the client strips family/nominee free-text names and
`coveredNames`, keeping plan IDs, relation/gender/age categories, counts, premiums,
and game analytics.

## Deploy

```bash
npm run build          # publishes ./dist (see netlify.toml)
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Netlify site's
environment variables. They are baked in at **build time**, so changing them
requires a redeploy.

## Admin cloud dump

Game Data → enter the admin password → **Cloud JSON / Cloud CSV**. This calls the
`export-plays` Edge Function (`supabase/functions/export-plays/`), which reads
`plays` with the service-role key and is gated on the `ADMIN_EXPORT_SECRET` secret.

**Copy local JSON/CSV** still exports this device's mirrors only.
