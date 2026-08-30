export type PlanFeature = { label: string; value: string };

export type ChooserPlan = {
  id: string;
  name: string;
  /** Short pitch under the title — keep optional; L2 often omits it */
  tagline?: string;
  /** e.g. "Covers Self, Spouse, 3 Children…" */
  coverNote?: string;
  /** e.g. "₹ 5 Lakh sum insured" */
  sumLabel?: string;
  /** Omit to hide the price block (selection-only UIs). */
  priceLabel?: string;
  /** e.g. EMI line */
  priceSub?: string;
  /** Ribbon badge e.g. "Company Sponsored" */
  badge?: string;
  /** Visual badge tone */
  badgeTone?: 'sponsored' | 'value' | 'max' | 'default';
  /** 1–2 standout lines only (preferred over a long features list) */
  highlights?: string[];
  /** Portal-style feature rows (legacy / detail) */
  features?: PlanFeature[];
  /** Simple bullet list (term life / add-ons) */
  bullets?: string[];
  /** Visual tone for card chrome */
  tone?: 'base' | 'gold' | 'diamond' | 'teal' | 'default';
};

export type PlanChooserConfig = {
  title: string;
  subtitle?: string;
  plans: ChooserPlan[];
  /** Multi-select (add-ons / members) — confirm returns all selected ids */
  multiSelect?: boolean;
  initialPlanId?: string;
  initialSelectedIds?: string[];
  confirmLabel?: string;
  /** Headline of the prompt shown when the player tries to continue without choosing. */
  nudgeTitle?: string;
  /** One concise line asking the player to choose. */
  emptyNudge?: string;
  paintBackground?: (canvas: HTMLCanvasElement) => void;
  onConfirm: (planId: string) => void;
  onConfirmMulti?: (planIds: string[]) => void;
  onClose: () => void;
};
