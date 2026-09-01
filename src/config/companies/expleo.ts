import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

// Level 2 — Group Medical Cover. Source: "Expleo GMC & OPD Plan.xlsx", sheets
// "Base TnC" (company-sponsored base policy) and "GMC Flex" (8 optional paid
// upgrade tiers, each adding to the base sum insured).
//
// The base plan's sum insured varies by employee grade band (₹3L–₹10L) — the
// source data ties it to designation codes (DC/T1/P1.../E3) that this game has
// no concept of, so the banding is surfaced as descriptive text rather than
// picking one number. All Flex tier `sums.si` figures below assume the
// minimum band (₹3L) plus that tier's enhancement, noted on each card.
const expleoGmcPlans: CompanyProfile['gmcPlans'] = [
  {
    id: 'gmc_base',
    name: 'Base',
    desc: 'Your company-sponsored Group Mediclaim Cover — comprehensive protection for you and your family from day one, no waiting periods.',
    coverNote: 'Covers Self, Spouse, 2 Dependent Children, 2 Dependent Parents or Parents-in-law (Floater, 1+5).',
    sums: [{ si: 300000, prem: 0, note: 'Company Sponsored — actual SI depends on grade band (see below)', emi: null }],
    features: [
      { label: 'Sum Insured by grade', value: 'DC/T1/P1/P2: ₹3L · P3/P4/SP1: ₹4L · SP2/SP3-Step1: ₹5L · SP3-Step2/E1-E3: ₹10L' },
      { label: 'Normal & ICU Room Rent', value: 'Normal — any room up to INR 7,000, ICU — at actuals' },
      { label: 'Maternity cover', value: 'Normal — INR 50,000, Other than normal — INR 60,000' },
      { label: 'Pre & Post Natal Expenses', value: 'Up to INR 5,000 each, capped at INR 10,000 overall' },
      { label: 'Cataract', value: 'INR 35,000 per eye — all lens types covered, no sub-cap' },
      { label: 'Co-payment (Parental)', value: '20% on parental claims — not applicable on capped ailments or maternity' },
      { label: 'Pre & Post Hospitalization', value: '30 / 60 days' },
      { label: 'LASIK Surgery', value: 'Covered if refractive index is more than +/- 4.5D' },
      { label: 'AYUSH Treatment', value: 'Covered up to 25% of Sum Insured' },
      { label: 'Corporate Floater / Buffer', value: 'INR 40,00,000 shared buffer beyond individual sum insured, at company discretion' },
    ],
    detail: {
      covered: [
        'Pre-existing diseases covered from day 1 — no 1st/2nd/4th year exclusions, no 30-day or maternity waiting period',
        'Day-care procedures, cataract, AYUSH, infertility (up to INR 1,00,000), and newborn day-1 cover included',
        'Emergency road ambulance up to INR 5,000 per incident',
        'Annual health check-up up to INR 3,000 for employees above 40',
        'Portability/continuity benefit for exiting or retiring employees',
      ],
      notCovered: [
        'Domiciliary hospitalization and air ambulance not covered',
        'Cost of dentures and spectacles not covered',
        '20% co-pay applies on every parental claim',
      ],
      notes: [
        'Company Sponsored — starts from ₹0 / family / year.',
        'Optional Critical Illness Rider available: INR 5,00,000 cover for the employee only, 25 named illnesses (e.g. Cancer, Stroke, Kidney Failure, Major Organ Transplant), no waiting or survival period.',
      ],
    },
  },
  {
    id: 'gmc_bronze_a',
    name: 'Bronze A',
    desc: 'Maternity-focused upgrade — boosts your Base cover by ₹3L with enhanced maternity and infertility limits.',
    coverNote: 'Enhanced Sum Insured covers Self, Spouse & Children only — parents are not included in this upgrade.',
    sums: [{ si: 600000, prem: 14500, note: 'Paid upgrade (excl. GST) — Base (min ₹3L) + ₹3L', emi: null }],
    features: [
      { label: 'Maternity — Normal Delivery', value: 'INR 75,000' },
      { label: 'Maternity — C-Section', value: 'INR 1,00,000' },
      { label: 'Infertility Treatment', value: 'INR 1,25,000' },
      { label: 'Pre & Post Natal Expenses', value: 'INR 10,000 each' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Cataract Limit', value: 'Same as Base Plan' },
      { label: 'Parental Co-pay', value: 'Same as Base Plan — parents not covered under this upgrade' },
    ],
    detail: {
      covered: ['Total SI ₹6L (on minimum grade band)', 'Enhanced maternity, infertility and pre/post-natal limits'],
      notCovered: ['Parents are not covered under the enhanced sum insured'],
      notes: ['Emp Face Rate ₹14,500 / family / year, excl. GST.'],
    },
  },
  {
    id: 'gmc_bronze_b',
    name: 'Bronze B',
    desc: 'Maternity-focused upgrade — boosts your Base cover by ₹5L with the highest maternity and infertility limits in the Bronze/Silver line.',
    coverNote: 'Enhanced Sum Insured covers Self, Spouse & Children only — parents are not included in this upgrade.',
    sums: [{ si: 800000, prem: 16500, note: 'Paid upgrade (excl. GST) — Base (min ₹3L) + ₹5L', emi: null }],
    features: [
      { label: 'Maternity — Normal Delivery', value: 'INR 1,00,000' },
      { label: 'Maternity — C-Section', value: 'INR 1,25,000' },
      { label: 'Infertility Treatment', value: 'INR 1,50,000' },
      { label: 'Pre & Post Natal Expenses', value: 'INR 15,000 each' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Cataract Limit', value: 'Same as Base Plan' },
      { label: 'Parental Co-pay', value: 'Same as Base Plan — parents not covered under this upgrade' },
    ],
    detail: {
      covered: ['Total SI ₹8L (on minimum grade band)', 'Highest maternity/infertility limits before Diamond/Platinum'],
      notCovered: ['Parents are not covered under the enhanced sum insured'],
      notes: ['Emp Face Rate ₹16,500 / family / year, excl. GST.'],
    },
  },
  {
    id: 'gmc_silver_a',
    name: 'Silver A',
    desc: 'Same maternity boost as Bronze A, but the enhanced cover extends to parents too.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 600000, prem: 16900, note: 'Paid upgrade (excl. GST) — Base (min ₹3L) + ₹3L', emi: null }],
    features: [
      { label: 'Maternity — Normal Delivery', value: 'INR 75,000' },
      { label: 'Maternity — C-Section', value: 'INR 1,00,000' },
      { label: 'Infertility Treatment', value: 'INR 1,25,000' },
      { label: 'Pre & Post Natal Expenses', value: 'INR 10,000 each' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Cataract Limit', value: 'Same as Base Plan' },
      { label: 'Parental Co-pay', value: 'Not applicable on the enhanced sum insured' },
    ],
    detail: {
      covered: ['Total SI ₹6L (on minimum grade band)', 'Parents included in the enhanced cover, with co-pay waived on that portion'],
      notCovered: [],
      notes: ['Emp Face Rate ₹16,900 / family / year, excl. GST.'],
    },
  },
  {
    id: 'gmc_silver_b',
    name: 'Silver B',
    desc: 'Same maternity boost as Bronze B, but the enhanced cover extends to parents too.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 800000, prem: 19600, note: 'Paid upgrade (excl. GST) — Base (min ₹3L) + ₹5L', emi: null }],
    features: [
      { label: 'Maternity — Normal Delivery', value: 'INR 1,00,000' },
      { label: 'Maternity — C-Section', value: 'INR 1,25,000' },
      { label: 'Infertility Treatment', value: 'INR 1,50,000' },
      { label: 'Pre & Post Natal Expenses', value: 'INR 15,000 each' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Cataract Limit', value: 'Same as Base Plan' },
      { label: 'Parental Co-pay', value: 'Not applicable on the enhanced sum insured' },
    ],
    detail: {
      covered: ['Total SI ₹8L (on minimum grade band)', 'Parents included in the enhanced cover, with co-pay waived on that portion'],
      notCovered: [],
      notes: ['Emp Face Rate ₹19,600 / family / year, excl. GST.'],
    },
  },
  {
    id: 'gmc_gold_a',
    name: 'Gold A',
    desc: 'Parents-focused upgrade — boosts your Base cover by ₹3L with a much higher cataract limit.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 600000, prem: 21600, note: 'Paid upgrade (excl. GST) — Base (min ₹3L) + ₹3L', emi: null }],
    features: [
      { label: 'Cataract Limit', value: 'INR 50,000 per eye' },
      { label: 'Maternity / Infertility', value: 'Same as Base Plan (this tier focuses on cataract, not maternity)' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Parental Co-pay', value: 'Not applicable on the enhanced sum insured' },
    ],
    detail: {
      covered: ['Total SI ₹6L (on minimum grade band)', 'Cataract limit raised to INR 50,000 per eye'],
      notCovered: [],
      notes: ['Emp Face Rate ₹21,600 / family / year, excl. GST.'],
    },
  },
  {
    id: 'gmc_gold_b',
    name: 'Gold B',
    desc: 'Parents-focused upgrade — boosts your Base cover by ₹5L with the highest cataract limit before Diamond/Platinum.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 800000, prem: 23400, note: 'Paid upgrade (excl. GST) — Base (min ₹3L) + ₹5L', emi: null }],
    features: [
      { label: 'Cataract Limit', value: 'INR 75,000 per eye' },
      { label: 'Maternity / Infertility', value: 'Same as Base Plan (this tier focuses on cataract, not maternity)' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Parental Co-pay', value: 'Not applicable on the enhanced sum insured' },
    ],
    detail: {
      covered: ['Total SI ₹8L (on minimum grade band)', 'Cataract limit raised to INR 75,000 per eye'],
      notCovered: [],
      notes: ['Emp Face Rate ₹23,400 / family / year, excl. GST.'],
    },
  },
  {
    id: 'gmc_diamond',
    name: 'Diamond',
    desc: 'Combines the best of both worlds — a ₹10L boost with top-tier maternity limits and a much higher cataract cap.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 1300000, prem: 26400, note: 'Paid upgrade (excl. GST) — Base (min ₹3L) + ₹10L', emi: null }],
    features: [
      { label: 'Maternity — Normal Delivery', value: 'INR 1,00,000' },
      { label: 'Maternity — C-Section', value: 'INR 1,25,000' },
      { label: 'Infertility Treatment', value: 'INR 1,50,000' },
      { label: 'Pre & Post Natal Expenses', value: 'INR 25,000 each' },
      { label: 'Cataract Limit', value: 'INR 1,00,000 per eye' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Parental Co-pay', value: 'Not applicable on the enhanced sum insured' },
    ],
    detail: {
      covered: ['Total SI ₹13L (on minimum grade band)', 'Top-tier maternity, infertility and cataract limits'],
      notCovered: [],
      notes: ['Emp Face Rate ₹26,400 / family / year, excl. GST.'],
    },
  },
  {
    id: 'gmc_platinum',
    name: 'Platinum',
    desc: 'The highest tier — a ₹15L boost with the richest maternity cover and cataract limit available.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 1800000, prem: 30360, note: 'Paid upgrade (excl. GST) — Base (min ₹3L) + ₹15L', emi: null }],
    features: [
      { label: 'Maternity — Normal Delivery', value: 'INR 1,25,000' },
      { label: 'Maternity — C-Section', value: 'INR 1,50,000' },
      { label: 'Infertility Treatment', value: 'INR 1,50,000' },
      { label: 'Pre & Post Natal Expenses', value: 'INR 25,000 each' },
      { label: 'Cataract Limit', value: 'INR 1,00,000 per eye' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Parental Co-pay', value: 'Not applicable on the enhanced sum insured' },
    ],
    detail: {
      covered: ['Total SI ₹18L (on minimum grade band)', 'Richest maternity cover and cataract limit in the plan line-up'],
      notCovered: [],
      notes: ['Emp Face Rate ₹30,360 / family / year, excl. GST.'],
    },
  },
];

// OPD — the CompanyProfile schema has no dedicated "OPD chooser" field/level,
// so (following the precedent already set by Tarento's `opd_wallet` addon)
// Expleo's 3 OPD wallet tiers are modeled as Wellbeing Bazaar add-on cards.
// Source: "Expleo GMC & OPD Plan.xlsx", sheet "OPD". Fully employee-paid — no
// company contribution, per the source sheet.
//
// No card art was supplied for these ids, and they aren't in the built-in
// pixel-icon fallback whitelist (only `opd_wallet` is recognized) — they'll
// render a plain circle in the Wellbeing Bazaar until real art is dropped at
// public/branding/addons/opd_10k.png / opd_15k.png / opd_20k.png.
const expleoAddons: CompanyProfile['addons'] = [
  {
    id: 'opd_10k',
    name: 'OPD Wallet — INR 10,000',
    per: 'family',
    price: 4200,
    desc: 'Outpatient wallet covering consultations, dental, vision, pharmacy, diagnostics, annual health check-up and vaccination — fully employee-paid.',
    elig: () => true,
    eligNote: 'Covers Employee, Spouse & Children (ESC)',
    brand: 'OPD Wallet',
    features: [
      { label: 'Teleconsultation / In-clinic Doctor', value: 'Up to INR 8,000 (teleconsultation is cashless only)' },
      { label: 'Dental', value: 'Up to INR 3,000' },
      { label: 'Vision', value: 'Up to INR 3,000' },
      { label: 'Prescribed Pharmacy', value: 'Up to INR 2,000' },
      { label: 'Prescribed Diagnostics', value: 'Up to INR 3,000' },
      { label: 'Annual Health Check-up', value: 'Up to INR 3,000' },
      { label: 'Vaccination', value: 'Up to INR 2,000' },
    ],
    bullets: ['Sub-limits apply within the overall ₹10,000 wallet, not on top of it.'],
  },
  {
    id: 'opd_15k',
    name: 'OPD Wallet — INR 15,000',
    per: 'family',
    price: 6200,
    desc: 'Outpatient wallet covering consultations, dental, vision, pharmacy, diagnostics, annual health check-up and vaccination — fully employee-paid.',
    elig: () => true,
    eligNote: 'Covers Employee, Spouse & Children (ESC)',
    brand: 'OPD Wallet',
    features: [
      { label: 'Teleconsultation / In-clinic Doctor', value: 'Up to INR 12,000 (teleconsultation is cashless only)' },
      { label: 'Dental', value: 'Up to INR 4,500' },
      { label: 'Vision', value: 'Up to INR 4,500' },
      { label: 'Prescribed Pharmacy', value: 'Up to INR 3,000' },
      { label: 'Prescribed Diagnostics', value: 'Up to INR 4,500' },
      { label: 'Annual Health Check-up', value: 'Up to INR 4,500' },
      { label: 'Vaccination', value: 'Up to INR 3,000' },
    ],
    bullets: ['Sub-limits apply within the overall ₹15,000 wallet, not on top of it.'],
  },
  {
    id: 'opd_20k',
    name: 'OPD Wallet — INR 20,000',
    per: 'family',
    price: 8900,
    desc: 'Outpatient wallet covering consultations, dental, vision, pharmacy, diagnostics, annual health check-up and vaccination — fully employee-paid.',
    elig: () => true,
    eligNote: 'Covers Employee, Spouse & Children (ESC)',
    brand: 'OPD Wallet',
    features: [
      { label: 'Teleconsultation / In-clinic Doctor', value: 'Up to INR 16,000 (teleconsultation is cashless only)' },
      { label: 'Dental', value: 'Up to INR 6,000' },
      { label: 'Vision', value: 'Up to INR 6,000' },
      { label: 'Prescribed Pharmacy', value: 'Up to INR 4,000' },
      { label: 'Prescribed Diagnostics', value: 'Up to INR 6,000' },
      { label: 'Annual Health Check-up', value: 'Up to INR 6,000' },
      { label: 'Vaccination', value: 'Up to INR 4,000' },
    ],
    bullets: ['Sub-limits apply within the overall ₹20,000 wallet, not on top of it.'],
  },
];

export const expleoProfile: CompanyProfile = {
  ...tarentoProfile,
  id: 'expleo',
  titleSuffix: 'Expleo',
  COMPANY: 'Expleo',
  TAGLINE: 'Benefits Adventure',
  LOGO_URL: assetPath('branding/expleo/logo.png'),
  // Only one logo asset was supplied (a PNG, no SVG) — fallback points at the same file.
  LOGO_FALLBACK_URL: assetPath('branding/expleo/logo.png'),
  partners: [
    { name: 'Expleo', logoUrl: assetPath('branding/expleo/logo.png') },
    { name: 'Loophealth', logoUrl: assetPath('branding/expleo/loophealth.png') },
  ],
  PORTAL_URL: 'https://benefits.loophealth.com/',
  PORTAL_HOST_LABEL: 'benefits.loophealth.com',
  PORTAL_QR_URL: assetPath('branding/expleo/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'Expleo profile — complete enrolment on your company portal after selecting your GMC and OPD coverage.',
  dependantStructure: { spouse: 1, child: 2, parent: 2 },
  gmcPlans: expleoGmcPlans,
  addons: expleoAddons,
  // No GTL data was supplied for Expleo — Level 4 stays off.
  gtlPlans: [],
  enableLevel4: false,
  PLAYS_TABLE: 'plays_expleo',
  HOF_RPC: 'hall_of_fame_expleo',
};
