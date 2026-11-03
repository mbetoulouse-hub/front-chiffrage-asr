export interface MultiPurpose {
  id: number
  name: string
  type: string
  surface: number
  serviceType: string
  frequency: string
  travelCosts?: number
  remarks?: string
  customCadence?: number
}

export interface MultiPurposeRate {
  type: string
  hourlyRate: number
}

export interface TechnicalCadence {
  key: string
  title: string
  services: TechnicalCadenceService[]
}

export interface TechnicalCadenceService {
  key: string
  title: string
  range?: {
    max: number
    min: number
  },
  cadence: number
  type: string
}

export interface TechnicalCadenceRate {
  type: string
  range: {
    max: number
    min: number
  },
}
