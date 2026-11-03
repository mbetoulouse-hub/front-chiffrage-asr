"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TrendingUp, Euro, AlertCircle, Loader2 } from "lucide-react"
import { getRates } from "@/lib/rates-api"
import type { RatesResponse } from "@/types/rates"
import type { EstimateData } from "@/types/estimate"

interface HourlyRateStepProps {
  estimateData: EstimateData
  onUpdate: (updates: Partial<EstimateData>) => void
}

const FREQUENCY_PRIORITY = {
  H7: 7,
  H6: 6,
  H5: 5,
  H4: 4,
  H3: 3,
  H2: 2,
  H1: 1,
}

export default function HourlyRateStep({ estimateData, onUpdate }: HourlyRateStepProps) {
  const [hourlyRate, setHourlyRate] = useState("")
  const [error, setError] = useState("")
  const [rates, setRates] = useState<RatesResponse | null>(null)
  const [ratesLoading, setRatesLoading] = useState(true)
  const [ratesError, setRatesError] = useState("")

  // Fetch rates on component mount
  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true)
      setRatesError("")

      const { data, error } = await getRates()

      if (error) {
        setRatesError(error)
      } else if (data) {
        setRates(data)
        setHourlyRate(estimateData.hourlyRate?.toString() || getSuggestedRate(data).toString())
        onUpdate({ hourlyRate: estimateData.hourlyRate || getSuggestedRate(data), highestFrequency: getHighestFrequency() })
      }

      setRatesLoading(false)
    }

    fetchRates()
  }, [])

  // Calculate highest frequency across all rooms
  const getHighestFrequency = () => {
    let highestFrequency = ""
    let highestPriority = 0

    Object.values(estimateData.rooms).forEach((rooms) => {
      rooms.forEach((room) => {
        const priority = FREQUENCY_PRIORITY[room.frequency as keyof typeof FREQUENCY_PRIORITY] || 0
        if (priority > highestPriority) {
          highestPriority = priority
          highestFrequency = room.frequency === "H7" ? "H6" : room.frequency // Normalize H7 to H6
        }
      })
    })

    return highestFrequency
  }

  // Calculate total rooms and surface area
  const getTotalStats = () => {
    const totalRooms = Object.values(estimateData.rooms).reduce((sum, rooms) => sum + rooms.length, 0)
    const totalSurface = Object.values(estimateData.rooms)
      .flat()
      .reduce((sum, room) => sum + room.surface, 0)

    return { totalRooms, totalSurface }
  }

  // Get rate range for the highest frequency
  const getRateRange = () => {
    if (!rates) return { min: 23.5, max: 30 } // fallback values

    const highestFreq = getHighestFrequency()
    const rateRange = rates.ranges[highestFreq]

    if (rateRange) {
      return { min: rateRange.min, max: rateRange.max }
    }

    // If no specific range found, use the most restrictive range
    const allRanges = Object.values(rates.ranges)
    const minRate = Math.min(...allRanges.map((r) => r.min))
    const maxRate = Math.max(...allRanges.map((r) => r.max))

    return { min: minRate, max: maxRate }
  }

  const { min: MIN_RATE, max: MAX_RATE } = getRateRange()

  const handleRateChange = (value: string) => {
    setHourlyRate(value)
    setError("")

    const highestFreq = getHighestFrequency()
    const numericValue = Number.parseFloat(value)

    if (value === "") {
      onUpdate({ hourlyRate: undefined, highestFrequency: highestFreq })
      return
    }

    if (isNaN(numericValue)) {
      setError("Veuillez entrer un nombre valide")
      return
    }

    if (numericValue < MIN_RATE) {
      setError(`Le taux horaire doit être d'au moins €${MIN_RATE}`)
    }

    if (numericValue > MAX_RATE) {
      setError(`Le taux horaire ne peut pas dépasser €${MAX_RATE}`)
    }

    onUpdate({ hourlyRate: numericValue, highestFrequency: highestFreq })
  }

  const getSuggestedRate = (rates: RatesResponse | null) => {
    if (!rates) return 25.0 // fallback value

    const highestFreq = getHighestFrequency()
    const rateRange = rates.ranges[highestFreq]

    if (rateRange) {
      // Suggest the middle of the range
      return (rateRange.min + rateRange.max) / 2
    }

    return 25.0 // fallback value
  }

  const retryFetchRates = async () => {
    setRatesLoading(true)
    setRatesError("")

    const { data, error } = await getRates()

    if (error) {
      setRatesError(error)
    } else if (data) {
      setRates(data)
    }

    setRatesLoading(false)
  }

  // Show loading state
  if (ratesLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Configuration du taux horaire</h2>
          <p className="text-[#858EAD] mt-2">Chargement des taux horaires...</p>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Chargement des taux horaires...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (ratesError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Configuration du taux horaire</h2>
          <p className="text-[#858EAD] mt-2">Erreur lors du chargement des taux horaires</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{ratesError}</span>
            <Button variant="outline" size="sm" onClick={retryFetchRates} className="ml-4 bg-transparent">
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="text-center py-12">
            <p className="text-[#858EAD] mb-4">
              Impossible de charger les taux horaires. Veuillez réessayer ou contacter le support.
            </p>
            <Button onClick={retryFetchRates}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const highestFrequency = getHighestFrequency()
  const { totalRooms, totalSurface } = getTotalStats()
  const suggestedRate = getSuggestedRate(rates)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Configuration du taux horaire</h2>
        <p className="text-[#858EAD] mt-2">Définir le taux horaire pour les services de nettoyage</p>
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Aperçu du projet
          </CardTitle>
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

      {/* Highest Frequency Display */}
      {highestFrequency && rates && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse de la fréquence de nettoyage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#858EAD] mb-2">
                  Fréquence de nettoyage la plus élevée dans toutes les pièces :
                </p>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {highestFrequency}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#858EAD]">Taux suggéré en fonction de la fréquence :</p>
                <p className="text-2xl font-bold text-green-600">€{suggestedRate.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  Fourchette : €{MIN_RATE} - €{MAX_RATE}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hourly Rate Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Définir le taux horaire
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hourly-rate">Taux horaire (€) *</Label>
            <div className="relative">
              <Input
                id="hourly-rate"
                type="number"
                min={0}
                step="0.1"
                value={hourlyRate}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder={`Entrez un taux entre €${MIN_RATE} et €${MAX_RATE}`}
                className={error ? "border-red-500" : ""}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">€/heure</span>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex items-center justify-between text-sm text-[#858EAD] bg-gray-50 p-3 rounded-lg">
            <span>Taux minimum : €{MIN_RATE}/heure</span>
            <span>Taux maximum : €{MAX_RATE}/heure</span>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
