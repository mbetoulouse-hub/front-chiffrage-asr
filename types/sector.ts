export interface SectorType {
  sector: string
  title: string
  buildingTypes: BuildingType[]
}

export interface BuildingType {
  key: string
  title: string
  rooms: RoomType[]
}

export interface RoomType {
  key: string
  title: string
  additionalProperties: string[] | null
}
