export interface FatalError {
  type: "SECTOR_TYPE" | "PREFILL_ROOM_TYPE" | "TECHNICAL_CADENCE",
  error: string
}
