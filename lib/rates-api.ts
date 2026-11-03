import type { RatesResponse } from "@/types/rates";
import { apiRequest } from "./api"

export async function getRates(): Promise<{ data?: RatesResponse; error?: string }> {
  return apiRequest<RatesResponse>("/rates")
}
