import { assetPath } from '../assetPath';
import { tarentoProfile } from './tarento';
import type { CompanyProfile } from './types';

const demoGmcPlans = tarentoProfile.gmcPlans.slice(0, 2).map((plan) => ({ ...plan }));
const demoAddons = tarentoProfile.addons.slice(0, 8).map((addon) => ({ ...addon }));

export const demoProfile: CompanyProfile = {
  ...tarentoProfile,
  id: 'demo',
  titleSuffix: 'Demo Co',
  COMPANY: 'Demo Co',
  TAGLINE: 'Benefits Sandbox',
  LOGO_URL: assetPath('branding/demo/logo.svg'),
  LOGO_FALLBACK_URL: assetPath('branding/demo/logo.svg'),
  partners: [
    { name: 'Demo Co', logoUrl: assetPath('branding/demo/company.svg') },
    { name: 'Loophealth', logoUrl: assetPath('branding/demo/loophealth.png') },
  ],
  PORTAL_URL: 'https://benefits.loophealth.com/',
  PORTAL_HOST_LABEL: 'benefits.loophealth.com',
  PORTAL_QR_URL: assetPath('branding/demo/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'Demo profile — review this flow, then complete your real enrolment on the employee portal.',
  dependantStructure: { spouse: 1, child: 2, parent: 1 },
  gmcPlans: demoGmcPlans,
  addons: demoAddons,
  PLAYS_TABLE: 'plays_demo',
  HOF_RPC: 'hall_of_fame_demo',
};
