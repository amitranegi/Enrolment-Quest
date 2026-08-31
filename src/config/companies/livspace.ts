import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

// Level 2 — Group Medical Cover. Source: "Livspace plan details.csv" (Livspace - Final Flex Plans).
// The source data models 2 family structures ("Base" = 1+3, "Extended Family" = 1+5),
// each with an optional Super Top-Up rider layered on top of the base sum insured.
// Each plan card below uses multiple `sums` entries to represent: the free/base-only
// option, then each Super Top-Up tier as a cumulative SI + cumulative premium upgrade.
// EMI is left `null` throughout — the source data gives annual premiums only, no
// confirmed installment count, so no EMI figure is invented here.
const livspaceGmcPlans: CompanyProfile['gmcPlans'] = [
  {
    id: 'gmc_base',
    name: 'Base',
    desc: 'Solid essential health cover for you, your spouse and children — with the option to boost protection via a Super Top-Up.',
    coverNote: 'Covers Self, Spouse, 2 Children (1+3).',
    sums: [
      { si: 300000, prem: 0, note: 'Base GMC — Company Sponsored', emi: null },
      { si: 600000, prem: 4963, note: '+ Super Top-Up 3L (Deductible ₹3L)', emi: null },
      { si: 800000, prem: 6318, note: '+ Super Top-Up 5L (Deductible ₹3L)', emi: null },
      { si: 1050000, prem: 7576, note: '+ Super Top-Up 7.5L (Deductible ₹3L)', emi: null },
    ],
    features: [
      { label: 'Normal Room Rent', value: '2% of Sum Insured' },
      { label: 'Co-payment on ESC', value: '5%' },
      { label: 'Cataract (per eye)', value: 'INR 30,000' },
      { label: 'Hernia (per site)', value: 'INR 50,000' },
      { label: 'Knee / Joint replacement', value: 'Capped at INR 1,50,000 per knee' },
      { label: 'Maternity cover', value: 'Normal — INR 50,000, C-section — INR 75,000' },
      { label: 'LASIK Surgery', value: 'Covered if correction index is above +/- 5' },
    ],
    detail: {
      covered: [
        'Sum insured ₹3 Lakh (Self + Spouse + 2 Children)',
        'Maternity: Normal INR 50,000 / C-section INR 75,000',
        'Cataract INR 30,000 per eye, Hernia INR 50,000 per site',
        'Knee/Joint replacement capped at INR 1,50,000 per knee',
        'LASIK when correction index is above +/- 5',
        'Optional Super Top-Up: add ₹3L / ₹5L / ₹7.5L cover (deductible ₹3L) for ₹4,963 / ₹6,318 / ₹7,576',
      ],
      notCovered: [
        '5% co-pay on ESC (Employee-Spouse-Child) claims',
        "Super Top-Up excludes maternity and the base plan's capped ailments; instead covers Nasal Sinus Surgery up to INR 35,000 and psychiatric hospitalisation up to INR 30,000",
        'Super Top-Up LASIK threshold is +/- 7.5 (vs +/- 5 on the base plan)',
      ],
      notes: ['Company Sponsored — starts from ₹0 / family / year. Super Top-Up is optional and paid by the employee.'],
    },
  },
  {
    id: 'gmc_extended',
    name: 'Extended Family',
    desc: 'Extend cover to your parents or parents-in-law, with the option to boost protection via a Super Top-Up.',
    coverNote: 'Covers Self, Spouse, 2 Children, Parents or Parents-in-law (1+5).',
    sums: [
      { si: 300000, prem: 34098, note: 'Extended Family GMC (₹3L for Self/Spouse/Children, ₹2L sublimit for Parents)', emi: null },
      { si: 600000, prem: 51352, note: '+ Super Top-Up 3L (Deductible ₹2L)', emi: null },
      { si: 800000, prem: 56674, note: '+ Super Top-Up 5L (Deductible ₹2L)', emi: null },
    ],
    features: [
      { label: 'Normal Room Rent', value: '2% of Sum Insured' },
      { label: 'Co-payment on ESC', value: '5%' },
      { label: 'Co-payment Parental', value: '10%' },
      { label: 'Parental Sum Insured', value: 'INR 2,00,000 (sublimit within the ₹3L cover)' },
      { label: 'Cataract (per eye)', value: 'INR 30,000' },
      { label: 'Hernia (per site)', value: 'INR 50,000' },
      { label: 'Knee / Joint replacement', value: 'Capped at INR 1,50,000 per knee' },
      { label: 'Maternity cover', value: 'Normal — INR 50,000, C-section — INR 75,000' },
      { label: 'LASIK Surgery', value: 'Covered if correction index is above +/- 5' },
    ],
    detail: {
      covered: [
        'Sum insured ₹3 Lakh (₹2L sublimit for parents/parents-in-law)',
        'Maternity: Normal INR 50,000 / C-section INR 75,000',
        'Cataract INR 30,000 per eye, Hernia INR 50,000 per site',
        'Knee/Joint replacement capped at INR 1,50,000 per knee',
        'LASIK when correction index is above +/- 5',
        'Optional Super Top-Up: add ₹3L / ₹5L cover (deductible ₹2L) for ₹17,254 / ₹22,576, with parental top-up sublimits of ₹3L / ₹5L',
      ],
      notCovered: [
        '5% co-pay on ESC claims, 10% co-pay on parental claims',
        "Super Top-Up excludes maternity and the base plan's capped ailments; instead covers Nasal Sinus Surgery up to INR 35,000 and psychiatric hospitalisation up to INR 30,000",
        'Super Top-Up LASIK threshold is +/- 7.5 (vs +/- 5 on the base plan)',
      ],
      notes: ['Starts from ₹34,098 / family / year. Super Top-Up is optional and paid by the employee.'],
    },
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
  addons: livspaceAddons,
  // No GTL policy for Livspace — Level 4 stays off.
  gtlPlans: [],
  enableLevel4: false,
  PLAYS_TABLE: 'plays_livspace',
  HOF_RPC: 'hall_of_fame_livspace',
};
