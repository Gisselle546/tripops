export type RuleType =
  | "MAX_BUDGET"
  | "NO_OVERLAP"
  | "MIN_LEAD_TIME"
  | "REQUIRED_BOOKING_STATUS"
  | "MAX_TRIP_DURATION";

export interface Rule {
  id: string;
  ruleSetId: string;
  type: RuleType;
  enabled: boolean;
  params?: Record<string, unknown>;
  note?: string;
}

export interface RuleSet {
  id: string;
  tripId: string;
  name: string;
  isActive: boolean;
  rules: Rule[];
}

export interface RuleSetResponse {
  tripId: string;
  ruleSet: RuleSet;
}
