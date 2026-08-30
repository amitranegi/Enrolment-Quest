export type PartyRelation = 'self' | 'spouse' | 'child' | 'parent';

export type PartySlot = {
  slot: string;
  relation: PartyRelation;
  label: string;
  memberId: string | null;
  name: string;
  age: number | '';
  gender: string;
  covered: boolean;
  empty: boolean;
};

export type PartyZoneConfig = {
  companyName: string;
  /** Company logo URL (PNG preferred). Shown as image only — no text wordmark. */
  logoUrl?: string;
  /** Optional secondary logo URL if primary fails to load. */
  logoFallbackUrl?: string;
  title: string;
  structureNote: string;
  maritalStatus: string;
  /** Sprite-system background key, e.g. bg_l1 — painted into the scene canvas. */
  bgSpriteKey?: string;
  getSlots: () => PartySlot[];
  /** Paint one party member into a canvas (empty silhouette or filled sprite). */
  paintMember: (
    canvas: HTMLCanvasElement,
    slot: PartySlot,
    frame: number,
  ) => void;
  /** Paint full-bleed background from the sprite engine (optional). */
  paintBackground?: (canvas: HTMLCanvasElement) => void;
  /** Paint stage ground strip using level tile sprites (optional). */
  paintGround?: (canvas: HTMLCanvasElement) => void;
  /** Name is required; age/gender optional (engine may fill defaults). */
  onSaveSlot: (
    slot: string,
    data: { name: string; age?: number; gender?: string },
  ) => string | null;
  onClearSlot: (slot: string) => void;
  onConfirm: (coveredIds: string[]) => void;
  onClose: () => void;
};
