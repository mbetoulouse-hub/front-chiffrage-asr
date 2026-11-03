"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, DollarSign } from "lucide-react"
import type { MultiPurpose, MultiPurposeRate, TechnicalCadence, TechnicalCadenceRate } from "@/types/multi-purpose"
import { getTechnicalCadenceRates } from "@/lib/technical-cadence-api"

interface MultiPurposeStep2Props {
  technicalCadences: TechnicalCadence[]
  multiPurposes: MultiPurpose[]
  multiPurposeRates: MultiPurposeRate[]
  onUpdateRates: (rates: MultiPurposeRate[]) => void
}

export default function MultiPurposeStep2({
  technicalCadences,
  multiPurposes,
  multiPurposeRates,
  onUpdateRates,
}: MultiPurposeStep2Props) {
  const [rates, setRates] = useState<MultiPurposeRate[]>(multiPurposeRates)
  const [technicalCadenceRates, setTechnicalCadenceRates] = useState<TechnicalCadenceRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({})

  // Get unique TechnicalCadenceService.type based on matching keys
  const uniqueServiceTypes = Array.from(
    new Set(
      multiPurposes
        .flatMap((mp) =>
          technicalCadences
            .filter(
              (tc) =>
                tc.key === mp.type &&
                tc.services.some((svc) => svc.key === mp.serviceType)
            )
            .flatMap((tc) =>
              tc.services
                .filter((svc) => svc.key === mp.serviceType)
                .map((svc) => svc.type)
            )
        )
    )
  )

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getTechnicalCadenceRates()

        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setTechnicalCadenceRates(result.data)

          // Initialize rates with defaults if not already set
          const initialRates: MultiPurposeRate[] = uniqueServiceTypes.map((type) => {
            const existingRate = rates.find((r) => r.type === type)
            if (existingRate) {
              return existingRate
            }

            const cadenceRate = (result.data || []).find((cr) => cr.type === type)
            const defaultRate = cadenceRate ? (cadenceRate.range.min + cadenceRate.range.max) / 2 : 0

            return {
              type,
              hourlyRate: defaultRate,
            }
          })

          setRates(initialRates)
          onUpdateRates(initialRates)
        }
      } catch (err) {
        setError("Erreur lors du chargement des taux recommandés")
      } finally {
        setLoading(false)
      }
    }

    if (uniqueServiceTypes.length > 0) {
      fetchRates()
    } else {
      setLoading(false)
    }
  }, [uniqueServiceTypes.length])

  const handleRateChange = (type: string, value: string) => {
    const numericValue = Number.parseFloat(value)

    // Clear previous error for this field
    setInputErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[type]
      return newErrors
    })

    // Validate input
    if (value && (isNaN(numericValue) || numericValue <= 0)) {
      setInputErrors((prev) => ({
        ...prev,
        [type]: "Le taux horaire doit être un nombre positif",
      }))
      return
    }

    const updatedRates = rates.map((rate) => (rate.type === type ? { ...rate, hourlyRate: numericValue || 0 } : rate))

    setRates(updatedRates)
    onUpdateRates(updatedRates)
  }

  const getRateInfo = (type: string) => {
    return technicalCadenceRates.find((cr) => cr.type === type)
  }

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CLASSIC: "Prestations polyvalentes classique",
      GREEN: "Eespaces verts",
      IONIC: "Prestations IONIC",
      FLOOR: "Sol spécifiques",
    }
    return labels[type] || type
  }

  const getTitleFromTechnicalCadence = (key: string): string => {
    const cadence = technicalCadences.find((cadence) => cadence.key === key)
    return cadence ? cadence.title : "Inconnu"
  }

  const getServiceTypeTitle = (technicalKey: string, key: string): string => {
    const cadence = technicalCadences.find((cadence) => cadence.key === technicalKey)
    const service = cadence?.services?.find((service) => service.key === key)
    return service ? service.title : "Inconnu"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Taux horaires</h2>
          <p className="text-[#858EAD]">Chargement des taux recommandés...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Taux horaires</h2>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (uniqueServiceTypes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Taux horaires</h2>
          <p className="text-[#858EAD]">
            Aucune prestation configurée. Veuillez d'abord ajouter des prestations à l'étape précédente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Taux horaires</h2>
        <p className="text-[#858EAD]">
          Définissez les taux horaires pour chaque type de service utilisé dans vos prestations.
        </p>
      </div>

      <div className="grid gap-6">
        {uniqueServiceTypes.map((technicalServiceType) => {
          const rate = rates.find((r) => r.type === technicalServiceType)
          const rateInfo = getRateInfo(technicalServiceType)
          const hasError = inputErrors[technicalServiceType]
          const showRange = rateInfo && rateInfo.range.min !== rateInfo.range.max

          return (
            <Card key={technicalServiceType}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getServiceTypeLabel(technicalServiceType)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor={`rate-${technicalServiceType}`}>Taux horaire (€/heure)</Label>
                    {showRange && rateInfo && (
                      <p className="text-sm text-gray-500 mt-1">
                        Recommandé : {rateInfo.range.min}€ - {rateInfo.range.max}€
                      </p>
                    )}
                    <Input
                      id={`rate-${technicalServiceType}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={rate?.hourlyRate || ""}
                      onChange={(e) => handleRateChange(technicalServiceType, e.target.value)}
                      placeholder="Saisir le taux horaire"
                      className={hasError ? "border-red-500" : ""}
                    />
                    {hasError && <p className="text-sm text-red-500 mt-1">{hasError}</p>}
                  </div>

                  {/* Show related services */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Prestations utilisant ce type :</Label>
                    <div className="mt-2 space-y-1">
                      {multiPurposes
                        .filter((mp) => {
                          // Find the matching technical cadence for this multipurpose
                          const tc = technicalCadences.find(
                            (tc) =>
                              tc.key === mp.type &&
                              tc.services.some((svc) => svc.key === mp.serviceType && svc.type === technicalServiceType)
                          )
                          // Only include if a matching service with the correct type exists
                          return !!tc
                        })
                        .map((mp) => (
                          <div key={mp.id} className="text-sm text-[#858EAD] bg-gray-50 px-3 py-1 rounded">
                            {mp.name} ({getTitleFromTechnicalCadence(mp.type)} - {getServiceTypeTitle(mp.type, mp.serviceType)})
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {Object.keys(inputErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Veuillez corriger les erreurs dans les champs de saisie avant de continuer.
          </AlertDescription>
        </Alert>
      )}

    </div>
  )
}
