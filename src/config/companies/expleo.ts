import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

// Level 2 — Group Medical Cover. Source: "Expleo GMC & OPD.xlsx" (updated),
// sheets "Base TnC" (company-sponsored base policy) and "GMC Flex" (8
// optional paid upgrade tiers, each adding to the base sum insured).
//
// The base plan's sum insured varies by employee grade band (₹3L–₹10L) — the
// source data ties it to designation codes (DC/T1/P1.../E3) that this game has
// no concept of. The updated sheet names each Flex tier against the ₹5L band
// (e.g. "Base 5L + Bronze 3L"), so all `sums.si` figures below use ₹5L as the
// reference base plus that tier's enhancement, matching the sheet's own
// naming. Premiums are the sheet's single "Premium" row, which is GST-inclusive
// (the earlier "Emp Face Rate Excl GST" figures × 1.18) — do not re-add GST.
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
    name: 'Base 5L + Bronze 3L',
    desc: 'Maternity-focused upgrade — boosts your Base cover by ₹3L with enhanced maternity and infertility limits.',
    coverNote: 'Enhanced Sum Insured covers Self, Spouse & Children only — parents are not included in this upgrade.',
    sums: [{ si: 800000, prem: 17110, note: 'Paid upgrade, GST inclusive — Base 5L + ₹3L', emi: null }],
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
      covered: ['Total SI ₹8L (Base 5L + ₹3L)', 'Enhanced maternity, infertility and pre/post-natal limits'],
      notCovered: ['Parents are not covered under the enhanced sum insured'],
      notes: ['₹17,110 / family / year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_bronze_b',
    name: 'Base 5L + Bronze 5L',
    desc: 'Maternity-focused upgrade — boosts your Base cover by ₹5L with the highest maternity and infertility limits in the Bronze/Silver line.',
    coverNote: 'Enhanced Sum Insured covers Self, Spouse & Children only — parents are not included in this upgrade.',
    sums: [{ si: 1000000, prem: 19470, note: 'Paid upgrade, GST inclusive — Base 5L + ₹5L', emi: null }],
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
      covered: ['Total SI ₹10L (Base 5L + ₹5L)', 'Highest maternity/infertility limits before Diamond/Platinum'],
      notCovered: ['Parents are not covered under the enhanced sum insured'],
      notes: ['₹19,470 / family / year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_silver_a',
    name: 'Base 5L + Silver 3L',
    desc: 'Same maternity boost as Base 5L + Bronze 3L, but the enhanced cover extends to parents too.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 800000, prem: 19942, note: 'Paid upgrade, GST inclusive — Base 5L + ₹3L', emi: null }],
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
      covered: ['Total SI ₹8L (Base 5L + ₹3L)', 'Parents included in the enhanced cover, with co-pay waived on that portion'],
      notCovered: [],
      notes: ['₹19,942 / family / year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_silver_b',
    name: 'Base 5L + Silver 5L',
    desc: 'Same maternity boost as Base 5L + Bronze 5L, but the enhanced cover extends to parents too.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 1000000, prem: 23128, note: 'Paid upgrade, GST inclusive — Base 5L + ₹5L', emi: null }],
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
      covered: ['Total SI ₹10L (Base 5L + ₹5L)', 'Parents included in the enhanced cover, with co-pay waived on that portion'],
      notCovered: [],
      notes: ['₹23,128 / family / year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_gold_a',
    name: 'Base 5L + Gold 3L',
    desc: 'Parents-focused upgrade — boosts your Base cover by ₹3L with a much higher cataract limit.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 800000, prem: 25488, note: 'Paid upgrade, GST inclusive — Base 5L + ₹3L', emi: null }],
    features: [
      { label: 'Cataract Limit', value: 'INR 50,000 per eye' },
      { label: 'Maternity / Infertility', value: 'Same as Base Plan (this tier focuses on cataract, not maternity)' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Parental Co-pay', value: 'Not applicable on the enhanced sum insured' },
    ],
    detail: {
      covered: ['Total SI ₹8L (Base 5L + ₹3L)', 'Cataract limit raised to INR 50,000 per eye'],
      notCovered: [],
      notes: ['₹25,488 / family / year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_gold_b',
    name: 'Base 5L + Gold 5L',
    desc: 'Parents-focused upgrade — boosts your Base cover by ₹5L with the highest cataract limit before Diamond/Platinum.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 1000000, prem: 27612, note: 'Paid upgrade, GST inclusive — Base 5L + ₹5L', emi: null }],
    features: [
      { label: 'Cataract Limit', value: 'INR 75,000 per eye' },
      { label: 'Maternity / Infertility', value: 'Same as Base Plan (this tier focuses on cataract, not maternity)' },
      { label: 'Pre & Post Hospitalization', value: '60 / 90 days' },
      { label: 'Parental Co-pay', value: 'Not applicable on the enhanced sum insured' },
    ],
    detail: {
      covered: ['Total SI ₹10L (Base 5L + ₹5L)', 'Cataract limit raised to INR 75,000 per eye'],
      notCovered: [],
      notes: ['₹27,612 / family / year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_diamond',
    name: 'Base 5L + Diamond 10L',
    desc: 'Combines the best of both worlds — a ₹10L boost with top-tier maternity limits and a much higher cataract cap.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 1500000, prem: 31152, note: 'Paid upgrade, GST inclusive — Base 5L + ₹10L', emi: null }],
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
      covered: ['Total SI ₹15L (Base 5L + ₹10L)', 'Top-tier maternity, infertility and cataract limits'],
      notCovered: [],
      notes: ['₹31,152 / family / year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_platinum',
    name: 'Base 5L + Platinum 15L',
    desc: 'The highest tier — a ₹15L boost with the richest maternity cover and cataract limit available.',
    coverNote: 'Enhanced Sum Insured covers the same family members as your Base plan, including parents.',
    sums: [{ si: 2000000, prem: 35824.8, note: 'Paid upgrade, GST inclusive — Base 5L + ₹15L', emi: null }],
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
      covered: ['Total SI ₹20L (Base 5L + ₹15L)', 'Richest maternity cover and cataract limit in the plan line-up'],
      notCovered: [],
      notes: ['₹35,824.80 / family / year, GST inclusive.'],
    },
  },
];

// OPD — the CompanyProfile schema has no dedicated "OPD chooser" field/level,
// so (following the precedent already set by Tarento's `opd_wallet` addon)
// Expleo's 3 OPD wallet tiers are modeled as Wellbeing Bazaar add-on cards.
// Source: "Expleo GMC & OPD.xlsx" (updated), sheet "OPD". Fully employee-paid
// — no company contribution, per the source sheet. Prices are the sheet's
// GST-inclusive "Premium" row (the earlier excl.-GST figures × 1.18).
const expleoAddons: CompanyProfile['addons'] = [
  {
    id: 'opd_10k',
    name: 'OPD Wallet — INR 10,000',
    per: 'family',
    price: 4956,
    desc: 'Outpatient wallet covering consultations, dental, vision, pharmacy, diagnostics, annual health check-up and vaccination — fully employee-paid.',
    elig: () => true,
    eligNote: 'Covers Employee, Spouse & Children (ESC)',
    brand: 'OPD Wallet',
    imageUrl: assetPath('branding/addons/expleo_opd.jpg'),
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
    price: 7316,
    desc: 'Outpatient wallet covering consultations, dental, vision, pharmacy, diagnostics, annual health check-up and vaccination — fully employee-paid.',
    elig: () => true,
    eligNote: 'Covers Employee, Spouse & Children (ESC)',
    brand: 'OPD Wallet',
    imageUrl: assetPath('branding/addons/expleo_opd.jpg'),
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
    price: 10502,
    desc: 'Outpatient wallet covering consultations, dental, vision, pharmacy, diagnostics, annual health check-up and vaccination — fully employee-paid.',
    elig: () => true,
    eligNote: 'Covers Employee, Spouse & Children (ESC)',
    brand: 'OPD Wallet',
    imageUrl: assetPath('branding/addons/expleo_opd.jpg'),
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
