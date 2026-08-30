import { isDemoMode } from './demoMode';

export type PlayerSession = {
  fullName: string;
  department: string;
  /** When true, never write to Supabase / shared play dumps. */
  notEmployee: boolean;
};

let session: PlayerSession | null = null;

export function getPlayerSession(): PlayerSession | null {
  return session;
}

export function setPlayerSession(next: PlayerSession): void {
  session = {
    fullName: next.fullName.trim(),
    department: next.department.trim(),
    notEmployee: Boolean(next.notEmployee),
  };
}

export function clearPlayerSession(): void {
  session = null;
}

export function shouldPersistPlay(): boolean {
  // Admin Demo Mode and legacy notEmployee both skip cloud/local employee dumps.
  return Boolean(session && !session.notEmployee && !isDemoMode());
}
