import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

// Level 2 — Group Medical Cover. Source: "NCSI Flex Plans with rates.xlsx",
// sheet "Flex Plan with rates" — 7 flex tiers (Plan I–VII). Unlike every
// other company so far, this sheet prices THREE separate sum-insured pools
// per tier (ESC / Parents / Parents-in-law — each its own floater, not
// additive), and splits premium into separate ESC, Parent and
// Parent-in-law rate rows rather than one all-in figure per tier.
//
// Modeling choices made here (flagged for review):
//   - `sums.si` uses the ESC (Employee+Spouse+Children) floater as the
//     headline figure — the employee's own personal cover — with the
//     Parent/Parent-in-law floaters called out separately in `features`,
//     same precedent as TATA AIA's grade-banded SI and Expleo's.
//   - `sums.prem` sums the sheet's "ESC Rate" (Employee Face Rate — row
//     labelled "ESC Emp Face Rates Excl GST", i.e. what the employee pays,
//     not the insurer's full cost) plus the "2 Parent Rate" and "2 Parent's
//     in Law" rows for that tier, since parents/in-laws are not
//     company-sponsored anywhere else in this game and the sheet gives no
//     separate employee/insurer split for them. Plan I has no parent
//     option, so its premium is the ESC face rate alone (₹0).
//   - All figures are EXCLUDING GST exactly as the sheet states — unlike
//     Expleo/Livspace, no GST-inclusive figure was supplied, so none is
//     invented here (same stance taken for TATA AIA's Super Top-Up).
const ncsiGmcPlans: CompanyProfile['gmcPlans'] = [
  {
    id: 'gmc_plan1',
    name: 'Plan I',
    desc: 'The essentials — you, your spouse and up to 2 children, on a single family-floater sum insured.',
    coverNote: 'Covers Employee, Spouse, 2 Dependent Children. No parent cover on this plan.',
    sums: [{ si: 500000, prem: 0, note: 'Company Sponsored, excl. GST', emi: null }],
    features: [
      { label: 'Sum Insured', value: 'Family Floater — INR 5,00,000 per family' },
      { label: 'Normal & ICU/CCU Room Rent', value: 'Normal — INR 7,500, ICU/CCU — INR 15,000' },
      { label: 'Modern Treatment', value: '100% of Sum Insured' },
      { label: 'Maternity', value: 'INR 1,00,000 for Normal & C-Section' },
      { label: 'Ambulance Charges', value: 'Covered up to INR 5,000 per claim' },
      { label: 'Domiciliary Treatment / Home Quarantine', value: 'Not Covered' },
    ],
    detail: {
      covered: ['Sum insured ₹5 Lakh family floater', 'Maternity INR 1,00,000', 'Modern treatment 100% of SI'],
      notCovered: ['No parent or parent-in-law cover on this plan', 'Domiciliary treatment not covered'],
      notes: ['Company Sponsored — ESC employee face rate ₹0, excl. GST.'],
    },
  },
  {
    id: 'gmc_plan2',
    name: 'Plan II',
    desc: 'Adds both sets of parents on their own separate cover, at the entry sum insured.',
    coverNote: 'Covers Employee, Spouse, 2 Dependent Children, 2 Parents AND 2 Parents-in-law.',
    sums: [{ si: 500000, prem: 32430, note: 'Paid upgrade, excl. GST (ESC ₹0 + Parents ₹16,215 + Parents-in-law ₹16,215)', emi: null }],
    features: [
      { label: 'Sum Insured', value: 'ESC — INR 5,00,000, Parents — INR 3,00,000, Parents-in-law — INR 3,00,000 (separate floaters)' },
      { label: 'Normal & ICU/CCU Room Rent', value: 'Normal — INR 7,500, ICU/CCU — INR 15,000' },
      { label: 'Modern Treatment', value: 'ESC 100% of SI, Parents 50% of SI' },
      { label: 'Maternity', value: 'INR 1,00,000 for Normal & C-Section' },
      { label: 'Ambulance Charges', value: 'Covered up to INR 5,000 per claim' },
      { label: 'Domiciliary Treatment / Home Quarantine', value: 'Not Covered' },
    ],
    detail: {
      covered: ['ESC ₹5L + Parents ₹3L + Parents-in-law ₹3L (separate floaters)', 'Both sets of parents covered together'],
      notCovered: ['Domiciliary treatment not covered'],
      notes: ['₹32,430 / family / year, excl. GST (ESC face rate ₹0 + 2 Parent ₹16,215 + 2 Parent-in-law ₹16,215).'],
    },
  },
  {
    id: 'gmc_plan3',
    name: 'Plan III',
    desc: 'Same family coverage as Plan II, with parents and parents-in-law raised to match your own sum insured.',
    coverNote: 'Covers Employee, Spouse, 2 Dependent Children, 2 Parents AND 2 Parents-in-law.',
    sums: [{ si: 500000, prem: 35900, note: 'Paid upgrade, excl. GST (ESC ₹0 + Parents ₹17,950 + Parents-in-law ₹17,950)', emi: null }],
    features: [
      { label: 'Sum Insured', value: 'ESC — INR 5,00,000, Parents — INR 5,00,000, Parents-in-law — INR 5,00,000 (separate floaters)' },
      { label: 'Normal & ICU/CCU Room Rent', value: 'Normal — INR 7,500, ICU/CCU — INR 15,000' },
      { label: 'Modern Treatment', value: 'ESC 100% of SI, Parents 50% of SI' },
      { label: 'Maternity', value: 'INR 1,00,000 for Normal & C-Section' },
      { label: 'Ambulance Charges', value: 'Covered up to INR 5,000 per claim' },
      { label: 'Domiciliary Treatment / Home Quarantine', value: 'Not Covered' },
    ],
    detail: {
      covered: ['ESC ₹5L + Parents ₹5L + Parents-in-law ₹5L (separate floaters)', 'Parents matched to your own sum insured'],
      notCovered: ['Domiciliary treatment not covered'],
      notes: ['₹35,900 / family / year, excl. GST (ESC face rate ₹0 + 2 Parent ₹17,950 + 2 Parent-in-law ₹17,950).'],
    },
  },
  {
    id: 'gmc_plan4',
    name: 'Plan IV',
    desc: 'Raises your own cover to ₹7 Lakh while keeping parents and parents-in-law at the entry sum insured.',
    coverNote: 'Covers Employee, Spouse, 2 Dependent Children, 2 Parents AND 2 Parents-in-law.',
    sums: [{ si: 700000, prem: 34930, note: 'Paid upgrade, excl. GST (ESC ₹2,500 + Parents ₹16,215 + Parents-in-law ₹16,215)', emi: null }],
    features: [
      { label: 'Sum Insured', value: 'ESC — INR 7,00,000, Parents — INR 3,00,000, Parents-in-law — INR 3,00,000 (separate floaters)' },
      { label: 'Normal & ICU/CCU Room Rent', value: 'Normal — INR 7,500, ICU/CCU — INR 15,000' },
      { label: 'Modern Treatment', value: 'ESC 100% of SI, Parents 50% of SI' },
      { label: 'Maternity', value: 'INR 1,00,000 for Normal & C-Section' },
      { label: 'Ambulance Charges', value: 'Covered up to INR 5,000 per claim' },
      { label: 'Domiciliary Treatment / Home Quarantine', value: 'Not Covered' },
    ],
    detail: {
      covered: ['ESC ₹7L + Parents ₹3L + Parents-in-law ₹3L (separate floaters)'],
      notCovered: ['Domiciliary treatment not covered'],
      notes: ['₹34,930 / family / year, excl. GST (ESC face rate ₹2,500 + 2 Parent ₹16,215 + 2 Parent-in-law ₹16,215).'],
    },
  },
  {
    id: 'gmc_plan5',
    name: 'Plan V',
    desc: 'A richer middle tier — higher maternity and ambulance limits, plus domiciliary treatment cover for the first time.',
    coverNote: 'Covers Employee, Spouse, 2 Dependent Children, 2 Parents AND 2 Parents-in-law.',
    sums: [{ si: 700000, prem: 40125, note: 'Paid upgrade, excl. GST (ESC ₹4,225 + Parents ₹17,950 + Parents-in-law ₹17,950)', emi: null }],
    features: [
      { label: 'Sum Insured', value: 'ESC — INR 7,00,000, Parents — INR 5,00,000, Parents-in-law — INR 5,00,000 (separate floaters)' },
      { label: 'Normal & ICU/CCU Room Rent', value: 'Normal — INR 7,500, ICU/CCU — INR 15,000' },
      { label: 'Modern Treatment', value: 'ESC 100% of SI, Parents 50% of SI' },
      { label: 'Maternity', value: 'INR 1,05,000 for Normal & C-Section' },
      { label: 'Ambulance Charges', value: 'Covered up to INR 10,000' },
      { label: 'Domiciliary Treatment / Home Quarantine', value: 'Covered up to INR 25,000 per family' },
    ],
    detail: {
      covered: ['ESC ₹7L + Parents ₹5L + Parents-in-law ₹5L (separate floaters)', 'Domiciliary treatment up to ₹25,000 per family'],
      notCovered: [],
      notes: ['₹40,125 / family / year, excl. GST (ESC face rate ₹4,225 + 2 Parent ₹17,950 + 2 Parent-in-law ₹17,950).'],
    },
  },
  {
    id: 'gmc_plan6',
    name: 'Plan VI',
    desc: 'Our second-highest tier — ₹10 Lakh of your own cover, higher room rent, ambulance and domiciliary limits.',
    coverNote: 'Covers Employee, Spouse, 2 Dependent Children, 2 Parents AND 2 Parents-in-law.',
    sums: [{ si: 1000000, prem: 53330, note: 'Paid upgrade, excl. GST (ESC ₹7,330 + Parents ₹23,000 + Parents-in-law ₹23,000)', emi: null }],
    features: [
      { label: 'Sum Insured', value: 'ESC — INR 10,00,000, Parents — INR 5,00,000, Parents-in-law — INR 5,00,000 (separate floaters)' },
      { label: 'Normal & ICU/CCU Room Rent', value: 'Normal — INR 8,500, ICU/CCU — INR 15,000' },
      { label: 'Modern Treatment', value: 'ESC 100% of SI, Parents 50% of SI' },
      { label: 'Maternity', value: 'INR 1,10,000 for Normal & C-Section' },
      { label: 'Ambulance Charges', value: 'Covered up to INR 15,000' },
      { label: 'Domiciliary Treatment / Home Quarantine', value: 'Covered up to INR 35,000 per family' },
    ],
    detail: {
      covered: ['ESC ₹10L + Parents ₹5L + Parents-in-law ₹5L (separate floaters)', 'Domiciliary treatment up to ₹35,000 per family'],
      notCovered: [],
      notes: ['₹53,330 / family / year, excl. GST (ESC face rate ₹7,330 + 2 Parent ₹23,000 + 2 Parent-in-law ₹23,000).'],
    },
  },
  {
    id: 'gmc_plan7',
    name: 'Plan VII',
    desc: 'The top tier — ₹10 Lakh of your own cover plus parents and parents-in-law matched up to ₹7 Lakh each.',
    coverNote: 'Covers Employee, Spouse, 2 Dependent Children, 2 Parents AND 2 Parents-in-law.',
    sums: [{ si: 1000000, prem: 65625, note: 'Paid upgrade, excl. GST (ESC ₹9,275 + Parents ₹28,175 + Parents-in-law ₹28,175)', emi: null }],
    features: [
      { label: 'Sum Insured', value: 'ESC — INR 10,00,000, Parents — INR 7,00,000, Parents-in-law — INR 7,00,000 (separate floaters)' },
      { label: 'Normal & ICU/CCU Room Rent', value: 'Normal — INR 8,500, ICU/CCU — INR 15,000' },
      { label: 'Modern Treatment', value: 'ESC 100% of SI, Parents 50% of SI' },
      { label: 'Maternity', value: 'INR 1,10,000 for Normal & C-Section' },
      { label: 'Ambulance Charges', value: 'Covered up to INR 15,000' },
      { label: 'Domiciliary Treatment / Home Quarantine', value: 'Covered up to INR 35,000 per family' },
    ],
    detail: {
      covered: ['ESC ₹10L + Parents ₹7L + Parents-in-law ₹7L (separate floaters) — the richest tier', 'Domiciliary treatment up to ₹35,000 per family'],
      notCovered: [],
      notes: ['₹65,625 / family / year, excl. GST (ESC face rate ₹9,275 + 2 Parent ₹28,175 + 2 Parent-in-law ₹28,175).'],
    },
  },
];

export const ncsiProfile: CompanyProfile = {
  ...tarentoProfile,
  id: 'ncsi',
  titleSuffix: 'NCSI',
  COMPANY: 'NCSI',
  TAGLINE: 'Benefits Adventure',
  // Only one logo asset was supplied (a PNG, no SVG) — fallback points at
  // the same file, same pattern as Expleo/SymphonyAI/TATA AIA/Symplr.
  LOGO_URL: assetPath('branding/ncsi/logo.png'),
  LOGO_FALLBACK_URL: assetPath('branding/ncsi/logo.png'),
  partners: [
    { name: 'NCSI', logoUrl: assetPath('branding/ncsi/logo.png') },
    { name: 'Loophealth', logoUrl: assetPath('branding/ncsi/loophealth.png') },
  ],
  PORTAL_URL: 'https://benefits.loophealth.com/',
  PORTAL_HOST_LABEL: 'benefits.loophealth.com',
  PORTAL_QR_URL: assetPath('branding/ncsi/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'NCSI profile — complete enrolment on your company portal after selecting your GMC coverage.',
  // Plan I has no parent slots; Plans II-VII support 2 Parents AND 2
  // Parents-in-law together (up to 4) — the family builder needs to allow
  // that many even though Plan I doesn't use them, same approach as
  // TATA AIA/Symplr.
  dependantStructure: { spouse: 1, child: 2, parent: 4 },
  gmcPlans: ncsiGmcPlans,
  // Add-ons: the standard Wellbeing Bazaar catalogue, minus the OPD wallet
  // (opd_wallet) — removed per instruction. Everything else is unchanged.
  addons: tarentoProfile.addons.filter((a) => a.id !== 'opd_wallet'),
  // No Super Top-Up or Term Life data supplied for NCSI.
  superTopUpPlans: [],
  gtlPlans: [],
  enableLevel4: false,
  PLAYS_TABLE: 'plays_ncsi',
  HOF_RPC: 'hall_of_fame_ncsi',
};
