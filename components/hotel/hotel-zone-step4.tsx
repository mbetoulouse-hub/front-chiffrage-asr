"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Euro } from "lucide-react"
import type { HotelZoneData, HotelManagementPackage } from "@/types/hotel"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface HotelZoneStep4Props {
  data: HotelZoneData
  onUpdate: (updates: Partial<HotelZoneData>) => void
}

export default function HotelZoneStep4({ data, onUpdate }: HotelZoneStep4Props) {
  const [errorRate, setErrorRate] = useState("")
  const [errorControl, setErrorControl] = useState("")
  
  const managementPackage = data.managementPackage || {
    statutEncadrant: false,
    premiereFemmeDeChambre: false,
    hourlyRate: 25.5,
    daysPerWeek: 5,
    controlPercentage: 50,
  }

  const handleRateUpdate = (updates: Partial<HotelManagementPackage>) => {
    setErrorRate("")

    if (!updates.hourlyRate) {
      setErrorRate("Veuillez entrer un nombre valide")
    }

    if (updates.hourlyRate && updates.hourlyRate < MIN_RATE) {
      setErrorRate(`Le taux horaire doit être d'au moins €${MIN_RATE}`)
    }

    if (updates.hourlyRate && updates.hourlyRate > MAX_RATE) {
      setErrorRate(`Le taux horaire ne peut pas dépasser €${MAX_RATE}`)
    }
    
    onUpdate({
      managementPackage: {
        ...managementPackage,
        ...updates,
      },
    })
  }

  const handleControlUpdate = (updates: Partial<HotelManagementPackage>) => {
    setErrorControl("")

    if (!updates.controlPercentage) {
      setErrorControl("Veuillez entrer un nombre valide")
    }
    
    onUpdate({
      managementPackage: {
        ...managementPackage,
        ...updates,
      },
    })
  }

  const handleManagementPackageUpdate = (updates: Partial<HotelManagementPackage>) => {
    onUpdate({
      managementPackage: {
        ...managementPackage,
        ...updates,
      },
    })
  }

  // Handle status selection from dropdown
  const handleStatusChange = (value: string) => {
    switch (value) {
      case "MANAGER":
        handleManagementPackageUpdate({ statutEncadrant: true, premiereFemmeDeChambre: false })
        break
      case "CHAMBERMAID":
        handleManagementPackageUpdate({ statutEncadrant: false, premiereFemmeDeChambre: true })
        break
      case "BOTH":
        handleManagementPackageUpdate({ statutEncadrant: true, premiereFemmeDeChambre: true })
        break
    }
  }

  // Get current status value for dropdown
  const getCurrentStatus = () => {
    if (managementPackage.statutEncadrant && managementPackage.premiereFemmeDeChambre) return "BOTH"
    if (managementPackage.statutEncadrant) return "MANAGER"
    if (managementPackage.premiereFemmeDeChambre) return "CHAMBERMAID"
    return undefined
  }

  const getCurrentRange = (): {min: number, max: number} => {
    if (managementPackage.statutEncadrant && managementPackage.premiereFemmeDeChambre) return {min: 24.0, max: 25.0}
    if (managementPackage.statutEncadrant) return {min: 25.0, max: 26.0}
    if (managementPackage.premiereFemmeDeChambre) return {min: 24.0, max: 25.0}
    return {min: 25.0, max: 26.0}
  }

  // Calculations
  const numberOfRooms = Object.values(data.roomCounts).reduce((sum, roomCount) => sum + (roomCount?.count || 0), 0) * (data.occupancyRate!/100)
  const timeRepartition = (0.5 * (managementPackage.daysPerWeek || 0)) * 52 / 12
  const timeControl = (((managementPackage.controlPercentage || 0) / 100) * numberOfRooms * (data.classification > 3 ? (4/60) : 0.05) * 52) / 12
  const timeGestionLinge = managementPackage.laundryManagementHours && managementPackage.laundryDaysPerWeek ? 
                              (managementPackage.laundryManagementHours * managementPackage.laundryDaysPerWeek * 52) / 12
                              : 0
  const timeFormation = ((numberOfRooms < 50 ? 0.5 : (numberOfRooms <= 100 ? 0.75 : 1.0)) * 52) / 12
  const totalTime = timeRepartition + timeControl + timeGestionLinge + timeFormation
  const finalResult = (totalTime * (managementPackage.hourlyRate || 0) * 52) / 12

  // by day
  const timeRepartitionDay = timeRepartition / managementPackage.daysPerWeek
  const timeControlDay = timeControl / managementPackage.daysPerWeek
  const timeGestionLingeDay = managementPackage.laundryManagementHours && managementPackage.laundryDaysPerWeek ? 
                              timeGestionLinge / managementPackage.laundryDaysPerWeek
                              : 0
  const timeFormationDay = timeFormation / managementPackage.daysPerWeek

  // Recommended rate
  const { min: MIN_RATE, max: MAX_RATE } = getCurrentRange()
  const recommendedRate = (MIN_RATE + MAX_RATE) / 2

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Zone Hôtel - Forfait Encadrement</h2>
        <p className="text-[#858EAD] mt-2">Configurez les paramètres d'encadrement et de gestion</p>
      </div>

      {/* Management Status Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Statut du personnel d'encadrement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Sélectionnez le statut</Label>
            <Select value={getCurrentStatus()} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANAGER">Statut encadrant uniquement</SelectItem>
                <SelectItem value="CHAMBERMAID">Première femme de chambre uniquement</SelectItem>
                <SelectItem value="BOTH">Statut encadrant + Première femme de chambre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Rate Section */}
      {(managementPackage.statutEncadrant || managementPackage.premiereFemmeDeChambre) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Définir le taux horaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label>Taux horaire recommandé</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-lg px-3 py-1 text-green-600">
                    {recommendedRate.toFixed(1)} €
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
            <Label htmlFor="hourly-rate">Taux horaire (€) *</Label>
            <div className="relative">
              <Input
                id="hourly-rate"
                type="number"
                min={0}
                step="0.1"
                value={managementPackage.hourlyRate ?? ""}
                onChange={(e) => handleRateUpdate({ hourlyRate: Number.parseFloat(e.target.value)})}
                placeholder={`Entrez un taux entre €${MIN_RATE} et €${MAX_RATE}`}
                className={errorRate ? "border-red-500" : ""}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">€/heure</span>
              </div>
            </div>
            {errorRate && <p className="text-sm text-red-600">{errorRate}</p>}
          </div>

          <div className="flex items-center justify-between text-sm text-[#858EAD] bg-gray-50 p-3 rounded-lg">
            <span>Taux minimum : €{MIN_RATE}/heure</span>
            <span>Taux maximum : €{MAX_RATE}/heure</span>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Days and Control Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Days per Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Nombre de jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Jours par semaine</Label>
              <Select
                value={managementPackage.daysPerWeek.toString()}
                onValueChange={(value) => handleManagementPackageUpdate({ daysPerWeek: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                    <SelectItem key={days} value={days.toString()}>
                      {days} jour{days > 1 ? "s" : ""} par semaine
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Control Percentage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Contrôle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="hourly-rate">Pourcentage de contrôle</Label>
            <div className="relative">
              <Input
                type="number"
                id="occupancyRate"
                value={managementPackage.controlPercentage ?? ""}
                onChange={(e) => handleControlUpdate({ controlPercentage: Number.parseInt(e.target.value)})}
                max={100}
                min={0}
                placeholder="Taux de contrôle en %"
                className={errorControl ? "border-red-500" : ""}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
            {errorControl && <p className="text-sm text-red-600">{errorControl}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Linen Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Gestion du linge <Checkbox className="border-green-600 focus-visible:ring-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white" 
            checked={managementPackage.laundryDaysPerWeek && managementPackage.laundryManagementHours ? true : false} 
            onCheckedChange={(checked) => handleManagementPackageUpdate({ laundryDaysPerWeek: checked ? 2 : undefined, laundryManagementHours: checked ? 1.0 : undefined })}
          />
          </CardTitle>
        </CardHeader>
        <CardContent>
          { managementPackage.laundryDaysPerWeek && managementPackage.laundryManagementHours ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heures par jour</Label>
                <Input
                  type="number"
                  min="1.0"
                  step="0.1"
                  value={managementPackage.laundryManagementHours}
                  onChange={(e) => {
                    const value = Math.max(1.0, Number.parseFloat(e.target.value) || 1.0)
                    handleManagementPackageUpdate({ laundryManagementHours: value })
                  }}
                  className="text-center"
                />
                <div className="text-xs text-gray-500 text-center">Minimum: 1.0 heure</div>
              </div>
              <div className="space-y-2">
                <Label>Jours par semaine</Label>
                <Select
                  value={managementPackage.laundryDaysPerWeek.toString()}
                  onValueChange={(value) => handleManagementPackageUpdate({ laundryDaysPerWeek: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((days) => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} jour{days > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (<div></div>)}
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <CardTitle>Résumé du forfait encadrement</CardTitle>
              <Badge className="bg-red-600">Estimation</Badge>
            </div>            
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">


            <div>
              <h3 className="text-md font-bold mb-2 text-[#1d2f57]">Temps / semaines</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-[#858EAD] mb-1">Temps répartition des chambres</div>
                  <div className="text-lg font-semibold text-[#1d2f57]">{timeRepartition.toFixed(2)} h</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-[#858EAD] mb-1">Temps de contrôle</div>
                  <div className="text-lg font-semibol text-[#1d2f57]">{timeControl.toFixed(2)} h</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-[#858EAD] mb-1">Temps Gestion linge</div>
                  <div className="text-lg font-semibold text-[#1d2f57]">{timeGestionLinge.toFixed(2)} h</div>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <div className="text-sm text-[#858EAD] mb-1">Temps de formation</div>
                  <div className="text-lg font-semibold text-[#1d2f57]">{timeFormation.toFixed(2)} h</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-bold mb-2 text-[#1d2f57]">Temps / jours</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-[#858EAD] mb-1">Temps répartition des chambres</div>
                  <div className="text-lg font-semibold text-[#1d2f57]">{timeRepartitionDay.toFixed(2)} h</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-[#858EAD] mb-1">Temps de contrôle</div>
                  <div className="text-lg font-semibol text-[#1d2f57]">{timeControlDay.toFixed(2)} h</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-[#858EAD] mb-1">Temps Gestion linge</div>
                  <div className="text-lg font-semibold text-[#1d2f57]">{timeGestionLingeDay.toFixed(2)} h</div>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <div className="text-sm text-[#858EAD] mb-1">Temps de formation</div>
                  <div className="text-lg font-semibold text-[#1d2f57]">{timeFormationDay.toFixed(2)} h</div>
                </div>
              </div>
            </div>

            <Separator className="bg-[#858EAD]" />

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-[#1d2f57]">Forfait encadrement</span>
                <span className="text-2xl font-bold text-green-600">{finalResult.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
