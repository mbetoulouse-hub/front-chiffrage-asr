export interface RateRange {
  min: number
  max: number
}

export interface RatesResponse {
  ranges: Record<string, RateRange>
}
