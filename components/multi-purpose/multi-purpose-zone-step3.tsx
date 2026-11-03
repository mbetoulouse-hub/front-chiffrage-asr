"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Clock, Euro, Wrench, Calendar, Car, TrendingUp, ChevronLeft, Download } from "lucide-react"
import type { CalculateResult, MultiPurposeCalculationDetail } from "@/types/calculate"
import { Button } from "../ui/button"
import { TechnicalCadence } from "@/types/multi-purpose"

interface MultiPurposeStep3Props {
  handleDownloadPDF: () => void
  handlePrevious: () => void
  technicalCadences: TechnicalCadence[]
  results: CalculateResult | null
  calculationError?: string | null
}

export default function MultiPurposeStep3({ handleDownloadPDF, handlePrevious, technicalCadences, results, calculationError }: MultiPurposeStep3Props) {
  const getTitleFromTechnicalCadence = (key: string): string => {
    const cadence = technicalCadences.find((cadence) => cadence.key === key)
    return cadence ? cadence.title : "Inconnu"
  }

  const getServiceTypeTitle = (technicalKey: string, key: string): string => {
    const cadence = technicalCadences.find((cadence) => cadence.key === technicalKey)
    const service = cadence?.services?.find((service) => service.key === key)
    return service ? service.title : "Inconnu"
  }

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

  if (!results?.multiPurposeCalculationResult) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Résultats Prestations Polyvalentes</h2>
          <p className="text-[#858EAD] mt-2">Aucun résultat disponible</p>
        </div>
      </div>
    )
  }

  const { multiPurposeCalculationResult } = results
  const { totalTime, totalPrice, details } = multiPurposeCalculationResult

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Résultats Prestations Polyvalentes</h2>
        <p className="text-[#858EAD]">Voici les résultats du calcul pour vos prestations polyvalentes.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-[#1d2f57]" />
              <div>
                <p className="text-sm font-medium text-[#858EAD]">Temps Total</p>
                <p className="text-2xl font-bold text-[#1d2f57]">{totalTime.toFixed(2)} h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Euro className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-[#858EAD]">Prix Total</p>
                <p className="text-2xl font-bold text-[#1d2f57]">{totalPrice.toFixed(2)} €</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-[#858EAD]">Prestations</p>
                <p className="text-2xl font-bold text-[#1d2f57]">{details.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Détail des Prestations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {details.map((detail: MultiPurposeCalculationDetail, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-lg text-[#1d2f57]">{detail.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">
                            {getTitleFromTechnicalCadence(detail.type)}
                          </Badge>
                          <Badge variant="outline">
                            {getServiceTypeTitle(detail.type, detail.serviceType)}
                          </Badge>
                          <Badge variant="outline">
                            {detail.frequency}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[#858EAD]">Temps :</span>
                          <span className="ml-2 font-medium">{detail.timeInHours.toFixed(2)} h</span>
                        </div>
                        <div>
                          <span className="text-[#858EAD]">Taux horaire :</span>
                          <span className="ml-2 font-medium">{detail.hourlyRateUsed.toFixed(2)} €/h</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Pricing Info */}
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#858EAD]">Prix à la prestation</span>
                          <span className="text-lg font-bold text-[#1d2f57]">{detail.priceByService.toFixed(2)} €</span>
                        </div>

                        {detail.frequency !== "UNIQUE" && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#858EAD]">Prix / mois</span>
                            <span className="text-lg font-bold text-[#1d2f57]">{detail.price.toFixed(2)} €</span>
                          </div>
                        )}


                        {detail.usedTravelCosts && detail.travelCosts > 0 && (
                          <div className="flex justify-between items-center text-sm border-t pt-2">
                            <span className="text-[#858EAD] flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              Frais de déplacement
                            </span>
                            <span className="font-medium text-orange-600">{detail.travelCosts.toFixed(2)} €</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
