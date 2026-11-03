"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import type { MultiPurpose, TechnicalCadence, TechnicalCadenceService } from "@/types/multi-purpose"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"

interface MultiPurposeStep1Props {
  multiPurposes: MultiPurpose[]
  technicalCadences: TechnicalCadence[]
  onAdd: (multiPurpose: MultiPurpose) => void
  onUpdate: (purposeId: number, updates: Partial<MultiPurpose>) => void
  onDelete: (purposeId: number) => void
}

const FREQUENCIES = ["UNIQUE", "H1", "H2", "H3", "H4", "H5", "H6", "H7", "M", "M2", "BIMESTRIEL", "T", "S", "A"]

export default function MultiPurposeStep1({
  multiPurposes,
  technicalCadences,
  onAdd,
  onUpdate,
  onDelete,
}: MultiPurposeStep1Props) {  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState<MultiPurpose | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    surface: "",
    serviceType: "",
    frequency: "",
    travelCosts: undefined as string | undefined,
    customCadence: undefined as string | undefined,
    remarks: "",
  })

  const cadenceServices = formData.type ? technicalCadences.find(type => type.key === formData.type)?.services : []
  const selectedCadenceService = formData.serviceType && cadenceServices?.find(service => service.key === formData.serviceType)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.name && formData.type && formData.surface && formData.serviceType && formData.frequency) {
      if (editingBuilding) {
        onUpdate(editingBuilding.id, {
          name: formData.name,
          type: formData.type,
          surface: Number.parseInt(formData.surface),
          serviceType: formData.serviceType,
          frequency: formData.frequency,
          travelCosts: formData.travelCosts ? Number.parseFloat(formData.travelCosts) : undefined,
          customCadence: formData.customCadence ? Number.parseInt(formData.customCadence) : undefined,
          remarks: formData.remarks,
        })
      } else {
        const newBuilding: MultiPurpose = {
          id: Date.now(),
          name: formData.name,
          type: formData.type,
          surface: Number.parseInt(formData.surface),
          serviceType: formData.serviceType,
          frequency: formData.frequency,
          travelCosts: formData.travelCosts ? Number.parseFloat(formData.travelCosts) : undefined,
          customCadence: formData.customCadence ? Number.parseInt(formData.customCadence) : undefined,
          remarks: formData.remarks,
        }
        onAdd(newBuilding)
      }

      setFormData({
        name: "",
        type: "",
        surface: "",
        serviceType: "",
        frequency: "",
        travelCosts: undefined,
        customCadence: undefined,
        remarks: "",
      })
      setEditingBuilding(null)
      setIsDialogOpen(false)
    }
  }

  const handleEdit = (building: MultiPurpose) => {
    setEditingBuilding(building)
    setFormData({
      name: building.name,
      type: building.type,
      surface: String(building.surface),
      serviceType: building.serviceType,
      frequency: building.frequency,
      travelCosts: building.travelCosts ? String(building.travelCosts) : undefined,
      customCadence: building.customCadence ? String(building.customCadence) : undefined,
      remarks: building.remarks || "",
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingBuilding(null)
    setFormData({
      name: "",
      type: "",
      surface: "",
      serviceType: "",
      frequency: "",
      travelCosts: undefined,
      customCadence: undefined,
      remarks: "",
    })
    setIsDialogOpen(true)
  }

  const handleTypeChange = (typeKey: string) => {
    setFormData((prev) => ({
      ...prev,
      type: typeKey,
      customCadence: undefined,
    }))
  }

  const handleTypeServiceChange = (typeKey: string) => {
    const selectedCadenceService = cadenceServices?.find(service => service.key === typeKey)

    setFormData((prev) => ({
      ...prev,
      serviceType: typeKey,
      customCadence: selectedCadenceService?.cadence === -1 ? "" : String(selectedCadenceService?.cadence) || "",
    }))
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


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Configuration des Prestations polyvalentes</h2>
        <p className="text-[#858EAD] mt-2">Ajoutez les prestations polyvalentes à inclure dans votre chiffrage</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#1D2F57]">Prestations polyvalentes ({multiPurposes.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une Prestation polyvalente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBuilding ? "Modifier une Prestation polyvalente" : "Ajouter une Prestation polyvalente"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Nom de la prestation *</Label>
                    <Input
                      id="service-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-type">Typologie *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={handleTypeChange} 
                      required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la typologie" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicalCadences.map((type) => (
                          <SelectItem key={type.key} value={type.key}>
                            {type.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-surface">Surface (m²) *</Label>
                    <Input
                      id="service-surface"
                      type="number"
                      min="1"
                      value={formData.surface}
                      onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor-type">Type de prestation *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={handleTypeServiceChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type de prestation" />
                      </SelectTrigger>
                      <SelectContent>
                        {cadenceServices && cadenceServices.map((type) => (
                          <SelectItem key={type.key} value={type.key}>
                            {type.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Fréquence de nettoyage *</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la fréquence" />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((freq) => (
                          <SelectItem key={freq} value={freq}>
                            {freq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedCadenceService && (selectedCadenceService.range != null || selectedCadenceService.cadence == -1) ? (
                <div className="space-y-2">
                    <Label htmlFor="service-cadence">Cadence</Label>
                    {selectedCadenceService?.range != null && (
                    <span className="text-xs text-gray-500 block mt-1">
                      Plage recommandée : {selectedCadenceService.range.min} - {selectedCadenceService.range.max}
                    </span>
                    )}
                  <Input
                    type="number"
                    id="service-cadence"
                    value={formData.customCadence || ""}
                    onChange={(e) => setFormData({ ...formData, customCadence: e.target.value })}
                    placeholder="Cadence"
                  />
                </div>
                ): (<div></div>)}

                {/* TODO: forfait de déplacement */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="travel-costs">
                      Forfait de déplacement (optionnel) <Checkbox className="border-green-600 focus-visible:ring-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white" 
                      checked={formData.travelCosts ? true : false} 
                       onCheckedChange={(checked) => setFormData({ ...formData, travelCosts: checked ? "49.0" : undefined })}
                       />
                      </Label>
                  </div>
                  {formData.travelCosts != null ? (
                    <Input
                      id="travel-costs"
                      type="number"
                      step="0.1"
                      value={formData.travelCosts || ""}
                      onChange={(e) => setFormData({ ...formData, travelCosts: e.target.value })}
                    />
                  ): (<div></div>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarques</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Remarques ou instructions spéciales..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">{editingBuilding ? "Modifier" : "Ajouter"}</Button>
                </div>
              </form>
          </DialogContent>
        </Dialog>
      </div>

      {multiPurposes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Aucune prestation polyvalente ajoutée. Cliquez sur "Ajouter une Prestation polyvalente" pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {multiPurposes.map((building) => (
            <Card key={building.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{building.name}</CardTitle>
                    <p className="text-sm text-[#858EAD] mt-1">
                      Type: {getTitleFromTechnicalCadence(building.type)} • {building.surface} m² • {getServiceTypeTitle(building.type, building.serviceType)} • {building.frequency}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(building)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(building.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
