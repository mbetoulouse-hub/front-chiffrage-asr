import { HotelZoneData } from "./hotel"
import { MultiPurpose, MultiPurposeRate } from "./multi-purpose"

export type CreateEstimateData = Company

export type UpdateEstimateData = {
  estimate: EstimateData,
  hotelZoneData?: HotelZoneData
}

export type GetEstimateData = {
  estimate: EstimateData,
  hotelZoneData?: HotelZoneData
}

export interface EstimateListResponse {
  content: PagedEstimate[]
  totalPages: number
  totalElements: number
  numberOfElements: number
  size: number
  number: number
  empty: boolean
  first: boolean
  last: boolean
}

export interface EstimateData {
  id: number
  company: Company
  buildings: Building[]
  multiPurposeData: MultiPurposeData
  rooms: Record<number, Room[]>
  hourlyRate?: number
  highestFrequency?: string
}

export interface MultiPurposeData {
  multiPurposes: MultiPurpose[]
  multiPurposeRates: MultiPurposeRate[]
}

export interface PagedEstimate {
  id: number
  companyName: string
  businessSector: string
  buildingCount: number
  roomCount: number
  status: "DRAFT" | "COMPLETE"
  createdBy: string
  createdAt: string
}

export interface Company {
  name: string
  businessSector: string
}

export interface Building {
  id: number
  name: string
  buildingType: string 
}

export interface Room {
  id: number
  name: string
  type: string
  surface: number
  floorType: string
  frequency: string
  remarks?: string 
  additionalProperties?: Array<{ key: string; value: any }> 
}
