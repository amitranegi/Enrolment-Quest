import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

// Level 2 — Group Medical Cover. Source: "Livspace GMC & Super Top Up.xlsx"
// (sheet "GMC Plan"), cross-checked against Loop's live "healthflex" portal
// screenshots for Livspace. Exactly 2 plans, each with ONE `sums` entry —
// Super Top-Up is a distinct, separately-priced benefit (see the "Super Top
// Up" sheet) and must NOT be nested into `sums` here: `openGmcFocusZone`
// (src/game/legacy.ts) renders one card per (plan, sums-entry) pair sharing
// the plan's `name`, so multiple sums per plan previously showed up as
// several identically-named "Base"/"Extended Family" cards in Level 2.
const livspaceGmcPlans: CompanyProfile['gmcPlans'] = [
  {
    id: 'gmc_base',
    name: 'Base',
    desc: 'Fully paid by the company: cover for you, your spouse and up to two children.',
    coverNote: 'Covers Self, Spouse & 2 Children.',
    sums: [{ si: 300000, prem: 0, note: 'Company Sponsored', emi: null }],
    features: [
      { label: 'Normal & ICU Room Rent', value: 'Normal — 2% of Sum Insured, ICU — 4% of Sum Insured' },
      { label: 'Pre-Existing Diseases', value: 'Covered from Day 1' },
      { label: 'Maternity cover', value: 'Normal — INR 50,000, C-section — INR 75,000' },
      { label: 'AYUSH Treatment', value: 'Covered upto 25% of Sum Insured' },
      { label: 'Cataract (per eye)', value: 'INR 30,000' },
      { label: 'Hernia (per site)', value: 'INR 50,000' },
      { label: 'Knee / Joint replacement', value: 'Capped at INR 1,50,000 per knee' },
      { label: 'LASIK Surgery', value: 'Covered if correction index is above +/- 5' },
      { label: 'Co-payment on ESC', value: '5%' },
    ],
    detail: {
      covered: [
        'Sum insured ₹3 Lakh (Self + Spouse + 2 Children)',
        'Pre-existing diseases covered from Day 1',
        'Maternity: Normal INR 50,000 / C-section INR 75,000',
        'Cataract INR 30,000 per eye, Hernia INR 50,000 per site',
        'Knee/Joint replacement capped at INR 1,50,000 per knee',
        'LASIK when correction index is above +/- 5',
      ],
      notCovered: ['5% co-pay on ESC (Employee-Spouse-Child) claims'],
      notes: ['Company Sponsored — starts from ₹0 / family / year.'],
    },
  },
  {
    id: 'gmc_extended',
    name: 'Extended Family',
    desc: 'Our most complete plan: the same cover you have in Base, now extended to one set of parents or in-laws so the whole family is looked after under one policy.',
    coverNote: 'Covers Self, Spouse, 2 Children, Parents or Parents-in-law.',
    sums: [{ si: 300000, prem: 34098, note: '4 EMIs at ₹8,524.5 / month, from your salary', emi: 8524.5 }],
    features: [
      { label: 'Parental Sum Insured Capping', value: 'INR 2,00,000 (sublimit within the ₹3L cover)' },
      { label: 'Normal & ICU Room Rent', value: 'Normal — 2% of Sum Insured, ICU — 4% of Sum Insured' },
      { label: 'Maternity cover', value: 'Normal — INR 50,000, C-section — INR 75,000' },
      { label: 'Cataract (per eye)', value: 'INR 30,000' },
      { label: 'Hernia (per site)', value: 'INR 50,000' },
      { label: 'Knee / Joint replacement', value: 'Capped at INR 1,50,000 per knee' },
      { label: 'AYUSH Treatment', value: 'Covered upto 25% of Sum Insured' },
      { label: 'Modern Treatment', value: 'Covered upto 50% of Sum Insured' },
      { label: 'LASIK Surgery', value: 'Covered if correction index is above +/- 5' },
      { label: 'Co-payment on ESC', value: '5%' },
      { label: 'Co-payment Parental', value: '10%' },
    ],
    detail: {
      covered: [
        'Sum insured ₹3 Lakh (₹2L sublimit for parents/parents-in-law)',
        'Maternity: Normal INR 50,000 / C-section INR 75,000',
        'Cataract INR 30,000 per eye, Hernia INR 50,000 per site',
        'Knee/Joint replacement capped at INR 1,50,000 per knee',
        'LASIK when correction index is above +/- 5',
        'Modern Treatment covered upto 50% of Sum Insured',
      ],
      notCovered: ['5% co-pay on ESC claims, 10% co-pay on parental claims'],
      notes: ['Starts from ₹34,098 / family / year · 4 EMIs at ₹8,524.5 / month, from your salary.'],
    },
  },
];

// Super Top-Up — optional, employee-paid riders offered right after a GMC
// plan is confirmed. Source: "Livspace GMC & Super Top Up.xlsx", sheet
// "Super Top Up". `forGmcPlanId` ties each option to the matching gmcPlans
// id above so only the relevant 3 (Base) or 2 (Extended Family) options show.
const livspaceSuperTopUpPlans: CompanyProfile['superTopUpPlans'] = [
  {
    id: 'stu_base_3l', forGmcPlanId: 'gmc_base', name: 'Super Top-Up 3L',
    si: 300000, prem: 4963, emi: null,
    desc: 'Adds ₹3L cover once your Base plan is exhausted (deductible ₹3L). Excludes maternity and the base plan\'s capped ailments; LASIK threshold is +/- 7.5.',
  },
  {
    id: 'stu_base_5l', forGmcPlanId: 'gmc_base', name: 'Super Top-Up 5L',
    si: 500000, prem: 6318, emi: null,
    desc: 'Adds ₹5L cover once your Base plan is exhausted (deductible ₹3L). Excludes maternity and the base plan\'s capped ailments; LASIK threshold is +/- 7.5.',
  },
  {
    id: 'stu_base_7_5l', forGmcPlanId: 'gmc_base', name: 'Super Top-Up 7.5L',
    si: 750000, prem: 7576, emi: null,
    desc: 'Adds ₹7.5L cover once your Base plan is exhausted (deductible ₹3L). Excludes maternity and the base plan\'s capped ailments; LASIK threshold is +/- 7.5.',
  },
  {
    id: 'stu_ext_3l', forGmcPlanId: 'gmc_extended', name: 'Super Top-Up 3L',
    si: 300000, prem: 17254, emi: null,
    desc: 'Adds ₹3L cover (with a ₹3L parental top-up sublimit) once your Extended Family plan is exhausted (deductible ₹2L). Excludes maternity and the base plan\'s capped ailments; LASIK threshold is +/- 7.5.',
  },
  {
    id: 'stu_ext_5l', forGmcPlanId: 'gmc_extended', name: 'Super Top-Up 5L',
    si: 500000, prem: 22576, emi: null,
    desc: 'Adds ₹5L cover (with a ₹5L parental top-up sublimit) once your Extended Family plan is exhausted (deductible ₹2L). Excludes maternity and the base plan\'s capped ailments; LASIK threshold is +/- 7.5.',
  },
];

// Level 3 — Wellbeing Bazaar. No add-on data was provided for Livspace, so this
// reuses Parallel Wireless's 4-addon catalogue (`partner.ts`) verbatim — chosen
// over Tarento's larger catalogue because these 4 already have real card art
// wired via `imageUrl` (public/branding/addons/pw_*.jpg), avoiding the generic
// pixel-icon fallback that most of Tarento's addons currently hit.
const livspaceAddons: CompanyProfile['addons'] = [
  {
    id: 'pw_fitpass',
    name: 'FITPASS — Fitness & Wellness',
    per: 'member',
    price: 3000,
    desc: '12,000 gyms unlocked. No gym nearby? Train at home.',
    elig: () => true,
    eligNote: 'Any covered member',
    brand: 'FITPASS',
    imageUrl: assetPath('branding/addons/pw_fitpass.jpg'),
  },
  {
    id: 'pw_toothlens',
    name: 'TOOTHLENS — Dental Care',
    per: 'family',
    price: 3700,
    desc: 'Teeth are not covered in insurance. One plan covers four family members.',
    elig: () => true,
    eligNote: 'One purchase covers the family',
    brand: 'TOOTHLENS',
    imageUrl: assetPath('branding/addons/pw_toothlens.jpg'),
  },
  {
    id: 'pw_clove',
    name: 'CLOVE DENTAL — Dental Care',
    per: 'member',
    price: 470,
    desc: 'Free consult + X-ray. Pay ₹470 now, avoid ₹15,000 later.',
    elig: () => true,
    eligNote: 'Any covered member',
    brand: 'CLOVE DENTAL',
    imageUrl: assetPath('branding/addons/pw_clove.jpg'),
  },
  {
    id: 'pw_newmi',
    name: "NEWMI — Pregnancy Care & Women's Health",
    per: 'member',
    price: 4101,
    desc: "Pregnancy covered, start to finish. Women's health is more than one annual checkup.",
    elig: (m) => m.gender === 'female' && m.age >= 18,
    eligNote: 'Female members, 18+',
    brand: 'NEWMI',
    imageUrl: assetPath('branding/addons/pw_newmi.jpg'),
  },
];

export const livspaceProfile: CompanyProfile = {
  ...tarentoProfile,
  id: 'livspace',
  titleSuffix: 'Livspace',
  COMPANY: 'Livspace',
  TAGLINE: 'Benefits Adventure',
  // Only one logo asset was supplied (a PNG, no SVG) — LOGO_FALLBACK_URL points
  // at the same file. Swap in a real SVG wordmark later if one becomes available.
  LOGO_URL: assetPath('branding/livspace/logo.png'),
  LOGO_FALLBACK_URL: assetPath('branding/livspace/logo.png'),
  partners: [
    { name: 'Livspace', logoUrl: assetPath('branding/livspace/logo.png') },
    { name: 'Loophealth', logoUrl: assetPath('branding/livspace/loophealth.png') },
  ],
  PORTAL_URL: 'https://benefits.loophealth.com/',
  PORTAL_HOST_LABEL: 'benefits.loophealth.com',
  PORTAL_QR_URL: assetPath('branding/livspace/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'Livspace profile — complete enrolment on your company portal after selecting your coverage.',
  // Max across both family structures: Extended Family adds parents on top of Base.
  dependantStructure: { spouse: 1, child: 2, parent: 2 },
  gmcPlans: livspaceGmcPlans,
  superTopUpPlans: livspaceSuperTopUpPlans,
  addons: livspaceAddons,
  // No GTL policy for Livspace — Level 4 stays off.
  gtlPlans: [],
  enableLevel4: false,
  PLAYS_TABLE: 'plays_livspace',
  HOF_RPC: 'hall_of_fame_livspace',
};
