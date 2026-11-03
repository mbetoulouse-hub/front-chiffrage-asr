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
import type { SectorType } from "@/types/sector"
import type { Building } from "@/types/estimate"

interface BuildingStepProps {
  buildings: Building[]
  selectedSector: string
  sectorTypes: SectorType[]
  onAdd: (building: Building) => void
  onUpdate: (buildingId: number, updates: Partial<Building>) => void
  onDelete: (buildingId: number) => void
}

export default function BuildingStep({
  buildings,
  selectedSector,
  sectorTypes,
  onAdd,
  onUpdate,
  onDelete,
}: BuildingStepProps) {
  // Get building types for the selected sector
  const selectedSectorData = sectorTypes.find((s) => s.sector === selectedSector)
  const buildingTypes = selectedSectorData?.buildingTypes || []
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    buildingType: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.name && formData.buildingType) {
      if (editingBuilding) {
        onUpdate(editingBuilding.id, {
          name: formData.name,
          buildingType: formData.buildingType,
        })
      } else {


        const newBuilding: Building = {
          id: Date.now(),
          name: formData.name,
          buildingType: formData.buildingType,
        }
        onAdd(newBuilding)
      }

      setFormData({ name: "", buildingType: "" })
      setEditingBuilding(null)
      setIsDialogOpen(false)
    }
  }

  const handleEdit = (building: Building) => {
    setEditingBuilding(building)
    setFormData({
      name: building.name,
      buildingType: building.buildingType,
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingBuilding(null)
    setFormData({ name: "", buildingType: buildingTypes.length == 1 ? buildingTypes[0]?.key || "" : "" })
    setIsDialogOpen(true)
  }

  const getBuildingTypeTitle = (key: string) => {
    return buildingTypes.find((bt) => bt.key === key)?.title || key
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Configuration des bâtiments / Zones</h2>
        <p className="text-[#858EAD] mt-2">Ajoutez les bâtiments à inclure dans votre chiffrage</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#1D2F57]">Bâtiments ({buildings.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un bâtiment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBuilding ? "Modifier le bâtiment" : "Ajouter un bâtiment"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="building-name">Nom du bâtiment *</Label>
                <Input
                  id="building-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Bâtiment principal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building-type">Type de bâtiment *</Label>
                <Select
                  value={formData.buildingType}
                  onValueChange={(value) => setFormData({ ...formData, buildingType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type de bâtiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {buildings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Aucun bâtiment ajouté. Cliquez sur "Ajouter un bâtiment" pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {buildings.map((building) => (
            <Card key={building.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{building.name}</CardTitle>
                    <p className="text-sm text-[#858EAD] mt-1">Type: {getBuildingTypeTitle(building.buildingType)}</p>
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
