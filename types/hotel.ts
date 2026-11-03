export interface HotelZoneData {
  classification: number // step 1
  globalRate: number // step 1
  roomTypes: HotelRoomType[] // step 1
  roomCounts: { [roomTypeId: string]: HotelRoomCount } // step 2
  occupancyRate?: number // step 3
  openingDaysPerWeek?: number // step 3
  managementPackage?: HotelManagementPackage // step 4
}

export interface HotelRoomType {
  id: string
  name: string
  clearanceRate: number
  recoucheRate: number
  isCustom?: boolean
}

export interface HotelRoomCount {
  count: number
  hasKitchen: boolean
  kitchenTime?: number
}

export interface HotelManagementPackage {
  statutEncadrant: boolean
  premiereFemmeDeChambre: boolean
  hourlyRate: number
  daysPerWeek: number
  controlPercentage: number
  laundryManagementHours?: number
  laundryDaysPerWeek?: number
}

export interface ZoneHotelPrefillRoomType {
  prefillRoomType: Record<number, HotelRoomType[]>
}
