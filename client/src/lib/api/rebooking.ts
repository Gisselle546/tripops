import { apiClient } from "./client";
import type {
  RebookingCase,
  RebookingCaseDetail,
  DisruptionEvent,
} from "@/types/rebooking";
import type { AxiosResponse } from "axios";

export interface SimulateDisruptionBody {
  bookingId: string;
  type: "DELAY" | "CANCELLATION" | "CHANGE";
  description: string;
}

export interface GenerateOptionsBody {
  constraints?: Record<string, unknown>;
}

export interface DecideBody {
  chosenOptionId: string;
  rationale?: string;
}

export const rebookingApi = {
  // GET /trips/:tripId/rebooking/cases
  listCases: (tripId: string) =>
    apiClient
      .get<RebookingCase[]>(`/trips/${tripId}/rebooking/cases`)
      .then((r: AxiosResponse<RebookingCase[]>) => r.data),

  // GET /trips/:tripId/rebooking/cases/:caseId
  getCase: (tripId: string, caseId: string) =>
    apiClient
      .get<RebookingCaseDetail>(`/trips/${tripId}/rebooking/cases/${caseId}`)
      .then((r: AxiosResponse<RebookingCaseDetail>) => r.data),

  // POST /trips/:tripId/rebooking/simulate-disruption
  simulateDisruption: (tripId: string, body: SimulateDisruptionBody) =>
    apiClient
      .post<DisruptionEvent>(
        `/trips/${tripId}/rebooking/simulate-disruption`,
        body,
      )
      .then((r: AxiosResponse<DisruptionEvent>) => r.data),

  // POST /trips/:tripId/rebooking/cases/:caseId/generate-options
  generateOptions: (
    tripId: string,
    caseId: string,
    body?: GenerateOptionsBody,
  ) =>
    apiClient
      .post<RebookingCaseDetail>(
        `/trips/${tripId}/rebooking/cases/${caseId}/generate-options`,
        body ?? {},
      )
      .then((r: AxiosResponse<RebookingCaseDetail>) => r.data),

  // POST /trips/:tripId/rebooking/cases/:caseId/decide
  decide: (tripId: string, caseId: string, body: DecideBody) =>
    apiClient
      .post<RebookingCaseDetail>(
        `/trips/${tripId}/rebooking/cases/${caseId}/decide`,
        body,
      )
      .then((r: AxiosResponse<RebookingCaseDetail>) => r.data),

  // POST /trips/:tripId/rebooking/cases/:caseId/apply
  apply: (tripId: string, caseId: string) =>
    apiClient
      .post<RebookingCaseDetail>(
        `/trips/${tripId}/rebooking/cases/${caseId}/apply`,
      )
      .then((r: AxiosResponse<RebookingCaseDetail>) => r.data),
};
