/** First-look enemy intros — static copy linking foes to enrolment benefits. */

export type EnemyIntroKey = 'sneezy' | 'bill' | 'junk' | 'bone' | 'denier' | 'spike';

export type EnemyIntroDef = {
  key: EnemyIntroKey;
  name: string;
  /** 4–7 words: what to watch out for in a fight. */
  foeLine: string;
  /** One plain line: why this benefit matters in real life. */
  benefitWhy: string;
  /** The benefit to pick, named clearly. */
  benefitTag: string;
};

export const ENEMY_INTROS: Record<EnemyIntroKey, EnemyIntroDef> = {
  sneezy: {
    key: 'sneezy',
    name: 'Sneezy Sprinter',
    foeLine: 'Sneezes, then dashes straight at you.',
    benefitWhy: 'Everyday coughs and colds mean clinic visits, tests and medicines.',
    benefitTag: 'Add Wellness benefits like Annual Health Checkup',
  },
  bill: {
    key: 'bill',
    name: 'Bill Blaster',
    foeLine: 'Throws hospital bills from a distance.',
    benefitWhy: 'A single hospital stay can cost more than months of savings.',
    benefitTag: 'Pick GMC — Hospital Cover',
  },
  junk: {
    key: 'junk',
    name: 'JunkZilla',
    foeLine: 'Greasy blob — slows you, takes coins.',
    benefitWhy: 'Small daily habits shape how you feel a year from now.',
    benefitTag: 'Add Fitness & Nutrition benefits',
  },
  bone: {
    key: 'bone',
    name: 'Bone Rattler',
    foeLine: 'Hit it twice — it rebuilds once.',
    benefitWhy: 'Bone and joint trouble needs longer care, especially for parents.',
    benefitTag: 'Cover parents in GMC + Elder Care',
  },
  denier: {
    key: 'denier',
    name: 'Claim Denier',
    foeLine: 'Shielded in front — strike from behind.',
    benefitWhy: 'Thinner plans can leave you paying a share of the bill.',
    benefitTag: 'Compare your GMC plan options',
  },
  spike: {
    key: 'spike',
    name: 'Premium Spike',
    foeLine: 'Sits still, then leaps without warning.',
    benefitWhy: 'Life is unpredictable — the people who rely on you deserve a cushion.',
    benefitTag: 'Pick Term Life + add nominees',
  },
};

/** In-memory only — resets every new game / demo jump. Never localStorage. */
export const enemyIntroSeen: Set<string> = new Set();

export function resetEnemyIntroSession(): void {
  enemyIntroSeen.clear();
  // Drop any leftover key from the earlier forever-persist experiment.
  try {
    localStorage.removeItem('eq:enemyIntroSeen');
  } catch {
    /* ignore */
  }
}

export function markEnemyIntroSeen(type: string): void {
  enemyIntroSeen.add(type);
}

export function isEnemyIntroKey(t: string): t is EnemyIntroKey {
  return t in ENEMY_INTROS;
}

export function getEnemyIntro(type: string): EnemyIntroDef | null {
  return isEnemyIntroKey(type) ? ENEMY_INTROS[type] : null;
}
