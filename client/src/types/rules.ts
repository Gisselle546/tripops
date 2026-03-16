export type RuleType =
  | "NO_REDEYE"
  | "MAX_LAYOVERS"
  | "VEG_ONLY"
  | "DAILY_WALKING_CAP_KM"
  | "BUDGET_MAX_PER_PERSON";

export interface Rule {
  id: string;
  type: RuleType;
  enabled: boolean;
  params?: Record<string, unknown> | null;
  note?: string | null;
}

export interface RuleSet {
  id: string;
  tripId: string;
  rules: Rule[];
}
