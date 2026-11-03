"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import type { SectorType } from "@/types/sector"
import type { EstimateData } from "@/types/estimate"
import { getTitleForSector } from "@/lib/utils/sector-util"

interface RecapStepProps {
  estimateData: EstimateData
  sectorTypes: SectorType[]
}

export default function RecapStep({ estimateData, sectorTypes }: RecapStepProps) {
  const totalRooms = Object.values(estimateData.rooms).reduce((sum, rooms) => sum + rooms.length, 0)
  const totalSurface = Object.values(estimateData.rooms)
    .flat()
    .reduce((sum, room) => sum + room.surface, 0)

  const selectedSectorData = sectorTypes.find((s) => s.sector === estimateData.company.businessSector)
  const buildingTypes = selectedSectorData?.buildingTypes || []

  const getBuildingTypeTitle = (key: string) => {
    return buildingTypes.find((bt) => bt.key === key)?.title || key
  }

  const getRoomTypeTitle = (buildingTypeKey: string, roomTypeKey: string): string => {
    const buildingType = buildingTypes.find((bt) => bt.key === buildingTypeKey)
    if (!buildingType) return roomTypeKey

    const roomType = buildingType.rooms.find((rt) => rt.key === roomTypeKey)
    return roomType?.title || roomTypeKey
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Résumé du chiffrage</h2>
        <p className="text-[#858EAD] mt-2">
          Veuillez vérifier toutes les informations avant de soumettre pour le calcul
        </p>
      </div>

      <div className="grid gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Informations sur l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-[#1D2F57]">Nom de l'entreprise :</span>
                <p className="text-[#858EAD]">{estimateData.company.name}</p>
              </div>
              <div>
                <span className="font-medium text-[#1D2F57]">Secteur d'activité :</span>
                <p className="text-[#858EAD]">{getTitleForSector(estimateData.company.businessSector, sectorTypes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Aperçu du projet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{estimateData.buildings.length}</div>
                <div className="text-sm text-[#858EAD]">Bâtiments</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{totalRooms}</div>
                <div className="text-sm text-[#858EAD]">Nombre total de pièces</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{totalSurface}</div>
                <div className="text-sm text-[#858EAD]">Surface totale (m²)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Rate Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations sur les prix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-[#1D2F57]">Taux horaire :</span>
                <p className="text-2xl font-bold text-green-600">€{estimateData.hourlyRate?.toFixed(2)}/heure</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buildings and Rooms Details */}
        {estimateData.buildings.map((building) => (
          <Card key={building.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{building.name}</span>
                <Badge variant="buildingtype">{getBuildingTypeTitle(building.buildingType)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(estimateData.rooms[building.id] || []).map((room) => (
                  <div key={room.id} className="border border-[#858EAD] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-[#1D2F57]">{room.name}</h4>
                      <Badge variant="outline">{getRoomTypeTitle(building.buildingType, room.type)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-[#858EAD]">
                      <div>Surface : {room.surface} m²</div>
                      <div>Type de sol : {room.floorType}</div>
                      <div>Fréquence : {room.frequency}</div>
                    </div>
                    {room.remarks && <p className="text-sm text-[#858EAD] mt-2 italic">"{room.remarks}"</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
