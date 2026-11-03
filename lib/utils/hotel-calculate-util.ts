import type { HotelRoomCount, HotelRoomType, HotelZoneData } from "@/types/hotel";

export function getClearanceUnitPrice(
  roomType: HotelRoomType,
  globalRate: number
): number {
  return (roomType.clearanceRate / 60) * globalRate;
}

export function getRecoucheUnitPrice(
  roomType: HotelRoomType,
  globalRate: number
): number {
  return (roomType.recoucheRate / 60) * globalRate;
}

export function getRoomWithMaxCount(data: HotelZoneData): {
  roomType: HotelRoomType
  roomCount: HotelRoomCount
} | null {
  let maxCount = -1
  let result: { roomType: HotelRoomType; roomCount: HotelRoomCount } | null = null

  for (const roomType of data.roomTypes) {
    const roomCount = data.roomCounts[roomType.id]
    if (roomCount && roomCount.count > maxCount) {
      maxCount = roomCount.count
      result = { roomType, roomCount }
    }
  }

  return result
}
