import type { EstimateData } from "@/types/estimate"
import type { HotelZoneData } from "@/types/hotel"

export const canProceedHotel = (hotelStep: number, isHotelSector: boolean, hotelZoneData: HotelZoneData, estimateData: EstimateData) => {
    switch (hotelStep) {
      case 1:
        return hotelZoneData.roomTypes.length > 0 && hotelZoneData.globalRate > 0
      case 2:
        return Object.keys(hotelZoneData.roomCounts).length === hotelZoneData.roomTypes.length
      case 3:
        return hotelZoneData.occupancyRate && hotelZoneData.openingDaysPerWeek
      case 4:
        return isHotelValid(hotelZoneData) && ((estimateData.buildings.length == 0 && isHotelSector) || isTertiaryValid(estimateData))
      default:
        return false
    }
  }

export const canProceedMultiPurpose = (multiPurposeStep: number, isHotelSector: boolean, hotelZoneData: HotelZoneData, estimateData: EstimateData) => {
    switch (multiPurposeStep) {
      case 1:
        return estimateData.multiPurposeData.multiPurposes.length > 0
      case 2:
        return isMultiPurposeValid(estimateData)
      default:
        return false
    }
  }

export const canProceedTertiary = (currentStep: number, estimateData: EstimateData, isHotelSector: boolean, hotelZoneData: HotelZoneData) => {
    switch (currentStep) {
      case 1:
        return estimateData.company.name && estimateData.company.businessSector
      case 2:
        return estimateData.buildings.length > 0
      case 3:
        return estimateData.buildings.every((building) => (estimateData.rooms[building.id] || []).length > 0)
      case 4:
        return estimateData.hourlyRate
      case 5:
        return isTertiaryValid(estimateData) && (isHotelSector ? isHotelValid(hotelZoneData) : true) && isMultiPurposeValid(estimateData)
      default:
        return false
    }
  }

export function isTertiaryValid(estimateData: EstimateData): boolean {
  return estimateData.company.name != null && estimateData.company.businessSector != null && estimateData.buildings.length > 0 &&
          estimateData.buildings.every((building) => (estimateData.rooms[building.id] || []).length > 0) &&
          estimateData.hourlyRate != null
}

export function isHotelValid(hotelZoneData: HotelZoneData): boolean {
  return hotelZoneData.roomTypes.length > 0 && hotelZoneData.globalRate > 0 &&
         Object.keys(hotelZoneData.roomCounts).length === hotelZoneData.roomTypes.length &&
         hotelZoneData.occupancyRate != null && hotelZoneData.openingDaysPerWeek != null &&
         hotelZoneData.managementPackage != null
}

export function isMultiPurposeValid(estimateData: EstimateData): boolean {
  return estimateData.multiPurposeData.multiPurposes != null;
}
