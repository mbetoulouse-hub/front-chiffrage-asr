import type { MultiPurposeData } from "./estimate"
import type { HotelZoneData } from "./hotel"

export interface CalculateRequest {
  id: number
  sector: string
  buildings: Array<{
    name: string
    buildingType: string
    rooms: Array<{
      name: string
      type: string
      surface: number
      floorType: string
      frequency: string
      remarks: string
      additionalProperties: Array<{ key: string; value: any }>
    }>
  }>
  multiPurposeData: MultiPurposeData
  hourlyRate: number
  hotelZoneData?: HotelZoneData
}

export interface CalculateResult {
  aggregateResult: AggregateResult
  buildings: CalculateBuilding[]
  alerts?: string[]
  hotelCalculationResult?: HotelCalculationResult
  multiPurposeCalculationResult: MultiPurposeCalculationResult
}

export interface AggregateResult {
  surfaceSum: number
  timeSum: number
  timeSumRounded: number
  timeSumRoundedByService: number
  monthlyRateSum: number
  pricePerSquareMeter: number
}

export interface CalculateBuilding {
  name: string
  type: string
  aggregateResult: AggregateResult
  details: CalculateDetail[]
}

export interface CalculateDetail {
  name: string
  roomType: string
  surface: number
  frequencyDTO: string
  cadence: number
  timeInHours: number
  monthlyRate: number
  hourlyRateUsed: number
}

export interface HotelCalculationResult {
  minimumPackage: {
    minimumRoomsPerMonth: number
    unitPriceRoom: number
    roomUsedId: string
    minimumPackagePrice: number
  }
  managementPackage: {
    allocationTime: number
    controlTime: number
    laundryManagementTime: number
    trainingTime: number
    managementPackagePrice: number
  }
}

export interface MultiPurposeCalculationResult {
  totalTime: number
  totalPrice: number
  details: MultiPurposeCalculationDetail[]
}

export interface MultiPurposeCalculationDetail {
  name: string
  type: string
  serviceType: string
  frequency: string
  travelCosts: number
  usedTravelCosts: boolean
  hourlyRateUsed: number
  timeInHours: number
  price: number
  priceByService: number
}
