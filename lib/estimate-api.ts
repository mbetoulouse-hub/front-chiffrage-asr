import type { CreateEstimateData, EstimateData, EstimateListResponse, GetEstimateData, UpdateEstimateData } from "@/types/estimate";
import { apiRequest } from "./api"

// Admin API functions

export async function createEstimate(estimateData: CreateEstimateData): Promise<{ data?: EstimateData; error?: string }> {
  return apiRequest("/estimate/create", {
    method: "POST",
    body: JSON.stringify(estimateData),
  })
}

export async function updateEstimate(estimateData: UpdateEstimateData): Promise<{ data?: UpdateEstimateData; error?: string }> {
  return apiRequest("/estimate/update", {
    method: "PUT",
    body: JSON.stringify(estimateData),
  })
}

export async function fetchEstimates(page = 0, input: string, status: string): Promise<{ data?: EstimateListResponse; error?: string }> {
  return apiRequest<EstimateListResponse>(`/estimate/all?page=${page}&input=${encodeURIComponent(input)}&status=${status}`)
}

export async function fetchEstimate(id: number): Promise<{ data?: GetEstimateData; error?: string }> {
  return apiRequest<GetEstimateData>(`/estimate/get?id=${id}`)
}

export async function deleteEstimate(id: number): Promise<{ data?: any; error?: string }> {
  return apiRequest(`/estimate/delete?id=${id}`, {
    method: "DELETE",
  })
}
