export type AddonFeature = { label: string; value: string };

export type AddonCard = {
  id: string;
  name: string;
  desc: string;
  /** e.g. "₹499" — amount shown bold. Omit to hide price UI. */
  priceLabel?: string;
  /** e.g. "/member" or "/family" */
  priceUnit?: string;
  priceSub?: string;
  /** Eligibility copy under the card */
  eligNote: string;
  /** "4 members are eligible for this" */
  eligCountLabel?: string;
  /** e.g. "3 options available" */
  optionsLabel?: string;
  /** Tag ribbon e.g. "NEW PRODUCT", "Gifts inside" */
  badge?: string;
  /** Tag visual tone */
  badgeTone?: 'new' | 'gift' | 'hot' | 'promo' | 'default';
  /** Header tone for card chrome */
  tone?: 'rose' | 'teal' | 'amber' | 'violet' | 'gold' | 'default';
  /** Visual spotlight for limited-time promos. */
  promo?: boolean;
  brand?: string;
  /** Optional product image in the header (portal-style). Falls back to mini icon. */
  imageUrl?: string;
  features?: AddonFeature[];
  bullets?: string[];
};

export type AddonBazaarConfig = {
  title: string;
  subtitle?: string;
  cards: AddonCard[];
  initialSelectedIds?: string[];
  confirmLabel?: string;
  /** Headline of the prompt shown when the player tries to continue empty-handed. */
  nudgeTitle?: string;
  /** One concise line asking the player to add something. */
  emptyNudge?: string;
  paintBackground?: (canvas: HTMLCanvasElement) => void;
  /** Called with selected addon ids (may be empty — add-ons are optional). */
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
};
