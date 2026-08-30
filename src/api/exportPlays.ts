import { supabaseConfigured } from './supabaseClient';
import { getActiveCompany } from '../config/companies';

const fnBase =
  (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_URL
    ? `${String(import.meta.env.VITE_SUPABASE_URL).replace(/\/$/, '')}/functions/v1`
    : '');

export function exportEndpointReady(): boolean {
  return Boolean(supabaseConfigured && fnBase);
}

export function cloudExportGuidance(): string {
  const company = getActiveCompany().COMPANY;
  return exportEndpointReady()
    ? `Cloud export talks to the export-plays Edge Function (service role). Enter the admin password below for ${company}.`
    : 'Cloud export unavailable — set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.';
}

export async function fetchCloudPlays(
  adminSecret: string,
  format: 'json' | 'csv' = 'json',
): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  if (!exportEndpointReady()) {
    return { ok: false, message: 'Supabase functions URL not configured.' };
  }
  if (!adminSecret.trim()) {
    return { ok: false, message: 'Enter the admin export password.' };
  }
  try {
    const company = getActiveCompany().id;
    const res = await fetch(`${fnBase}/export-plays?format=${format}&company=${encodeURIComponent(company)}`, {
      method: 'GET',
      headers: {
        'x-admin-secret': adminSecret.trim(),
        'x-company': company,
        apikey: String(import.meta.env.VITE_SUPABASE_ANON_KEY || ''),
        Authorization: `Bearer ${String(import.meta.env.VITE_SUPABASE_ANON_KEY || '')}`,
      },
    });
    const text = await res.text();
    if (!res.ok) {
      let msg = text;
      try {
        msg = JSON.parse(text).error || text;
      } catch {
        /* keep raw */
      }
      return { ok: false, message: msg || `Export failed (${res.status})` };
    }
    return { ok: true, text };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Network error' };
  }
}
