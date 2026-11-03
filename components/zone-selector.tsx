"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Building2, Hotel, CheckCircle } from "lucide-react"
import { EstimateData } from "@/types/estimate"
import { HotelZoneData } from "@/types/hotel"
import { isHotelValid, isMultiPurposeValid, isTertiaryValid } from "@/lib/utils/process-calculate-util"
import { AppZone } from "@/app/page"
import { isHotelSector } from "@/lib/utils/sector-util"

interface ZoneSelectorProps {
  currentZone: AppZone
  onZoneChange: (zone: AppZone) => void
  estimateData: EstimateData
  hotelZoneData: HotelZoneData

}

export default function ZoneSelector({
  currentZone,
  onZoneChange,
  estimateData,
  hotelZoneData,
}: ZoneSelectorProps) {

  const hotelComplete = isHotelValid(hotelZoneData)
  const tertiaryComplete = isTertiaryValid(estimateData)

  return (
    <div className="mb-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Sélectionnez la zone à configurer</h2>
        <p className="text-[#858EAD]">Vous devez compléter les zones pour continuer</p>
      </div>

      <div className={`grid grid-cols-1 ${isHotelSector(estimateData) ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
        <Card className={`cursor-pointer transition-all ${currentZone === "multi-purpose" ? "ring-2 ring-blue-500" : ""}`}>
          <CardContent className="p-4" onClick={() => onZoneChange("multi-purpose")}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-600">Prestations polyvalentes</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Badge variant="secondary">
                Optionnel
              </Badge>
            </div>
          </CardContent>
        </Card>

        {isHotelSector(estimateData) && (
        <Card className={`cursor-pointer transition-all ${currentZone === "hotel" ? "ring-2 ring-blue-500" : ""}`}>
          <CardContent className="p-4" onClick={() => onZoneChange("hotel")}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hotel className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-600">Zone Hôtel</span>
              </div>
              {hotelComplete && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <div className="flex justify-between items-center">
              <Badge variant={hotelComplete ? "default" : "secondary"}>
                {hotelComplete ? "Complété" : "À compléter"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        )}

        <Card className={`cursor-pointer transition-all ${currentZone === "tertiary" ? "ring-2 ring-blue-500" : ""}`}>
          <CardContent className="p-4" onClick={() => onZoneChange("tertiary")}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1D2F57]" />
                <span className="font-semibold text-[#1D2F57]">Zone Tertiaire</span>
              </div>
              {tertiaryComplete && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <div className="flex justify-between items-center">
              <Badge variant={tertiaryComplete ? "default" : "secondary"}>
                {tertiaryComplete ? "Complété" : (isHotelSector(estimateData) && estimateData.buildings.length == 0 ? "Optionnel" : "À compléter")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
