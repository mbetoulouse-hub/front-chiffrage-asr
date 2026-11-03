import type { SectorType } from "@/types/sector";
import { apiRequest } from "./api"

export async function getSectorTypes(): Promise<{ data?: SectorType[]; error?: string }> {
  return apiRequest<SectorType[]>("/sector/types")
}
