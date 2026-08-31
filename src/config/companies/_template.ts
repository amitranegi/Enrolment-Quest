// ============================================================================
// NEW-CLIENT TEMPLATE — not a real company profile.
//
// This file is intentionally NOT imported by `src/config/companies/index.ts`,
// so it has zero effect on the running game. It exists purely so it always
// type-checks against the real `CompanyProfile` shape (`npm run typecheck`
// picks it up), which keeps it accurate as the codebase evolves.
//
// To onboard a real client:
//   1. Copy this file to `src/config/companies/<slug>.ts`
//   2. Rename the export below from `newClientProfile` to `<slug>Profile`
//   3. Fill in every `TODO(<slug>)` marker with the real client's details
//   4. Follow `docs/client-onboarding.md` end to end — this file only covers
//      Step 1 (the config object). You still need to: create the branding
//      folder, run the Supabase migration, add an entry to the export-plays
//      edge function's company map, and register the profile in
//      `src/config/companies/index.ts`.
// ============================================================================

import { assetPath } from '../assetPath';
import type { CompanyProfile } from './types';

export const newClientProfile: CompanyProfile = {
  MODE: 'interest', // 'interest' (record interest only) | 'live' (submit real enrolment — the live-submit path is currently a TODO stub, so leave this as 'interest' unless that's been wired up)
  COMPANY: 'TODO(<slug>): Client Display Name', // shown in-game (title screen, Focus Zone header, checkout copy)

  /** Prefer logo.png; falls back to logo.svg if the PNG fails to load. */
  LOGO_URL: assetPath('branding/<slug>/logo.png'),
  LOGO_FALLBACK_URL: assetPath('branding/<slug>/logo.svg'),

  // IMPORTANT: this exact string must equal —
  //   - the branding folder name:      public/branding/<slug>/
  //   - the Supabase table suffix:     plays_<slug>
  //   - the Hall of Fame RPC suffix:   hall_of_fame_<slug>
  // A mismatch on any of these fails silently at runtime (wrong/empty data,
  // not an error), so keep all four in lockstep.
  id: '<slug>', // TODO(<slug>): lowercase, no spaces (e.g. 'acme', 'globex')
  titleSuffix: 'TODO(<slug>): Client Name', // document.title becomes "Enrolment Quest — <titleSuffix>"
  TAGLINE: 'TODO(<slug>): short tagline', // shown as "{COMPANY} · {TAGLINE}" on the title screen

  // partners[0] = the client's own wordmark (any filename you like).
  // partners[1] = Loop Health's co-brand mark — duplicate the shared
  // loophealth.png asset into this client's own branding folder; don't
  // reference another company's folder.
  partners: [
    { name: 'TODO(<slug>): Client Name', logoUrl: assetPath('branding/<slug>/<slug>.png') },
    { name: 'Loophealth', logoUrl: assetPath('branding/<slug>/loophealth.png') },
  ],

  PORTAL_URL: 'https://TODO-<slug>.example.com/', // TODO(<slug>): real enrolment portal URL
  PORTAL_HOST_LABEL: 'TODO-<slug>.example.com', // human-readable label shown next to the portal link/QR
  // Regenerate whenever PORTAL_URL differs from an existing client's:
  //   npx qrcode "<PORTAL_URL>" -o public/branding/<slug>/qr_enrol_portal.png -w 512
  PORTAL_QR_URL: assetPath('branding/<slug>/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'TODO(<slug>): success-modal copy telling the player to finish enrolment on the real portal.',

  // Must exactly match the table/RPC names created by the Supabase migration
  // (see supabase/MIGRATION_TEMPLATE.sql.txt) and the `companyTable` map in
  // supabase/functions/export-plays/index.ts.
  PLAYS_TABLE: 'plays_<slug>',
  HOF_RPC: 'hall_of_fame_<slug>',

  // Max count of each dependant type this client's policy allows — mirror the
  // client's real GMC policy limits (drives the Level 1 family-builder UI caps).
  dependantStructure: { spouse: 1, child: 3, parent: 2 },

  // Level 2 — Group Medical Cover plan tiers, compared side-by-side in the
  // Focus Zone. Duplicate this object per tier — 2–4 tiers is typical
  // (e.g. Base / Gold / Diamond, or Bronze / Silver / Gold / Platinum).
  gmcPlans: [
    {
      id: 'gmc_base', // TODO(<slug>): unique per tier
      name: 'TODO: Tier name (e.g. "Base")',
      desc: 'TODO: one-line pitch for this tier.',
      coverNote: 'TODO: e.g. "Covers Self, Spouse, 3 Children, Parents or Parents-in-law."',
      sums: [
        { si: 500000, prem: 0, note: 'Company Sponsored', emi: null }, // si/prem in INR; emi = per-month cost if paid in installments, else null
      ],
      features: [
        { label: 'Normal & ICU Room Rent', value: 'TODO' },
        { label: 'Parental Co-pay', value: 'TODO' },
        { label: 'Cataract', value: 'TODO' },
        { label: 'Maternity cover', value: 'TODO' },
      ],
      detail: {
        covered: ['TODO: bullet list of what this tier covers'],
        notCovered: ['TODO: bullet list of exclusions/caveats'],
        notes: ['TODO: e.g. pricing/EMI footnote'],
      },
    },
  ],

  // Level 3 — Wellbeing Bazaar add-on catalogue. Duplicate this object per
  // add-on. `elig` is evaluated per family member to decide who qualifies —
  // use `m => true` for everyone, or gate it (e.g. `m => m.gender==='female'
  // && m.age>=18`, or `m => m.relation==='parent'`).
  //
  // IMPORTANT: for every add-on, either drop art at
  // public/branding/addons/<id>.png OR set `imageUrl` explicitly below. The
  // built-in pixel-icon fallback (`drawMiniIcon` in
  // src/enrolment/addonBazaar.ts) only recognizes a small hardcoded id
  // whitelist (womens_care, dental_vision, opd_wallet, ultrahuman_ring,
  // annual_check, parent_screen) — any other id with no art renders a plain
  // circle.
  addons: [
    {
      id: 'todo_addon_id', // TODO(<slug>): unique per add-on
      name: 'TODO: Add-on name',
      per: 'member', // 'member' (priced per covered person) | 'family' (one price covers everyone)
      price: 0, // INR
      desc: 'TODO: one-line pitch for this add-on.',
      elig: (m: any) => true,
      eligNote: 'TODO: e.g. "Any covered member" or "Female members, 18+"',
      brand: 'TODO: vendor display name',
      // Optional: badge?, badgeTone?: 'new'|'gift'|'hot'|'promo'|'default',
      // optionsLabel?, imageUrl?, tone?, promo?
      imageUrl: assetPath('branding/addons/todo_addon_id.png'), // or delete this line to use public/branding/addons/<id>.png by convention
    },
  ],

  // Level 4 — Group Term Life options. Always author this explicitly, even if
  // enableLevel4 stays false for now — don't leave it empty/undefined.
  gtlPlans: [
    { id: 'gtl_25', name: 'TODO: e.g. "₹25 Lakh cover"', si: 2500000, prem: 0, desc: 'TODO' },
    { id: 'gtl_50', name: 'TODO: e.g. "₹50 Lakh cover"', si: 5000000, prem: 1800, desc: 'TODO' },
  ],

  /** Admin-toggleable at runtime too; this just sets the default. When false, Level 4 is skipped and L1–L3 use the longer compact campaign. */
  enableLevel4: false,
};

// ----------------------------------------------------------------------------
// Remaining onboarding steps (see docs/client-onboarding.md for full detail):
//   Step 2 — Branding assets:      public/branding/<slug>/ (logo.png, logo.svg,
//                                  wordmark, loophealth.png, qr_enrol_portal.png)
//   Step 3 — Supabase migration:   copy supabase/MIGRATION_TEMPLATE.sql.txt,
//                                  replace __SLUG__, apply it
//   Step 4 — Edge function:        add "<slug>": "plays_<slug>" to companyTable
//                                  in supabase/functions/export-plays/index.ts
//   Step 5 — Register the profile: import + append to companyProfiles[] in
//                                  src/config/companies/index.ts
//   Step 6 — (optional, cosmetic): update index.html's static pre-JS branding
// ----------------------------------------------------------------------------
