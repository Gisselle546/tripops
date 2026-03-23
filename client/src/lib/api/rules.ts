import { apiClient } from "./client";
import type { RuleSetResponse, Rule } from "@/types/rules";
import type { AxiosResponse } from "axios";

export interface UpsertRuleSetBody {
  name: string;
  isActive?: boolean;
  rules: Array<{
    type: string;
    enabled: boolean;
    params?: Record<string, unknown>;
    note?: string;
  }>;
}

export interface EvaluateItemResult {
  passed: boolean;
  violations: Array<{
    ruleId: string;
    type: string;
    message: string;
  }>;
}

export const rulesApi = {
  // GET /trips/:tripId/rules  → { tripId, ruleSet: RuleSet }
  get: (tripId: string) =>
    apiClient
      .get<RuleSetResponse>(`/trips/${tripId}/rules`)
      .then((r: AxiosResponse<RuleSetResponse>) => r.data),

  // PUT /trips/:tripId/rules  (full replace)
  upsert: (tripId: string, body: UpsertRuleSetBody) =>
    apiClient
      .put<RuleSetResponse>(`/trips/${tripId}/rules`, body)
      .then((r: AxiosResponse<RuleSetResponse>) => r.data),

  // POST /trips/:tripId/rules/evaluate-item
  evaluateItem: (tripId: string, itineraryItemId: string) =>
    apiClient
      .post<EvaluateItemResult>(`/trips/${tripId}/rules/evaluate-item`, {
        itineraryItemId,
      })
      .then((r: AxiosResponse<EvaluateItemResult>) => r.data),
};
