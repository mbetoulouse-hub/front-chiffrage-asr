import { apiRequest } from "./api"
import type { CalculateRequest, CalculateResult } from "@/types/calculate";

export async function calculateEstimate(data: CalculateRequest): Promise<{ data?: CalculateResult; error?: string }> {
  return apiRequest<CalculateResult>("/calculate/submit", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function exportEstimate(data: CalculateRequest): Promise<{ data?: Blob; error?: string }> {
  return apiRequest<Blob>("/calculate/export", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
