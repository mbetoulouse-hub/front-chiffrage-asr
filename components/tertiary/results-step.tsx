"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, AlertTriangle, CheckCircle, AlertCircle, ChevronLeft } from "lucide-react"
import type { SectorType } from "@/types/sector"
import type { CalculateResult } from "@/types/calculate"
import type { EstimateData } from "@/types/estimate"

interface ResultsStepProps {
  handleDownloadPDF: () => void
  handlePrevious: () => void
  results: CalculateResult | null
  estimateData: EstimateData
  sectorTypes: SectorType[]
  calculationError?: string | null
}

const ALERT_MESSAGES = {
  H1_MINIMUM_PRICE_NOT_REACHED: "Le prix minimum mensuel de 249 euros n'est pas atteint",
  RATIO_FREQUENCY_NOT_VALID: "Le ration Temps total / Fréquence totale n'est pas valide (Temps total)",
}

export default function ResultsStep({ handleDownloadPDF, handlePrevious, results, estimateData, sectorTypes, calculationError }: ResultsStepProps) {
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
        <h2 className="text-2xl font-bold">Résultats du chiffrage</h2>
        <p className="text-[#858EAD] mt-2">Voici les résultats calculés pour votre chiffrage</p>
      </div>

      {/* System Alerts */}
      {results.alerts && results.alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Alertes détectées :</p>
              {results.alerts.map((alert, index) => (
                <p key={index}>• {ALERT_MESSAGES[alert as keyof typeof ALERT_MESSAGES] || alert}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Résumé global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-[#2F57A2]">{results.aggregateResult.surfaceSum}</p>
              <p className="text-sm text-[#858EAD]">Surface totale (m²)</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{results.aggregateResult.timeSumRounded}</p>
              <p className="text-sm text-[#858EAD]">Temps total (h)</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{results.aggregateResult.timeSumRoundedByService}</p>
              <p className="text-sm text-[#858EAD]">Temps total / prestation (h)</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {results.aggregateResult.monthlyRateSum.toFixed(2)} €
              </p>
              <p className="text-sm text-[#858EAD]">Coût mensuel (dont {results.buildings.flatMap(building => building.details).filter(detail => detail.frequencyDTO === "H7").reduce((sum, detail) => sum + detail.monthlyRate, 0).toFixed(2)} € de H7)</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {results.aggregateResult.pricePerSquareMeter.toFixed(2)} €
              </p>
              <p className="text-sm text-[#858EAD]">Prix/m²</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1d2f57]">Détail par bâtiment</h3>
        {results.buildings.map((building, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-[#1d2f57]">
                <span>{building.name}</span>
                <Badge variant="outline">{getBuildingTypeTitle(building.type)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-[#1d2f57]">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="font-bold">{building.aggregateResult.surfaceSum}</p>
                  <p className="text-xs text-[#858EAD]">Surface (m²)</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="font-bold">{building.aggregateResult.timeSumRounded}</p>
                  <p className="text-xs text-[#858EAD]">Temps (h)</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="font-bold">{building.aggregateResult.monthlyRateSum.toFixed(2)} €</p>
                  <p className="text-xs text-[#858EAD]">Coût mensuel</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="font-bold">{building.aggregateResult.pricePerSquareMeter.toFixed(2)} €</p>
                  <p className="text-xs text-[#858EAD]">Prix/m²</p>
                </div>
              </div>

              {/* Room Details */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-[#1d2f57]">Détail des pièces :</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#858EAD]">
                        <th className="text-left p-2">Pièce</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Surface</th>
                        <th className="text-left p-2">Fréquence</th>
                        <th className="text-left p-2">Temps</th>
                        <th className="text-left p-2">Coût mensuel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {building.details.map((detail, detailIndex) => (
                        <tr key={detailIndex} className="border-b border-[#858EAD]">
                          <td className="p-2 text-[#858EAD]">{detail.name}</td>
                          <td className="p-2 text-[#858EAD]">{getRoomTypeTitle(building.type, detail.roomType)}</td>
                          <td className="p-2 text-[#858EAD]">{detail.surface} m²</td>
                          <td className="p-2 text-[#858EAD]">{detail.frequencyDTO}</td>
                          <td className="p-2 text-[#858EAD]">{detail.timeInHours.toFixed(1)}h</td>
                          <td className="p-2 text-[#858EAD]">{detail.monthlyRate.toFixed(2)} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
