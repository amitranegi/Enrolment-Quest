import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

// Level 2 — Group Mediclaim Cover. Sources: "TATA AIA Base Plan Details.pdf"
// (the Base plan) and "TATA AIA Voluntary Plans & Top Up.pdf" ("Voluntary
// Parental Policy Premium" table). Modeled as 5 selectable tiers:
//   1. Base — Self + Spouse + up to 2 Children, company sponsored (₹0).
//   2-5. Base + N Parent(s) — the Base plan plus the Voluntary Parental
//      Policy layered on top, for N = 1..4 parents.
// The parental policy's premium in the source varies by BOTH sum-insured
// band (₹4L/6L/8L) AND parent count (1-4) — by instruction, the SI band is
// fixed at ₹4L (matching Base's own reference band) and only parent count
// varies, giving one clean upgrade path instead of the full 12-cell grid.
// The parental floater is its OWN ₹4,00,000 family pool, separate from (not
// additive to) the Base ESC sum insured — so `sums.si` stays ₹4,00,000 on
// every tier; what changes is the parent count and premium.
const tataaiaBaseFeatures: { label: string; value: string }[] = [
  { label: 'Sum Insured by grade', value: 'Managers & below: ₹4,00,000 · Sr. Manager & above: ₹7,00,000 (family floater)' },
  { label: 'Normal & ICU Room Rent', value: 'Normal — Managers & below ₹4,000, Sr. Managers & above ₹7,000 · ICU — At actuals' },
  { label: 'Maternity cover', value: 'Normal delivery & C-section — INR 50,000' },
  { label: 'New Born Baby Cover', value: 'Covered from day one, up to the floater sum insured' },
  { label: 'Ambulance Charges', value: 'INR 2,000 per hospitalisation' },
  { label: 'Pre & Post Hospitalisation', value: '30 / 60 days' },
  { label: 'Dental Cover', value: 'Up to INR 5,000 — employees only' },
  { label: 'Vision Cover', value: 'Up to INR 5,000 — employees only' },
  { label: 'AYUSH Treatment', value: 'Up to 25% of Sum Insured, max INR 25,000 per policy period' },
  { label: 'Preventive Health Check-Up', value: 'INR 3,000 — employees only, within Sum Insured' },
  { label: 'Advance/Modern Treatments', value: 'Covered up to 50% of Sum Insured' },
];

const tataaiaBaseNotes = [
  'Insurer: The New India Assurance · TPA: Medi Assist · Broker: Loop Health.',
];

// Voluntary Parental Policy premiums, ₹4L SI band, per source PDF — rates
// are EXCLUDING GST (no post-GST figure was supplied; unlike Expleo/Livspace,
// don't gross these up without a real number).
const parentalTiers = [
  { parents: 1, prem: 15460 },
  { parents: 2, prem: 31745 },
  { parents: 3, prem: 46398 },
  { parents: 4, prem: 58197 },
];

const tataaiaGmcPlans: CompanyProfile['gmcPlans'] = [
  {
    id: 'gmc_base',
    name: 'Base Plan',
    desc: 'Your company-sponsored Group Mediclaim Cover — comprehensive protection for you, your spouse and children from day one, no waiting periods.',
    coverNote: 'Covers Self, Spouse and up to 2 Children (age 25 or under). Parents/parents-in-law are not included.',
    sums: [{ si: 400000, prem: 0, note: 'Company Sponsored — Managers & below (Sr. Manager & above get ₹7,00,000, see features)', emi: null }],
    features: tataaiaBaseFeatures,
    detail: {
      covered: [
        'Pre-existing diseases covered from day 1 — all waiting periods waived',
        'New born baby covered from day one, up to the floater sum insured',
        'Day-care procedures as per the insurer’s list',
        'AYUSH treatment up to 25% of Sum Insured, capped at INR 25,000',
        'Preventive health check-up INR 3,000 for employees',
        'Modern/advance treatments covered up to 50% of Sum Insured',
      ],
      notCovered: [
        'Parents/parents-in-law are not covered — add one of the Voluntary Parental tiers below to cover them',
        'Dental, Vision and Preventive Health Check-up cover the employee only, not dependants',
      ],
      notes: [...tataaiaBaseNotes, 'Company Sponsored — starts from ₹0 / family for a year.'],
    },
  },
  ...parentalTiers.map(({ parents, prem }) => ({
    id: `gmc_parental_${parents}`,
    name: `Base + ${parents} Parent${parents > 1 ? 's' : ''}`,
    desc: `Your Base Mediclaim Cover, plus the Voluntary Parental Policy covering ${parents} parent${parents > 1 ? 's' : ''} or parent${parents > 1 ? 's' : ''}-in-law.`,
    coverNote: `Covers Self, Spouse and up to 2 Children under Base, plus ${parents} Parent${parents > 1 ? 's' : ''} under a separate ₹4,00,000 Voluntary Parental floater.`,
    sums: [{ si: 400000, prem, note: `Voluntary Parental Policy — ${parents} parent${parents > 1 ? 's' : ''}, ₹4,00,000 floater, excl. GST (separate pool from the Base sum insured)`, emi: null }],
    features: [
      ...tataaiaBaseFeatures,
      { label: 'Voluntary Parental Cover', value: `${parents} Parent${parents > 1 ? 's' : ''} · ₹4,00,000 family floater (separate from Base)` },
    ],
    detail: {
      covered: [
        'Pre-existing diseases covered from day 1 — all waiting periods waived',
        'New born baby covered from day one, up to the floater sum insured',
        'Day-care procedures as per the insurer’s list',
        'AYUSH treatment up to 25% of Sum Insured, capped at INR 25,000',
        'Preventive health check-up INR 3,000 for employees',
        'Modern/advance treatments covered up to 50% of Sum Insured',
        `${parents} Parent${parents > 1 ? 's' : ''}/parent${parents > 1 ? 's' : ''}-in-law covered under the Voluntary Parental Policy — no medical check-up, no age limit, pre-existing conditions covered from day 1, cashless at network hospitals`,
      ],
      notCovered: [
        'Dental, Vision and Preventive Health Check-up cover the employee only, not dependants',
      ],
      notes: [
        ...tataaiaBaseNotes,
        `Voluntary Parental Policy: ₹${prem.toLocaleString('en-IN')} / family / year for ${parents} parent${parents > 1 ? 's' : ''} at ₹4,00,000 SI, excluding GST (per source PDF).`,
      ],
    },
  })),
];

// Super Top-Up — 2 optional, employee-paid riders that boost the ESC
// (Employee + Spouse + Children) sum insured, offered after whichever GMC
// tier above is confirmed (duplicated across all 5 tier ids since the
// top-up applies regardless of how many parents were added). Source: "TATA
// AIA Voluntary Plans & Top Up.pdf", "Voluntary ESC Top-Up Policy Premium"
// table. Rates are exactly as printed in the source, EXCLUDING GST — unlike
// most other profiles here (Expleo/Livspace), whose premiums are stored
// GST-inclusive because their source sheets gave both pre- and post-GST
// figures. No post-GST figure was supplied for TATA AIA, so don't gross
// these up without a real number.
const tataaiaGmcPlanIds = tataaiaGmcPlans.map((p) => p.id as string);
const tataaiaSuperTopUpPlans: CompanyProfile['superTopUpPlans'] = tataaiaGmcPlanIds.flatMap((forGmcPlanId) => [
  {
    id: `stu_${forGmcPlanId}_4l`, forGmcPlanId, name: 'ESC Top-Up 4L',
    si: 400000, prem: 2641, emi: null,
    desc: 'Adds ₹4L cover for Employee, Spouse & Children on top of your plan. Per family, excluding GST.',
  },
  {
    id: `stu_${forGmcPlanId}_7l`, forGmcPlanId, name: 'ESC Top-Up 7L',
    si: 700000, prem: 4622, emi: null,
    desc: 'Adds ₹7L cover for Employee, Spouse & Children on top of your plan. Per family, excluding GST.',
  },
]);

export const tataaiaProfile: CompanyProfile = {
  ...tarentoProfile,
  id: 'tataaia',
  titleSuffix: 'TATA AIA',
  COMPANY: 'TATA AIA',
  TAGLINE: 'Benefits Adventure',
  // Only one logo asset was supplied (a JPG, no SVG) — fallback points at
  // the same file, same pattern as Expleo/SymphonyAI's profiles.
  LOGO_URL: assetPath('branding/tataaia/logo.jpg'),
  LOGO_FALLBACK_URL: assetPath('branding/tataaia/logo.jpg'),
  partners: [
    { name: 'TATA AIA', logoUrl: assetPath('branding/tataaia/logo.jpg') },
    { name: 'Loophealth', logoUrl: assetPath('branding/tataaia/loophealth.png') },
  ],
  PORTAL_URL: 'https://benefits.loophealth.com/',
  PORTAL_HOST_LABEL: 'benefits.loophealth.com',
  PORTAL_QR_URL: assetPath('branding/tataaia/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'TATA AIA profile — complete enrolment on your company portal after selecting your GMC coverage.',
  // Parent slots now allowed (up to the highest parental tier, 4) so the
  // family builder can actually add the parents a "Base + N Parent(s)" plan
  // covers — unlike the plain Base-only modeling, parents are a real,
  // selectable dependant type for this company now.
  dependantStructure: { spouse: 1, child: 2, parent: 4 },
  gmcPlans: tataaiaGmcPlans,
  superTopUpPlans: tataaiaSuperTopUpPlans,
  // Add-ons: same Wellbeing Bazaar catalogue as every other client — stays
  // inherited from tarentoProfile, not overridden, per instruction.
  // addons: tarentoProfile.addons (inherited)
  // No Term Life product for TATA AIA — Level 4 stays off.
  gtlPlans: [],
  enableLevel4: false,
  PLAYS_TABLE: 'plays_tataaia',
  HOF_RPC: 'hall_of_fame_tataaia',
};
