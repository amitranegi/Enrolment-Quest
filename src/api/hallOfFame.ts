import { supabase, supabaseConfigured } from './supabaseClient';
import { getActiveCompany } from '../config/companies';

export type HallOfFameRow = {
  display_name: string;
  department: string | null;
  score: number;
  grade: string | null;
};

/**
 * Public top scores via the `hall_of_fame` RPC. The `plays` table itself is
 * insert-only for anon, so the RPC is the only read path. Name and department
 * are already trimmed and truncated server-side.
 */
export async function fetchHallOfFame(limit = 8): Promise<HallOfFameRow[]> {
  if (!supabaseConfigured || !supabase) return [];
  const rpcName = getActiveCompany().HOF_RPC;
  try {
    const { data, error } = await supabase.rpc(rpcName, { limit_n: limit });
    if (error) {
      console.warn('[hall_of_fame]', rpcName, error.message);
      return [];
    }
    return (data || []) as HallOfFameRow[];
  } catch (e) {
    console.warn('[hall_of_fame]', e);
    return [];
  }
}
