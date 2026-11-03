"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { HotelZoneData } from "@/types/hotel"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { getClearanceUnitPrice, getRoomWithMaxCount } from "@/lib/utils/hotel-calculate-util"

interface HotelZoneStep3Props {
  data: HotelZoneData
  onUpdate: (updates: Partial<HotelZoneData>) => void
}

export default function HotelZoneStep3({ data, onUpdate }: HotelZoneStep3Props) {
  const [errorOccupancy, setErrorOccupancy] = useState("")

  const handleOccupancyRateChange = (value: number[]) => {
    setErrorOccupancy("")

    if (!value[0]) {
      setErrorOccupancy("Veuillez entrer un nombre valide")
    }

    onUpdate({ occupancyRate: value[0] })
  }

  const handleOpeningDaysChange = (value: string) => {
    onUpdate({ openingDaysPerWeek: Number.parseInt(value) })
  }

  // estimated calculation
  const totalRooms = Object.values(data.roomCounts).reduce((sum, roomCount) => sum + (roomCount?.count || 0), 0)

  const biggestRoomType = getRoomWithMaxCount(data)
  const numberOfRoomsPerMonth = (biggestRoomType?.roomCount.count! * (data.occupancyRate!/100) * 0.5 * data.openingDaysPerWeek! * 52)/12 || 0
  const roomUnitPPrice = biggestRoomType?.roomType ? getClearanceUnitPrice(biggestRoomType.roomType, data.globalRate) : 0

  const finalResult = numberOfRoomsPerMonth * roomUnitPPrice

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Zone Hôtel - Forfait Minimum</h2>
        <p className="text-[#858EAD] mt-2">Définissez les paramètres pour calculer le forfait minimum</p>
      </div>

      {totalRooms === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Aucune chambre configurée. Retournez à l'étape précédente pour définir le nombre de chambres.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration du forfait minimum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Occupancy Rate */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Taux d'occupation</Label>
                  <Badge variant="buildingtype" className="text-lg px-3 py-1">
                    {data.occupancyRate}%
                  </Badge>
                </div>

                {/* Visual progress bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${data.occupancyRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>


                <div className="relative">
                  <Input
                    type="number"
                    id="occupancyRate"
                    value={data.occupancyRate ?? ""}
                    onChange={(e) => handleOccupancyRateChange([Number.parseInt(e.target.value)])}
                    max={100}
                    min={0}
                    placeholder="Taux d'occupation en %"
                    className={errorOccupancy ? "border-red-500" : ""}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                </div>
                {errorOccupancy && <p className="text-sm text-red-600">{errorOccupancy}</p>}
              </div>

              {/* Opening Days */}
              <div className="space-y-2">
                <Label>Nombre de jours d'ouverture par semaine</Label>
                <Select value={data.openingDaysPerWeek?.toString() || ""} onValueChange={handleOpeningDaysChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le nombre de jours" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((days) => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} jour{days > 1 ? "s" : ""} par semaine
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {data.occupancyRate && data.openingDaysPerWeek && data.occupancyRate > 0 && data.openingDaysPerWeek > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Résumé du forfait minimum</CardTitle>
                  <Badge className="bg-red-600 hover:bg-red-600">Estimation</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#1d2f57]">{numberOfRoomsPerMonth.toFixed(1)}</div>
                      <div className="text-sm text-[#858EAD] mt-1">Chambres minimum/mois</div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#1d2f57]">{roomUnitPPrice.toFixed(2)} €</div>
                      <div className="text-sm text-[#858EAD] mt-1">Prix unitaire de la chambre {biggestRoomType?.roomType.name}</div>
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{finalResult.toFixed(2)} €</div>
                      <div className="text-sm text-blue-600 mt-1">Forfait minimum</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
