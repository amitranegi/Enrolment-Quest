import { supabase, supabaseConfigured } from '../api/supabaseClient';
import { getActiveCompany } from '../config/companies';
import { getPlayerSession, shouldPersistPlay } from './playerSession';
import { sanitizePlayPayload, type SanitizedPlayPayload } from './sanitizePlay';

export type PlayPayload = Record<string, unknown> & {
  id: string;
  score?: number;
  grade?: string;
  durationSec?: number;
  coins?: number;
  stomps?: number;
  deaths?: number;
  mode?: string;
};

/** Local draft for retry after network failure. */
const DRAFT_KEY = 'eq:lastPlayDraft';

export type PlayRow = {
  company_id?: string;
  full_name: string;
  department: string;
  mode: string;
  payload: SanitizedPlayPayload;
  score: number | null;
  grade: string | null;
  duration_sec: number | null;
  coins: number | null;
  stomps: number | null;
  deaths: number | null;
};

export async function persistInterestPlay(payload: PlayPayload): Promise<{
  ok: boolean;
  skipped?: boolean;
  message: string;
}> {
  const session = getPlayerSession();
  if (!session) {
    return {
      ok: false,
      message: 'Missing player details — go back and enter your name & department.',
    };
  }

  if (!shouldPersistPlay()) {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    return {
      ok: true,
      skipped: true,
      message: 'Demo mode — not saved to the employee database.',
    };
  }

  const fullName = session.fullName.trim();
  const department = session.department.trim();
  // Mirrors the plays_insert RLS check constraint, so a bad row fails here
  // with a readable message instead of a Postgres policy violation.
  if (fullName.length < 2 || fullName.length > 120) {
    return { ok: false, message: 'Full name must be 2–120 characters.' };
  }
  if (department.length < 1 || department.length > 120) {
    return { ok: false, message: 'Department is required (max 120 characters).' };
  }

  const sanitized = sanitizePlayPayload({
    ...payload,
    player: { fullName, department, notEmployee: session.notEmployee },
  });

  const row: PlayRow = {
    company_id: getActiveCompany().id,
    full_name: fullName,
    department,
    mode: String(payload.mode || 'interest'),
    payload: sanitized,
    score: payload.score ?? null,
    grade: payload.grade ?? null,
    duration_sec: payload.durationSec ?? null,
    coins: payload.coins ?? null,
    stomps: payload.stomps ?? null,
    deaths: payload.deaths ?? null,
  };

  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(row));
  } catch {
    /* ignore */
  }

  if (supabaseConfigured && supabase) {
    const playsTable = getActiveCompany().PLAYS_TABLE;
    // No .select() — public clients hold INSERT privilege only.
    const { error } = await supabase.from(playsTable).insert(row);
    if (error) {
      return {
        ok: false,
        message: `Save failed: ${error.message}. Your play is kept locally — tap retry.`,
      };
    }
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    mirrorLocally(row, String(payload.id), true);
    return { ok: true, message: 'Interest recorded in Supabase. Thank you!' };
  }

  // Fallback until Supabase env is set: localStorage (dev / pre-connect)
  if (mirrorLocally(row, String(payload.id), false)) {
    return {
      ok: true,
      message:
        'Interest saved on this device (Supabase not configured yet). Connect env keys for team dumps.',
    };
  }
  return { ok: false, message: 'Could not save locally.' };
}

/** Keeps the in-game Game Data screen usable — public clients cannot read back. */
function mirrorLocally(row: PlayRow, id: string, synced: boolean): boolean {
  try {
    localStorage.setItem(
      `eq:play:${id}`,
      JSON.stringify({ ...row, created_at: new Date().toISOString(), synced }),
    );
    return true;
  } catch {
    return false;
  }
}

export function listLocalPlays(): unknown[] {
  const rows: unknown[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('eq:play:')) {
        const v = localStorage.getItem(k);
        if (v) rows.push(JSON.parse(v));
      }
    }
  } catch {
    /* ignore */
  }
  return rows;
}
