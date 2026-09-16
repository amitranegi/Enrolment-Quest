import { demoProfile } from './demo';
import { expleoProfile } from './expleo';
import { livspaceProfile } from './livspace';
import { partnerProfile } from './partner';
import { symphonyaiProfile } from './symphonyai';
import { tarentoProfile } from './tarento';
import { tataaiaProfile } from './tataaia';
import type { CompanyProfile } from './types';

export const companyProfiles: CompanyProfile[] = [
  tarentoProfile,
  demoProfile,
  partnerProfile,
  livspaceProfile,
  expleoProfile,
  symphonyaiProfile,
  tataaiaProfile,
];

const companyById = new Map(companyProfiles.map((profile) => [profile.id, profile] as const));
let activeCompanyId = tarentoProfile.id;

export function listCompanies(): CompanyProfile[] {
  return companyProfiles;
}

export function getCompany(id: string): CompanyProfile {
  return companyById.get(id) || tarentoProfile;
}

export function getActiveCompany(): CompanyProfile {
  return getCompany(activeCompanyId);
}

export function getActiveCompanyId(): string {
  return activeCompanyId;
}

export function setActiveCompany(id: string): CompanyProfile {
  const profile = getCompany(id);
  activeCompanyId = profile.id;
  return profile;
}
