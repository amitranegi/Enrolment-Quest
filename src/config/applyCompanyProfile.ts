import type { CompanyProfile, RuntimeCompanyConfig } from './companies/types';

export function applyCompanyProfile(target: RuntimeCompanyConfig, profile: CompanyProfile): void {
  target.MODE = profile.MODE;
  target.COMPANY = profile.COMPANY;
  target.LOGO_URL = profile.LOGO_URL;
  target.LOGO_FALLBACK_URL = profile.LOGO_FALLBACK_URL;
  target.TAGLINE = profile.TAGLINE;
  target.PORTAL_URL = profile.PORTAL_URL;
  target.PORTAL_HOST_LABEL = profile.PORTAL_HOST_LABEL;
  target.PORTAL_QR_URL = profile.PORTAL_QR_URL;
  target.PORTAL_SUPPORT_COPY = profile.PORTAL_SUPPORT_COPY;
  target.PLAYS_TABLE = profile.PLAYS_TABLE;
  target.HOF_RPC = profile.HOF_RPC;
  target.dependantStructure = profile.dependantStructure;
  target.gmcPlans = profile.gmcPlans;
  target.addons = profile.addons;
  target.gtlPlans = profile.gtlPlans;
  target.enableLevel4 = profile.enableLevel4;
}
