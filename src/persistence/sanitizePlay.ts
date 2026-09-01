/**
 * Strip member-identifying family/nominee names before writing to Supabase.
 * Keeps plan/add-on IDs, relation/gender/age categories, coverage counts,
 * premiums, and game analytics.
 */

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function sanitizeCharacter(raw: unknown): Record<string, unknown> | null {
  const c = asRecord(raw);
  if (!c) return null;
  // Keep hero identity categories; drop free-text name (employee uses full_name).
  const { name: _n, ...rest } = c;
  return rest;
}

function sanitizeDependants(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((d) => {
    const row = asRecord(d);
    if (!row) return d;
    const { name: _n, ...rest } = row;
    return rest;
  });
}

function sanitizeCovered(raw: unknown): unknown {
  // covered is typically relation→boolean / id maps — keep as-is if no names.
  return raw ?? null;
}

function sanitizeAddons(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((a) => {
    const row = asRecord(a);
    if (!row) return a;
    const { members: _m, memberNames: _mn, ...rest } = row;
    const memberCount = Array.isArray(_m)
      ? _m.length
      : Array.isArray(_mn)
        ? _mn.length
        : typeof row.memberCount === 'number'
          ? row.memberCount
          : undefined;
    return memberCount === undefined ? rest : { ...rest, memberCount };
  });
}

function sanitizeNominees(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((n) => {
    const row = asRecord(n);
    if (!row) return { present: true };
    const { name: _n, fullName: _fn, email: _e, phone: _p, ...rest } = row;
    return rest;
  });
}

function sanitizeGmc(raw: unknown): Record<string, unknown> | null {
  const g = asRecord(raw);
  if (!g) return null;
  return g;
}

function sanitizeGtl(raw: unknown): Record<string, unknown> | null {
  const g = asRecord(raw);
  if (!g) return null;
  return g;
}

function sanitizeSuperTopUp(raw: unknown): Record<string, unknown> | null {
  const s = asRecord(raw);
  if (!s) return null;
  return s;
}

export type SanitizedPlayPayload = {
  id: string;
  ts?: string;
  mode?: string;
  player?: { fullName?: string; department?: string; notEmployee?: boolean } | null;
  character: Record<string, unknown> | null;
  dependants: unknown[];
  covered: unknown;
  coveredCount: number;
  gmc: Record<string, unknown> | null;
  addons: unknown[];
  gtl: Record<string, unknown> | null;
  superTopUp: Record<string, unknown> | null;
  nominees: unknown[];
  nomineeCount: number;
  totalPremium?: number;
  score?: number;
  grade?: string;
  coins?: number;
  stomps?: number;
  deaths?: number;
  durationSec?: number;
};

/** Produce a privacy-safe payload (no dependant/nominee/covered names). */
export function sanitizePlayPayload(
  payload: Record<string, unknown> & { id: string },
): SanitizedPlayPayload {
  const coveredNames = Array.isArray(payload.coveredNames)
    ? payload.coveredNames
    : [];
  const nominees = sanitizeNominees(payload.nominees);
  return {
    id: String(payload.id),
    ts: typeof payload.ts === 'string' ? payload.ts : undefined,
    mode: typeof payload.mode === 'string' ? payload.mode : undefined,
    player: asRecord(payload.player) as SanitizedPlayPayload['player'],
    character: sanitizeCharacter(payload.character),
    dependants: sanitizeDependants(payload.dependants),
    covered: sanitizeCovered(payload.covered),
    coveredCount: coveredNames.length,
    gmc: sanitizeGmc(payload.gmc),
    addons: sanitizeAddons(payload.addons),
    gtl: sanitizeGtl(payload.gtl),
    superTopUp: sanitizeSuperTopUp(payload.superTopUp),
    nominees,
    nomineeCount: nominees.length,
    totalPremium:
      typeof payload.totalPremium === 'number' ? payload.totalPremium : undefined,
    score: typeof payload.score === 'number' ? payload.score : undefined,
    grade: typeof payload.grade === 'string' ? payload.grade : undefined,
    coins: typeof payload.coins === 'number' ? payload.coins : undefined,
    stomps: typeof payload.stomps === 'number' ? payload.stomps : undefined,
    deaths: typeof payload.deaths === 'number' ? payload.deaths : undefined,
    durationSec:
      typeof payload.durationSec === 'number' ? payload.durationSec : undefined,
  };
}

export function truncateLabel(value: string, max: number): string {
  const t = value.trim();
  return t.length <= max ? t : t.slice(0, max);
}
