"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Hotel, Users, Clock, Euro, Download, AlertCircle, ChevronLeft } from "lucide-react"
import type { HotelZoneData } from "@/types/hotel"
import { Button } from "@/components/ui/button"
import type { CalculateResult, HotelCalculationResult } from "@/types/calculate"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HotelZoneStep5Props {
  handleDownloadPDF: () => void
  handlePrevious: () => void
  data: HotelZoneData
  results: CalculateResult | null
  calculationError?: string | null
}

export default function HotelZoneStep5({ handleDownloadPDF, handlePrevious, data, results, calculationError }: HotelZoneStep5Props) {
  const hotelCalculationResult: HotelCalculationResult = results?.hotelCalculationResult || {
    managementPackage: {
      allocationTime: -1,
      controlTime: -1,
      laundryManagementTime: -1,
      trainingTime: -1,
      managementPackagePrice: -1,
    },
    minimumPackage: {
      minimumPackagePrice: -1,
      minimumRoomsPerMonth: -1,
      unitPriceRoom: -1,
      roomUsedId: "",
    },
  }

  const roomUsed = data.roomTypes.find((rt) => rt.id === hotelCalculationResult.minimumPackage.roomUsedId)
  const totalSum = hotelCalculationResult.managementPackage.managementPackagePrice + hotelCalculationResult.minimumPackage.minimumPackagePrice

  // Show error state if calculation failed
  if (calculationError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Erreur de calcul</h2>
          <p className="text-[#858EAD] mt-2">Une erreur s'est produite lors du calcul du chiffrage</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Erreur de calcul :</p>
              <p>{calculationError}</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <p className="text-[#858EAD] mb-4">
            Veuillez vérifier vos données et réessayer, ou contacter le support technique si le problème persiste.
          </p>
          <Button variant="outline" onClick={handlePrevious}>
            <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
          </Button>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Résultats du chiffrage</h2>
          <p className="text-[#858EAD] mt-2">Aucun résultat disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Zone Hôtel - Résultats finaux du calcul</h2>
        <p className="text-[#858EAD] mt-2">Voici les résultats calculés pour votre Zone Hôtel</p>
      </div>

      {/* Hotel Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Classification de l'hôtel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {Array.from({ length: data.classification }, (_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
            <Badge variant="outline" className="ml-2">
              {data.classification} étoile{data.classification > 1 ? "s" : ""}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Room Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5 text-[#2F57A2]" />
            Types de chambres ({data.roomTypes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.roomTypes.map((roomType) => {
              const roomCount = data.roomCounts[roomType.id] || { count: 0, hasKitchen: false }
              return (
                <div key={roomType.id} className="border rounded-lg p-3 border-[#858EAD]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1d2f57]">{roomType.name}</span>
                      <Badge variant={roomType.isCustom ? "buildingtype" : "buildingtype"}>
                        {roomType.isCustom ? "Personnalisé" : "Prédéfini"}
                      </Badge>
                    </div>
                    <Badge variant="outline">{roomCount.count} chambres</Badge>
                  </div>
                  <div className="text-sm text-[#858EAD] space-y-1">
                    <div>
                      Mise à blanc/départ: {roomType.clearanceRate} min/ch • Recouche: {roomType.recoucheRate} min/ch
                    </div>
                    {roomCount.hasKitchen && <div>Cuisine: {roomCount.kitchenTime}h par chambre</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Minimum Package */}
      {data.occupancyRate && data.openingDaysPerWeek && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5 text-orange-600" />
              Forfait minimum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#1d2f57]">
                  <span>Chambres minimum/mois</span>
                  <span>{hotelCalculationResult.minimumPackage.minimumRoomsPerMonth.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-[#1d2f57]">
                  <span>Prix unitaire chambre ({roomUsed?.name || "N/A"})</span>
                  <span>{hotelCalculationResult.minimumPackage.unitPriceRoom} €</span>
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-[#1d2f57]">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Forfait minimum</span>
                  <span className="text-lg font-bold text-orange-600">{hotelCalculationResult.minimumPackage.minimumPackagePrice.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Management Package */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Users className="w-5 h-5 text-purple-600" />
              Forfait encadrement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-[#1d2f57]">
              {(data.managementPackage?.statutEncadrant || data.managementPackage?.premiereFemmeDeChambre) && (
                <div className="flex gap-2">
                  {data.managementPackage?.statutEncadrant && <Badge variant="secondary">Statut encadrant</Badge>}
                  {data.managementPackage?.premiereFemmeDeChambre && (
                    <Badge variant="secondary">Première femme de chambre</Badge>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#1d2f57]">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Temps répartition des chambres</span>
                    <span>{hotelCalculationResult.managementPackage.allocationTime.toFixed(2)} h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps de contrôle</span>
                    <span>{hotelCalculationResult.managementPackage.controlTime.toFixed(2)} h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps Gestion linge</span>
                    <span>{hotelCalculationResult.managementPackage.laundryManagementTime.toFixed(2)} h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps de formation</span>
                    <span>{hotelCalculationResult.managementPackage.trainingTime.toFixed(2)} h</span>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg h-fit self-end">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Forfait encadrement</span>
                    <span className="text-lg font-bold text-purple-600">{hotelCalculationResult.managementPackage.managementPackagePrice.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Grand Total */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Euro className="w-5 h-5 text-green-600" />
            Total Zone Hôtel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-[#1d2f57]">
            {data.occupancyRate && data.openingDaysPerWeek && (
              <div className="flex justify-between">
                <span>Forfait minimum</span>
                <span>{hotelCalculationResult.minimumPackage.minimumPackagePrice.toFixed(2)} €</span>
              </div>
            )}
              <div className="flex justify-between">
                <span>Forfait encadrement</span>
                <span>{hotelCalculationResult.managementPackage.managementPackagePrice.toFixed(2)} €</span>
              </div>
            <Separator className="bg-[#858EAD]" />
            <div className="flex justify-between text-xl font-bold">
              <span>Total Zone Hôtel</span>
              <span className="text-green-600">{totalSum.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Télécharger Excel
        </Button>
      </div>
    </div>
  )
}
