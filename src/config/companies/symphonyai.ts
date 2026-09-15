import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

// Level 2 — Group Medical Cover. Source: "Symphony Plan.xlsx", sheet "Modular"
// — 4 tiers (Base Plan / Classic / Elite / Premium), each with ONE `sums`
// entry (the sheet's own "Annual Cost for Modular Plans" row is the full
// plan premium, not an incremental upgrade over Base — same modeling as
// Tarento, unlike Expleo's base+enhancement tiers).
const symphonyaiGmcPlans: CompanyProfile['gmcPlans'] = [
  {
    id: 'gmc_base',
    name: 'Base Plan',
    desc: 'Designed for nuclear families seeking basic yet reliable cover.',
    coverNote: 'Covers Self, Spouse, 2 Children, Parents or Parents-in-law (no cross combination permitted).',
    sums: [{ si: 750000, prem: 0, note: 'Company Sponsored, GST inclusive', emi: null }],
    features: [
      { label: 'Normal & ICU Room Rent', value: 'Normal — Single AC Room, ICU — At Actuals' },
      { label: 'Parental Sub Limit', value: 'INR 5 Lac' },
      { label: 'Parental Co-pay', value: '10%' },
      { label: 'Cataract', value: 'INR 45,000 per eye' },
      { label: 'Maternity cover', value: 'Normal — INR 1,00,000, C-section — INR 1,00,000' },
      { label: 'OPD', value: 'INR 5,000' },
      { label: 'Consumables', value: 'Not Covered' },
      { label: 'Modern Day/Advanced Treatments', value: '25% co-pay' },
    ],
    detail: {
      covered: [
        'Sum insured ₹7.5 Lakh — Self, Spouse, 2 Children, Parents or Parents-in-law',
        'Maternity: Normal / C-section INR 1,00,000 each, pre & post-natal INR 5,000 within the maternity limit',
        'Well baby expense INR 5,000 within the maternity limit',
        'Cataract INR 45,000 per eye',
        'OPD cover up to INR 5,000',
        'Single AC room rent; ICU at actuals',
      ],
      notCovered: [
        'Twin baby coverage not available on this tier',
        'Consumables not covered',
        'Domiciliary hospitalization not covered',
        'Parental claims attract 10% co-pay (parental cover sub-limited to INR 5 Lac)',
        '25% co-pay on modern/advanced treatments',
      ],
      notes: ['Company Sponsored — starts from ₹0 / family for a year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_classic',
    name: 'Classic',
    desc: 'Comprehensive coverage for hospitalization, day-care procedures, and related medical expenses.',
    coverNote: 'Covers Self, Spouse, 2 Children, Parents or Parents-in-law (no cross combination permitted).',
    sums: [{ si: 800000, prem: 19038, note: 'Paid upgrade, GST inclusive', emi: null }],
    features: [
      { label: 'Normal & ICU Room Rent', value: 'Normal — Single AC Room, ICU — At Actuals' },
      { label: 'Parental Sub Limit', value: 'INR 5 Lac' },
      { label: 'Parental Co-pay', value: '10%' },
      { label: 'Cataract', value: 'INR 50,000 per eye' },
      { label: 'Maternity cover', value: 'Normal — INR 1,25,000, C-section — INR 1,25,000' },
      { label: 'OPD', value: 'INR 7,500' },
      { label: 'Consumables', value: 'Covered' },
      { label: 'Domiciliary Hospitalization', value: 'Up to INR 2,50,000 (on IPD basis)' },
      { label: 'Modern Day/Advanced Treatments', value: '25% co-pay' },
    ],
    detail: {
      covered: [
        'Sum insured ₹8 Lakh',
        'Maternity: Normal / C-section INR 1,25,000 each, pre & post-natal INR 10,000 within the maternity limit',
        'Well baby expense INR 6,000 within the maternity limit',
        'Twin baby coverage: 100% first baby, 50% second baby',
        'Cataract INR 50,000 per eye',
        'OPD cover up to INR 7,500',
        'Consumables covered',
        'Domiciliary hospitalization up to INR 2,50,000 on an IPD basis',
      ],
      notCovered: ['Parental claims attract 10% co-pay', '25% co-pay on modern/advanced treatments'],
      notes: ['₹19,038 / family / year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_elite',
    name: 'Elite',
    desc: 'Provides enhanced coverage with higher limits and wider protection.',
    coverNote: 'Covers Self, Spouse, 2 Children, Parents or Parents-in-law (no cross combination permitted).',
    sums: [{ si: 1000000, prem: 31860, note: 'Paid upgrade, GST inclusive', emi: null }],
    features: [
      { label: 'Normal & ICU Room Rent', value: 'Normal — Single AC Room, ICU — At Actuals' },
      { label: 'Parental Sub Limit', value: 'INR 7.5 Lac' },
      { label: 'Parental Co-pay', value: '5%' },
      { label: 'Cataract', value: 'INR 50,000 per eye' },
      { label: 'Maternity cover', value: 'Normal — INR 1,00,000, C-section — INR 1,00,000' },
      { label: 'OPD', value: 'INR 7,500' },
      { label: 'Consumables', value: 'Covered' },
      { label: 'Domiciliary Hospitalization', value: 'Up to INR 2,50,000 (on IPD basis)' },
      { label: 'Modern Day/Advanced Treatments', value: '25% co-pay' },
    ],
    detail: {
      covered: [
        'Sum insured ₹10 Lakh',
        'Parental sub-limit raised to INR 7.5 Lac with only 5% co-pay',
        'Maternity: Normal / C-section INR 1,00,000 each, pre & post-natal INR 7,500 within the maternity limit',
        'Well baby expense INR 5,000 within the maternity limit',
        'Twin baby coverage: 100% first baby, 50% second baby',
        'Cataract INR 50,000 per eye',
        'OPD cover up to INR 7,500',
        'Consumables covered',
        'Domiciliary hospitalization up to INR 2,50,000 on an IPD basis',
      ],
      notCovered: ['Parental claims attract 5% co-pay', '25% co-pay on modern/advanced treatments'],
      notes: ['₹31,860 / family / year, GST inclusive.'],
    },
  },
  {
    id: 'gmc_premium',
    name: 'Premium',
    desc: 'Top-tier coverage, premium benefits for all major medical needs.',
    coverNote: 'Covers Self, Spouse, 2 Children, Parents or Parents-in-law (no cross combination permitted).',
    sums: [{ si: 1500000, prem: 57820, note: 'Paid upgrade, GST inclusive', emi: null }],
    features: [
      { label: 'Normal & ICU Room Rent', value: 'Normal — Single AC Room, ICU — At Actuals' },
      { label: 'Parental Sub Limit', value: 'INR 10 Lac' },
      { label: 'Parental Co-pay', value: 'Not applicable' },
      { label: 'Cataract', value: 'INR 50,000 per eye' },
      { label: 'Maternity cover', value: 'Normal — INR 1,25,000, C-section — INR 1,25,000' },
      { label: 'OPD', value: 'INR 10,000' },
      { label: 'Consumables', value: 'Covered' },
      { label: 'Domiciliary Hospitalization', value: 'Up to INR 2,50,000 (on IPD basis)' },
      { label: 'Modern Day/Advanced Treatments', value: 'Covered up to 100% of Sum Insured' },
    ],
    detail: {
      covered: [
        'Sum insured ₹15 Lakh — the highest tier',
        'Zero parental co-pay',
        'Maternity: Normal / C-section INR 1,25,000 each, pre & post-natal INR 10,000 within the maternity limit',
        'Well baby expense INR 5,000 within the maternity limit',
        'Twin baby coverage: 100% first baby, 50% second baby',
        'Cataract INR 50,000 per eye',
        'OPD cover up to INR 10,000',
        'Consumables covered',
        'Domiciliary hospitalization up to INR 2,50,000 on an IPD basis',
        'Modern/advanced treatments covered up to 100% of Sum Insured — richest benefit in the line-up',
      ],
      notCovered: [],
      notes: ['₹57,820 / family / year, GST inclusive.'],
    },
  },
];

// Level 4 — Group Term Life + Group Personal Accident. Source: "Symphony
// Plan.xlsx", sheets "GTL" and "GPA" — both are company-sponsored, sized at
// "2 Times of CTC" (a per-employee formula, not a flat sum insured), so
// there is no fixed ₹ figure this game can display/compare the way Tarento's
// fixed ₹25L/₹50L tiers do. Per client decision, Level 4 stays OFF
// (enableLevel4: false) until a flat representative figure is supplied, but
// this array is still authored (not left empty) with both sheets' terms
// folded into one bundled plan, per docs/client-onboarding.md's guidance to
// always author gtlPlans explicitly.
const symphonyaiGtlPlans: CompanyProfile['gtlPlans'] = [
  {
    id: 'gtl_gpa_2x_ctc',
    name: 'Term Life + Personal Accident Cover',
    // TODO(symphonyai): real sum insured is "2 Times of CTC" per employee —
    // no flat figure was supplied. Fill in a real number (or a per-band
    // table) before flipping enableLevel4 to true.
    si: 0,
    prem: 0,
    desc: 'Company-sponsored Group Term Life (2x annual CTC) bundled with Group Personal Accident cover (2x annual CTC) — accidental death, disability, and more, for your nominees.',
    detail: {
      covered: [
        'Term Life: base cover 2x CTC, Free Cover Limit INR 3,00,00,000',
        'Term Life: inbuilt Terminal Illness Benefit — 100% of Base Cover, capped at INR 50,00,000',
        'Term Life: optional Critical Illness rider (ABSLI Group Comprehensive CI-15)',
        'GPA: Sum Insured 2x CTC',
        'GPA — Accidental Death: 100% of Sum Insured',
        'GPA — Permanent Total Disability: up to 100% of Sum Insured',
        'GPA — Permanent Partial Disability: as per PPD table',
        'GPA — Temporary Total Disability: 1% of Sum Insured or INR 50,000/week (whichever is less), up to 104 weeks',
        'GPA — Medical Expenses: up to 20% of Sum Insured or 40% of admissible claim, whichever is lower',
        'GPA — Ambulance Hiring Charges: INR 2,500',
        'GPA — Education Benefit: up to INR 1,00,000 per child (max INR 2,00,000 for 2 children) below age 19, or 10% of Sum Insured, whichever is less',
        'GPA — Compassionate Visit: up to INR 25,000',
        'GPA — Terrorism: covered',
      ],
      notCovered: [
        'Term Life: suicide within 12 months of cover start/revival — nominee receives 100% of premiums paid, not the sum insured',
        'Term Life: 90-day waiting period on the Accelerated Critical Illness / Waiver-of-Premium riders',
        'GPA: pre-existing diseases, suicide/self-inflicted injury, intoxication, pregnancy/childbirth, professional sports, motor speed contests, aviation other than as a fare-paying passenger, underground mining/tunnelling, armed forces duty, and radioactivity/nuclear risks are excluded',
        'GPA: Any-One-Accident limit restricted to INR 50 crore or the top 10 lives’ sum insured (whichever is lower) per city, per event',
      ],
      notes: [
        'Sum insured for both benefits scales with each employee’s CTC — no flat figure available for in-game display, so Level 4 is disabled for SymphonyAI until one is supplied.',
      ],
    },
  },
];

export const symphonyaiProfile: CompanyProfile = {
  ...tarentoProfile,
  id: 'symphonyai',
  titleSuffix: 'SymphonyAI',
  COMPANY: 'SymphonyAI',
  TAGLINE: 'Benefits Adventure',
  // TODO(symphonyai): no logo/wordmark assets were supplied — these paths
  // point at public/branding/symphonyai/, which still needs logo.png,
  // logo.svg and a SymphonyAI wordmark dropped in (see
  // docs/client-onboarding.md Step 2). loophealth.png and the enrolment QR
  // have already been generated into that folder.
  LOGO_URL: assetPath('branding/symphonyai/logo.png'),
  LOGO_FALLBACK_URL: assetPath('branding/symphonyai/logo.svg'),
  partners: [
    { name: 'SymphonyAI', logoUrl: assetPath('branding/symphonyai/symphonyai.png') },
    { name: 'Loophealth', logoUrl: assetPath('branding/symphonyai/loophealth.png') },
  ],
  PORTAL_URL: 'https://benefits.loophealth.com/',
  PORTAL_HOST_LABEL: 'benefits.loophealth.com',
  PORTAL_QR_URL: assetPath('branding/symphonyai/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'SymphonyAI profile — complete enrolment on your company portal after selecting your GMC coverage.',
  // Family Structure (Modular sheet): Self + Spouse + 2 Kids + Parents or
  // Parents-in-law (no cross combination) — "1 + 5" family size.
  dependantStructure: { spouse: 1, child: 2, parent: 2 },
  gmcPlans: symphonyaiGmcPlans,
  gtlPlans: symphonyaiGtlPlans,
  enableLevel4: false,
  // No Super Top-Up product for SymphonyAI — stays inherited from
  // tarentoProfile (an empty array), same idiom Tarento itself documents.
  // superTopUpPlans: [] (inherited)
  // Add-ons: same Wellbeing Bazaar catalogue as every other client — stays
  // inherited from tarentoProfile, not overridden.
  // addons: tarentoProfile.addons (inherited)
  PLAYS_TABLE: 'plays_symphonyai',
  HOF_RPC: 'hall_of_fame_symphonyai',
};
