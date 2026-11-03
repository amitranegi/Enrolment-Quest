import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

const arcelorMittalGmcPlans: CompanyProfile['gmcPlans'] = [
  {
    id: 'gmc_modular',
    name: 'Modular GMC Policy',
    desc: 'Your company-sponsored Group Medical Cover for you and your family, with no employee premium.',
    coverNote: 'Covers Employee, Spouse and up to 3 Dependent Children. Sum insured is grade-based.',
    sums: [{
      si: null,
      siLabel: 'Grade-based sum insured',
      prem: 0,
      note: 'Company sponsored — ₹0 / family / year',
      emi: null,
    }],
    features: [
      { label: 'Sum insured', value: 'Grade-based — see policy details' },
      { label: 'Room rent & ICU', value: 'At actuals' },
      { label: 'Maternity', value: '₹1,50,000 normal or C-section; waiting period waived' },
      { label: 'Pre / post hospitalisation', value: '60 / 90 days' },
      { label: 'Ambulance', value: 'Up to ₹10,000 per incident' },
      { label: 'Daycare', value: '130+ procedures covered' },
      { label: 'Newborn', value: 'Covered from day one' },
    ],
    detail: {
      covered: [
        'Hospitalisation over 24 hours, with cashless or reimbursement benefits up to the sum insured',
        'Room and ICU charges at actuals; doctor and surgical fees, dressings, splints, casts, and hospital tests',
        'Pre-hospitalisation expenses for 60 days and post-hospitalisation expenses for 90 days, including related tests, follow-up consultations, and medication',
        'Ambulance charges up to ₹10,000 per incident',
        '130+ daycare procedures, including cataract, dialysis, and radiotherapy',
        'Normal and cesarean maternity cover of ₹1,50,000 each; 9-month waiting period waived',
        'Newborn covered from day one; pre- and post-natal expenses up to ₹7,000 within the maternity limit',
        'Medically required inpatient AYUSH treatment up to 25% of the sum insured, capped at ₹25,000, subject to the policy conditions',
        'Internal congenital disease and hospitalization arising out of terrorism',
        'External congenital disease in life-threatening conditions',
        'LASIK when the correction index is + or -6.5',
        'Cochlear implant up to 50% of the sum insured on an inpatient basis; psychiatric hospitalization up to ₹30,000 within the sum insured',
        'Specified modern treatments up to 100% of the sum insured on an inpatient basis; ultra-modern medicine up to 50% of the sum insured',
        'IVF up to the maternity limit on an inpatient basis',
      ],
      notCovered: [
        'The policy family definition lists the employee, spouse, and up to 3 dependent children; parents are not listed.',
      ],
      notes: [
        'Company sponsored — ₹0 / family / year.',
        'Sum insured is grade-based; the supplied policy document does not include the grade-wise amounts.',
        'Policy period: 1 November 2026 – 31 October 2027.',
        'The policy lists employee and spouse ages as 18–60. Its family definition says dependent children up to 25; the age-bracket section lists sons up to 25 and unmarried daughters up to 35. Confirm eligibility with HR.',
        'Insurance partner: Care Health Insurance. TPA: Care Health In House.',
        'Add a newborn or spouse through HR within 30 days of birth or marriage, respectively, to ensure coverage is valid from day one.',
        'Normal room rent includes nursing and RMO charges; separately billed nursing or RMO charges are payable by the insured person.',
      ],
      policyUrl: assetPath('branding/arcelormittal/modular-policy.pdf'),
    },
  },
];

export const arcelorMittalProfile: CompanyProfile = {
  ...tarentoProfile,
  id: 'arcelormittal',
  titleSuffix: 'Arcelor Mittal',
  COMPANY: 'Arcelor Mittal',
  TAGLINE: 'Benefits Adventure',
  LOGO_URL: assetPath('branding/arcelormittal/logo.png'),
  LOGO_FALLBACK_URL: assetPath('branding/arcelormittal/logo.png'),
  partners: [
    { name: 'Arcelor Mittal', logoUrl: assetPath('branding/arcelormittal/logo.png') },
    { name: 'Loophealth', logoUrl: assetPath('branding/loophealth.png') },
  ],
  PORTAL_URL: 'https://benefits.loophealth.com/',
  PORTAL_HOST_LABEL: 'benefits.loophealth.com',
  PORTAL_QR_URL: assetPath('branding/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'Arcelor Mittal profile — review your company-sponsored cover, then complete enrolment on the employee portal.',
  PLAYS_TABLE: 'plays_arcelormittal',
  HOF_RPC: 'hall_of_fame_arcelormittal',
  dependantStructure: { spouse: 1, child: 3, parent: 0 },
  gmcPlans: arcelorMittalGmcPlans,
  addons: tarentoProfile.addons.filter((addon) => addon.id !== 'opd_wallet'),
  gtlPlans: [],
  superTopUpPlans: [],
  enableLevel4: false,
};
