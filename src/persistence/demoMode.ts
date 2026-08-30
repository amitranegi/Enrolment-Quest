/** Admin Demo Mode — stage jumping + optional validation skip; never persists to Supabase. */

let active = false;
let skipValidation = true;

export function isDemoMode(): boolean {
  return active;
}

export function setDemoMode(on: boolean): void {
  active = Boolean(on);
}

export function isDemoSkipValidation(): boolean {
  return active && skipValidation;
}

export function setDemoSkipValidation(on: boolean): void {
  skipValidation = Boolean(on);
}

export function getDemoSkipValidation(): boolean {
  return skipValidation;
}
