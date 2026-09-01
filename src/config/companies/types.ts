export type CompanyPartner = {
  name: string;
  logoUrl: string;
};

export type CompanyProfile = {
  id: string;
  titleSuffix: string;
  TAGLINE: string;
  partners: CompanyPartner[];
  PORTAL_URL: string;
  PORTAL_HOST_LABEL: string;
  PORTAL_QR_URL: string;
  PORTAL_SUPPORT_COPY: string;
  PLAYS_TABLE: string;
  HOF_RPC: string;

  MODE: 'interest' | 'live';
  COMPANY: string;
  LOGO_URL: string;
  LOGO_FALLBACK_URL: string;
  dependantStructure: { spouse: number; child: number; parent: number };
  gmcPlans: Array<Record<string, unknown>>;
  addons: Array<Record<string, unknown> & { elig: (member: any) => boolean }>;
  gtlPlans: Array<Record<string, unknown>>;
  // Level 2 follow-up — optional paid Super Top-Up riders offered right after
  // a player confirms a `gmcPlans` choice. Each entry's `forGmcPlanId` must
  // match a `gmcPlans[].id` — only entries matching the just-picked GMC plan
  // are shown. Empty for companies with no Super Top-Up product.
  superTopUpPlans: Array<Record<string, unknown> & { forGmcPlanId: string }>;
  enableLevel4: boolean;
};

export type RuntimeCompanyConfig = Omit<
  CompanyProfile,
  'id' | 'titleSuffix' | 'partners'
>;
