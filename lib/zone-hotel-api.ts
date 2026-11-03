import { apiRequest } from "./api"
import { ZoneHotelPrefillRoomType } from "@/types/hotel";

export async function fetchPrefillRoomType(): Promise<{ data?: ZoneHotelPrefillRoomType; error?: string }> {
  return apiRequest<ZoneHotelPrefillRoomType>("/hotel/types")
}
