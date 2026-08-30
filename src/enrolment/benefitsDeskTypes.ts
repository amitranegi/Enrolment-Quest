export type DeskStep = 'browse' | 'detail' | 'compare' | 'confirm';

export type DeskPlan = {
  id: string;
  name: string;
  shortDesc: string;
  priceLabel: string;
  badges?: string[];
  detail: {
    covered: string[];
    notCovered: string[];
    notes: string[];
  };
  compare: Record<string, string | number | boolean>;
};

export type DeskConfig = {
  title: string;
  subtitle?: string;
  plans: DeskPlan[];
  compareKeys: { key: string; label: string }[];
  initialPlanId?: string;
  initialCompareIds?: string[];
  /** When true, browse cards toggle multi-select; confirm returns all selected ids. */
  multiSelect?: boolean;
  /** Hide compare step (useful for add-ons / nominees). */
  hideCompare?: boolean;
  onConfirm: (planId: string) => void;
  onConfirmMulti?: (planIds: string[]) => void;
  onClose: () => void;
};
