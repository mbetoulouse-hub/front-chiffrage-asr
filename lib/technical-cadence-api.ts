import { apiRequest } from "./api"
import type { TechnicalCadence, TechnicalCadenceRate } from "@/types/multi-purpose";

export async function getTechnicalCadences(): Promise<{ data?: TechnicalCadence[]; error?: string }> {
  return apiRequest<TechnicalCadence[]>("/technical-cadence/all")
}

export async function getTechnicalCadenceRates(): Promise<{ data?: TechnicalCadenceRate[]; error?: string }> {
  return apiRequest<TechnicalCadenceRate[]>("/technical-cadence/rates")
}
