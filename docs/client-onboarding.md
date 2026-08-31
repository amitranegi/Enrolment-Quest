# Client onboarding (Dev Doc)

How to add a new client company to Enrolment Quest. This supersedes
`public/branding/README.md` / `public/branding/addons/README.md` for accuracy
(those two files are stale and are not updated by this doc).

## 1. Overview

Every client-specific thing in the game — branding, plan/premium data, the
add-on catalogue, dependant limits, and which Supabase table/RPC gameplay data
goes to — lives in one `CompanyProfile` object per client, under
`src/config/companies/`. Three exist today: `tarento.ts` (the original/base
profile), `demo.ts` ("Demo Co", a sandbox), and `partner.ts` ("Parallel
Wireless"). A client's state lives in four places:

1. **Config file** — `src/config/companies/<slug>.ts`, a `CompanyProfile` object.
2. **Branding assets** — `public/branding/<slug>/` (logos, QR) plus
   shared `public/branding/addons/` (add-on card art).
3. **Supabase tables/RPCs** — a dedicated `plays_<slug>` table and
   `hall_of_fame_<slug>` RPC pair, per the multi-tenant split.
4. **Edge function map** — `supabase/functions/export-plays/index.ts`'s
   `companyTable` lookup, used by the admin CSV/JSON export.

At runtime, `applyCompanyProfile()` (`src/config/applyCompanyProfile.ts`)
copies a `CompanyProfile`'s fields onto the live `CONFIG` object in
`src/game/legacy.ts`. **Company selection is runtime-only, not a build-time or
per-deployment concern**: on boot the app defaults to `tarento`, then
`loadCompanyPref()` restores whichever company id was last saved to
`localStorage`, and a hidden admin "COMPANY" menu on the title screen lets a
tester cycle through every registered profile (`cycleCompany()` →
`listCompanies()`). There is no env var, URL query param, or subdomain routing
for this — one build serves every client, and the browser remembers which one
you last picked.

## 2. Step 1 — Config file

Copy the template and fill it in:

```bash
cp "src/config/companies/_template.ts" "src/config/companies/<slug>.ts"
```

Rename the exported const from `newClientProfile` to `<slug>Profile`, then fill
every `TODO(<slug>)` marker. The template
(`src/config/companies/_template.ts`) has an inline comment on every field —
read it there rather than duplicating that detail here. A few things worth
calling out up front:

- `id` must exactly equal the branding folder name, the `plays_<id>` table
  suffix, and the `hall_of_fame_<id>` RPC suffix. A mismatch doesn't error —
  it silently shows the wrong (or no) data at runtime.
- `gmcPlans`, `addons`, and `gtlPlans` are typed loosely in
  `src/config/companies/types.ts` (`Array<Record<string, unknown>>`), but they
  have concrete real shapes — see the fully-worked examples in `_template.ts`
  and the existing `tarento.ts` for realistic reference data.
- Author `gtlPlans` explicitly even if `enableLevel4` starts `false` for this
  client — don't leave it empty.

The new file is a normal TypeScript module and will type-check
(`npm run typecheck`) whether or not it's registered yet (Step 5).

## 3. Step 2 — Branding assets

Create `public/branding/<slug>/` with:

| File | Required? | Used for |
|---|---|---|
| `logo.png` | Yes | Focus Zone header logo (`LOGO_URL`) |
| `logo.svg` | Yes | Fallback if `logo.png` fails to load (`LOGO_FALLBACK_URL`) |
| a client wordmark (any filename) | Yes | Title-screen "Client × Loophealth" lockup, `partners[0]` |
| `loophealth.png` | Yes | Loop Health co-brand mark, `partners[1]` — copy this from an existing client's folder, don't reference another company's folder from a new one |
| `qr_enrol_portal.png` | Yes | Checkout QR pointing at `PORTAL_URL`. Regenerate if the URL differs from an existing client's: `npx qrcode "<PORTAL_URL>" -o public/branding/<slug>/qr_enrol_portal.png -w 512` |

Don't copy every file out of an existing client's folder "just in case" —
some files in `demo/` and `partner/` today are unreferenced leftovers from
folder-duplication. Only the files a code path actually reads matter.

**Add-on art is shared, not per-company.** It lives flat in
`public/branding/addons/`, keyed by add-on id: `public/branding/addons/<addon.id>.png`.
Alternatively, set an explicit `imageUrl` on the add-on object in your config
file (this is what `partner.ts` does for its `pw_*` add-ons). Either way,
supply art for every add-on — the built-in pixel-icon fallback
(`drawMiniIcon()` in `src/enrolment/addonBazaar.ts`) only recognizes a small
hardcoded id whitelist; anything else with no art renders a plain circle.

## 4. Step 3 — Supabase migration

Copy `supabase/MIGRATION_TEMPLATE.sql.txt` into a new real migration:

```bash
cp supabase/MIGRATION_TEMPLATE.sql.txt \
   "supabase/migrations/$(date +%Y%m%d%H%M%S)_add_company_<slug>.sql"
```

Then find-and-replace every `__SLUG__` in the new file with `<slug>`, and
apply it (`supabase db push`, or paste into the Supabase dashboard's SQL
editor). This creates:

- `public.plays_<slug>` (mirrors `public.plays`'s schema, insert-only RLS
  policy with the same name/department length checks, its own indexes).
- `private.hall_of_fame_<slug>` (security-definer, does the real read +
  truncation + ordering + limit) and `public.hall_of_fame_<slug>`
  (security-invoker thin wrapper) — the same split used by every existing
  client, so anon clients can call the RPC without a direct table grant.

> **Never place or rename this template file itself inside
> `supabase/migrations/`.** The Supabase CLI applies every
> `<digits>_<name>.sql` file found there; the template must stay outside that
> directory (or as a non-`.sql` extension) so it's never picked up.

## 5. Step 4 — Edge function

Add one entry to the `companyTable` map in
`supabase/functions/export-plays/index.ts`:

```ts
const companyTable: Record<string, string> = {
  tarento: "plays_tarento",
  demo: "plays_demo",
  partner: "plays_partner",
  "<slug>": "plays_<slug>", // add this line
};
```

Then redeploy the function: `supabase functions deploy export-plays`. Without
this, the admin Game Data screen's cloud CSV/JSON export will 400 with
`"Unknown company"` for the new client.

## 6. Step 5 — Register the profile

The one existing-file edit in this whole process — do this when you're ready
to actually make the client live, not before:

```ts
// src/config/companies/index.ts
import { tarentoProfile } from './tarento';
import { demoProfile } from './demo';
import { partnerProfile } from './partner';
import { <slug>Profile } from './<slug>'; // add this

export const companyProfiles: CompanyProfile[] = [
  tarentoProfile, demoProfile, partnerProfile, <slug>Profile, // add this
];
```

## 7. Step 6 — Optional cosmetic step

`index.html` ships with static Tarento branding hardcoded (`<title>`, a
`branding/tarento.png` `<img>`, success-modal copy) so something reasonable
renders before JS runs `syncCompanyBranding()`. If the new client is expected
to be the default/first-loaded brand for its own deployment, update these
static values too. Otherwise skip this — JS overwrites it at boot regardless.

## 8. Local testing

1. `npm run dev`, open the title screen.
2. Open the admin menu and use the "COMPANY" entry to cycle
   (`listCompanies()`) until the new profile is active. Confirm the logo,
   tagline, partner wordmarks, QR, and portal link all update
   (`syncCompanyBranding()`).
3. Reload the page — `loadCompanyPref()` should re-select the same company
   from its persisted `localStorage` key. Clear that key in devtools to reset
   back to the `tarento` default.
4. If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set, play through
   Levels 1–3 (and 4, if `enableLevel4`) and submit at the end. Confirm no
   "Save failed" toast, and check that a row landed in `plays_<slug>` in
   Supabase.
5. Confirm the title-screen Hall of Fame shows entries after at least one
   saved play (calls `hall_of_fame_<slug>` via `fetchHallOfFame()`).
6. In the admin Game Data screen, trigger a cloud CSV/JSON export with the
   admin secret and confirm it succeeds — this verifies the
   `export-plays` edge function's `companyTable` entry.
7. Open the Wellbeing Bazaar and visually confirm no add-on shows the generic
   pixel-circle fallback unless you intended to accept that.

## Appendix — `CompanyProfile` field reference

| Field | Type | Consumed by | Example |
|---|---|---|---|
| `id` | `string` | `index.ts` registry, `persistPlay.ts`, `hallOfFame.ts`, `exportPlays.ts` | `'acme'` |
| `titleSuffix` | `string` | `legacy.ts` (`document.title`) | `'Acme Corp'` |
| `TAGLINE` | `string` | `legacy.ts` title-screen copy | `'Benefits Adventure'` |
| `partners` | `{name,logoUrl}[]` | `legacy.ts` (`syncCompanyBranding`) | client + Loophealth logos |
| `PORTAL_URL` | `string` | checkout CTA / QR target | `'https://benefits.example.com/'` |
| `PORTAL_HOST_LABEL` | `string` | checkout link label | `'benefits.example.com'` |
| `PORTAL_QR_URL` | `string` | checkout QR image | `assetPath('branding/acme/qr_enrol_portal.png')` |
| `PORTAL_SUPPORT_COPY` | `string` | success-modal body copy | — |
| `PLAYS_TABLE` | `string` | `persistPlay.ts`, `exportPlays.ts` | `'plays_acme'` |
| `HOF_RPC` | `string` | `hallOfFame.ts` | `'hall_of_fame_acme'` |
| `MODE` | `'interest' \| 'live'` | gates real-enrolment submission | `'interest'` |
| `COMPANY` | `string` | display name everywhere | `'Acme Corp'` |
| `LOGO_URL` / `LOGO_FALLBACK_URL` | `string` | Focus Zone header | `assetPath('branding/acme/logo.png')` |
| `dependantStructure` | `{spouse,child,parent}` | Level 1 family builder caps | `{spouse:1,child:3,parent:2}` |
| `gmcPlans` | plan tier array | Level 2 plan chooser | see `_template.ts` |
| `addons` | add-on array | Level 3 Wellbeing Bazaar | see `_template.ts` |
| `gtlPlans` | GTL tier array | Level 4 (if enabled) | see `_template.ts` |
| `enableLevel4` | `boolean` | gates Level 4 + campaign length | `false` |
