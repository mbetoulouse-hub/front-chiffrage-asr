"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { HotelZoneData } from "@/types/hotel"
import { getClearanceUnitPrice, getRecoucheUnitPrice } from "@/lib/utils/hotel-calculate-util"

interface HotelZoneStep2Props {
  data: HotelZoneData
  onUpdate: (updates: Partial<HotelZoneData>) => void
}

export default function HotelZoneStep2({ data, onUpdate }: HotelZoneStep2Props) {
  const handleRoomCountChange = (roomTypeId: string, count: number) => {
    const updatedRoomCounts = {
      ...data.roomCounts,
      [roomTypeId]: {
        ...data.roomCounts[roomTypeId],
        count: Math.max(0, count),
      },
    }
    onUpdate({ roomCounts: updatedRoomCounts })
  }

  const handleKitchenToggle = (roomTypeId: string, hasKitchen: boolean) => {
    const updatedRoomCounts = {
      ...data.roomCounts,
      [roomTypeId]: {
        ...data.roomCounts[roomTypeId],
        hasKitchen,
        kitchenTime: hasKitchen ? data.roomCounts[roomTypeId]?.kitchenTime || 1.5 : undefined,
      },
    }
    onUpdate({ roomCounts: updatedRoomCounts })
  }

  const handleKitchenTimeChange = (roomTypeId: string, kitchenTime: number) => {
    const updatedRoomCounts = {
      ...data.roomCounts,
      [roomTypeId]: {
        ...data.roomCounts[roomTypeId],
        kitchenTime: Math.max(0, kitchenTime),
      },
    }
    onUpdate({ roomCounts: updatedRoomCounts })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Zone Hôtel - Nombre de Chambres</h2>
        <p className="text-[#858EAD] mt-2">Définissez le nombre de chambres pour chaque type</p>
      </div>

      {data.roomTypes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Aucun type de chambre défini. Retournez à l'étape précédente pour ajouter des types de chambres.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Room Count Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration des chambres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.roomTypes.map((roomType) => {
                const roomCount = data.roomCounts[roomType.id] || { count: 0, hasKitchen: false }

                return (
                  <div key={roomType.id} className="border rounded-lg p-4 space-y-4 border-[#858EAD]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-[#1d2f57]">{roomType.name}</h4>
                          <Badge variant={roomType.isCustom ? "buildingtype" : "buildingtype"}>
                            {roomType.isCustom ? "Personnalisé" : "Prédéfini"}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#858EAD]">
                          Mise à blanc/départ: {roomType.clearanceRate} min/ch • Recouche: {roomType.recoucheRate} min/ch
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`count-${roomType.id}`}>Nombre de chambres</Label>
                        <Input
                          id={`count-${roomType.id}`}
                          type="number"
                          min="0"
                          value={roomCount.count || ""}
                          onChange={(e) => handleRoomCountChange(roomType.id, Number.parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`kitchen-${roomType.id}`}
                          checked={roomCount.hasKitchen}
                          onCheckedChange={(checked) => handleKitchenToggle(roomType.id, checked as boolean)}
                        />
                        <Label htmlFor={`kitchen-${roomType.id}`}>Cuisine</Label>
                      </div>

                      {roomCount.hasKitchen && (
                        <div>
                          <Label htmlFor={`kitchen-time-${roomType.id}`}>Temps cuisine (h)</Label>
                          <Input
                            id={`kitchen-time-${roomType.id}`}
                            type="number"
                            step="0.1"
                            min="0"
                            value={roomCount.kitchenTime || ""}
                            onChange={(e) =>
                              handleKitchenTimeChange(roomType.id, Number.parseFloat(e.target.value) || 0)
                            }
                            placeholder="1.5"
                          />
                        </div>
                      )}
                    </div>

                    {/* Room Type Summary */}
                    {roomCount.count > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between text-[#1d2f57]">
                            <span>Prix unitaire chambre (Mise à blanc/départ)</span>
                            <span>{getClearanceUnitPrice(roomType, data.globalRate).toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between text-[#1d2f57]">
                            <span>Prix unitaire chambre (Recouche)</span>
                            <span>{getRecoucheUnitPrice(roomType, data.globalRate).toFixed(2)} €</span>
                          </div>
                          {roomCount.hasKitchen && roomCount.kitchenTime && (
                            <div className="flex justify-between text-[#1d2f57]">
                              <span>
                                Prix à la cuisine
                              </span>
                              <span>{(roomCount.kitchenTime * data.globalRate).toFixed(2)} €</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
