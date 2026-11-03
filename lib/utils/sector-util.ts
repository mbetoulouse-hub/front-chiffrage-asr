import type { EstimateData } from "@/types/estimate";
import type { SectorType } from "@/types/sector";

export function getTitleForSector(sector: string, sectors: SectorType[]): string {
  const foundSector = sectors.find(s => s.sector === sector);
  return foundSector ? foundSector.title : "Secteur inconnu";
}

export function isHotelSector(estimateData: EstimateData): boolean {
  return estimateData.company.businessSector === "HOTEL";
}
