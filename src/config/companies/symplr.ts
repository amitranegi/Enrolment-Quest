import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

// Level 2 — Group Medical Cover. Source: "Symplr Plans.xlsx", sheet
// "Modular" — 4 tiers (Base / Bronze / Silver / Gold), each with ONE
// `sums` entry (the sheet's "premium" column is the full plan premium, not
// an incremental upgrade — same modeling as Tarento/SymphonyAI). Every tier
// already includes INR 10,000 of OPD cover and no waiting periods /
// pre-existing-condition exclusions from day one.
//
// Bronze removes the Base tier's parental co-pay; Silver adds "cross-
// combination" (own parents AND parents-in-law together, i.e. up to 4
// parents) with the co-pay reinstated; Gold combines both improvements.
const symplrGmcPlans: CompanyProfile['gmcPlans'] = [
  {
    id: 'gmc_base',
    name: 'Base Plan',
    desc: 'The starting point for everyone — your household and one set of parents covered, with no waiting periods and pre-existing conditions included from the very first day.',
    coverNote: 'Covers Self, Spouse, 2 Children, Parents or Parents-in-law (no cross-combination).',
    sums: [{ si: 600000, prem: 0, note: 'Company Sponsored', emi: null }],
    features: [
      { label: 'Maternity cover', value: 'Normal — INR 1,00,000, C-Section — INR 1,00,000' },
      { label: 'Normal & ICU Room Rent', value: 'Normal — Single Standard AC Room, ICU — At Actuals' },
      { label: 'Cross-combination of Parents', value: 'Not Allowed' },
      { label: 'Parental Co-pay', value: '10%' },
      { label: 'OPD Benefit', value: 'Worth INR 10,000' },
    ],
    detail: {
      covered: [
        'Pre-existing diseases covered from day 1 — no waiting periods',
        'Maternity: Normal / C-section INR 1,00,000 each',
        'INR 10,000 of OPD cover included',
      ],
      notCovered: [
        'Parental claims attract 10% co-pay',
        'Cross-combination of own parents and parents-in-law is not allowed on this tier',
      ],
      notes: ['Company Sponsored — starts from ₹0 / family for a year.'],
    },
  },
  {
    id: 'gmc_bronze',
    name: 'Bronze Plan',
    desc: "Everything in Base, without the deduction that normally applies to your parents' claims — their admissible bills are settled without a share from you.",
    coverNote: 'Covers Self, Spouse, 2 Children, Parents or Parents-in-law (no cross-combination).',
    sums: [{ si: 1000000, prem: 38061, note: 'Paid upgrade', emi: null }],
    features: [
      { label: 'Maternity cover', value: 'Normal — INR 1,00,000, C-Section — INR 1,00,000' },
      { label: 'Normal & ICU Room Rent', value: 'Normal — Single Standard AC Room, ICU — At Actuals' },
      { label: 'Cross-combination of Parents', value: 'Not Allowed' },
      { label: 'Parental Co-pay', value: 'Not applicable' },
      { label: 'OPD Benefit', value: 'Worth INR 10,000' },
    ],
    detail: {
      covered: [
        'Sum insured ₹10 Lakh',
        'Zero parental co-pay — same family structure as Base',
        'Maternity: Normal / C-section INR 1,00,000 each',
      ],
      notCovered: ['Cross-combination of own parents and parents-in-law is not allowed on this tier'],
      notes: ['₹38,061 / family / year.'],
    },
  },
  {
    id: 'gmc_silver',
    name: 'Silver Plan',
    desc: "Brings your parents and your spouse's under one policy, so whichever side of the family needs care, they are already covered — no second arrangement to manage.",
    coverNote: 'Covers Self, Spouse, 2 Children, Parents & Parents-in-law (cross-combination allowed).',
    sums: [{ si: 1000000, prem: 78502, note: 'Paid upgrade', emi: null }],
    features: [
      { label: 'Maternity cover', value: 'Normal — INR 1,00,000, C-Section — INR 1,00,000' },
      { label: 'Normal & ICU Room Rent', value: 'Normal — Single Standard AC Room, ICU — At Actuals' },
      { label: 'Cross-combination of Parents', value: 'Allowed' },
      { label: 'Parental Co-pay', value: '10%' },
      { label: 'OPD Benefit', value: 'Worth INR 10,000 (4 parents)' },
    ],
    detail: {
      covered: [
        'Sum insured ₹10 Lakh',
        'Both sets of parents (own + in-laws) covered together — up to 4 parents',
        'Maternity: Normal / C-section INR 1,00,000 each',
      ],
      notCovered: ['Parental claims attract 10% co-pay'],
      notes: ['₹78,502 / family / year.'],
    },
  },
  {
    id: 'gmc_gold',
    name: 'Gold Plan',
    desc: 'Our most complete cover — both sides of the family looked after, and their admissible claims settled without a share from you.',
    coverNote: 'Covers Self, Spouse, 2 Children, Parents & Parents-in-law (cross-combination allowed).',
    sums: [{ si: 1200000, prem: 100455, note: 'Paid upgrade', emi: null }],
    features: [
      { label: 'Maternity cover', value: 'Normal — INR 1,00,000, C-Section — INR 1,00,000' },
      { label: 'Normal & ICU Room Rent', value: 'Normal — Single Standard AC Room, ICU — At Actuals' },
      { label: 'Cross-combination of Parents', value: 'Allowed' },
      { label: 'Parental Co-pay', value: 'Not applicable' },
      { label: 'OPD Benefit', value: 'Worth INR 10,000 (4 parents)' },
    ],
    detail: {
      covered: [
        'Sum insured ₹12 Lakh — the highest tier',
        'Both sets of parents (own + in-laws) covered together — up to 4 parents',
        'Zero parental co-pay',
        'Maternity: Normal / C-section INR 1,00,000 each',
      ],
      notCovered: [],
      notes: ['₹1,00,455 / family / year.'],
    },
  },
];

// Level 3 — Wellbeing Bazaar. Per instruction, keeps the full standard
// catalogue (tarentoProfile.addons) AND adds Symplr's own 2 OPD top-up
// options on top — source: "Symplr Plans.xlsx", sheet "OPD ". These boost
// the INR 10,000 OPD benefit already included in every Modular plan above
// (modeled as addons, same precedent as Expleo's OPD tiers, since there is
// no dedicated "OPD top-up" level in the game).
const symplrOpdAddons: CompanyProfile['addons'] = [
  {
    id: 'symplr_opd_extra_5k',
    name: 'Extra OPD Cover — INR 5,000',
    per: 'family',
    price: 4130,
    desc: 'Adds INR 5,000 on top of your INR 10,000 base OPD cover — INR 15,000 total — plus dental care up to INR 5,000.',
    elig: () => true,
    eligNote: 'Covers Self, Spouse, 2 Children, Parents/Parents-in-law',
    brand: 'Outpatient Care (OPD)',
    // TODO(symplr): no card art supplied for this addon — drop a banner at
    // public/branding/addons/symplr_opd_extra_5k.png, or set imageUrl above.
    // Until then it renders the generic pixel-circle fallback.
    features: [
      { label: 'Extra OPD Cover', value: 'INR 5,000 per family (Total INR 15,000 incl. base cover)' },
      { label: 'Dental Care', value: 'Up to INR 5,000' },
    ],
    bullets: ['Premium INR 4,130 / family, inclusive of GST.'],
  },
  {
    id: 'symplr_opd_extra_10k',
    name: 'Extra OPD Cover — INR 10,000',
    per: 'family',
    price: 8260,
    desc: 'Adds INR 10,000 on top of your INR 10,000 base OPD cover — INR 20,000 total — plus dental care up to INR 5,000.',
    elig: () => true,
    eligNote: 'Covers Self, Spouse, 2 Children, Parents/Parents-in-law',
    brand: 'Outpatient Care (OPD)',
    // TODO(symplr): no card art supplied for this addon — drop a banner at
    // public/branding/addons/symplr_opd_extra_10k.png, or set imageUrl above.
    // Until then it renders the generic pixel-circle fallback.
    features: [
      { label: 'Extra OPD Cover', value: 'INR 10,000 per family (Total INR 20,000 incl. base cover)' },
      { label: 'Dental Care', value: 'Up to INR 5,000' },
    ],
    bullets: ['Premium INR 8,260 / family, inclusive of GST.'],
  },
];

export const symplrProfile: CompanyProfile = {
  ...tarentoProfile,
  id: 'symplr',
  titleSuffix: 'Symplr',
  COMPANY: 'Symplr',
  TAGLINE: 'Benefits Adventure',
  // Only one logo asset was supplied (a PNG, no SVG) — fallback points at
  // the same file, same pattern as Expleo/SymphonyAI/TATA AIA's profiles.
  LOGO_URL: assetPath('branding/symplr/logo.png'),
  LOGO_FALLBACK_URL: assetPath('branding/symplr/logo.png'),
  partners: [
    { name: 'Symplr', logoUrl: assetPath('branding/symplr/logo.png') },
    { name: 'Loophealth', logoUrl: assetPath('branding/symplr/loophealth.png') },
  ],
  PORTAL_URL: 'https://benefits.loophealth.com/',
  PORTAL_HOST_LABEL: 'benefits.loophealth.com',
  PORTAL_QR_URL: assetPath('branding/symplr/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'Symplr profile — complete enrolment on your company portal after selecting your GMC coverage.',
  // Family structure maxes out at Silver/Gold's "cross-combination" tier —
  // own parents AND parents-in-law together (up to 4) — so the family
  // builder needs to allow that many parent slots even though Base/Bronze
  // only use 2 of them.
  dependantStructure: { spouse: 1, child: 2, parent: 4 },
  gmcPlans: symplrGmcPlans,
  // Add-ons: the full standard Wellbeing Bazaar catalogue, plus Symplr's
  // own OPD top-up options appended — per instruction ("all the Add-ons").
  addons: [...tarentoProfile.addons, ...symplrOpdAddons],
  // No Super Top-Up or Term Life data supplied for Symplr.
  superTopUpPlans: [],
  gtlPlans: [],
  enableLevel4: false,
  PLAYS_TABLE: 'plays_symplr',
  HOF_RPC: 'hall_of_fame_symplr',
};
