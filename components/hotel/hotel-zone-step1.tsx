"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Star, Plus, Trash2, Edit, Check, X } from "lucide-react"
import type { HotelZoneData, HotelRoomType } from "@/types/hotel"

interface HotelZoneStep1Props {
  data: HotelZoneData
  prefillRoomTypes: Record<number, HotelRoomType[]>
  onUpdate: (updates: Partial<HotelZoneData>) => void
}

export default function HotelZoneStep1({ data, prefillRoomTypes, onUpdate }: HotelZoneStep1Props) {
  const [newRoomType, setNewRoomType] = useState<Partial<HotelRoomType>>({
    name: "",
    clearanceRate: 0,
    recoucheRate: 0,
  })
  const [editingRoomType, setEditingRoomType] = useState<HotelRoomType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPredefined, setSelectedPredefined] = useState<string[]>([])

  const predefinedRoomTypes = prefillRoomTypes[data.classification] || []

  const handleClassificationChange = (stars: number) => {
    onUpdate({
      classification: stars,
      // Reset room types when classification changes
      roomTypes: [],
    })
    setSelectedPredefined([])
  }

  const handlePredefinedSelection = (roomTypeId: string, checked: boolean) => {
    if (checked) {
      setSelectedPredefined([...selectedPredefined, roomTypeId])
    } else {
      setSelectedPredefined(selectedPredefined.filter((id) => id !== roomTypeId))
    }
  }

  const handleAddPredefinedRoomTypes = () => {
    const roomTypesToAdd = predefinedRoomTypes.filter((rt) => selectedPredefined.includes(rt.id))
    const existingIds = data.roomTypes.map((rt) => rt.id)
    const newRoomTypes = roomTypesToAdd.filter((rt) => !existingIds.includes(rt.id))

    onUpdate({
      roomTypes: [...data.roomTypes, ...newRoomTypes],
    })
    setSelectedPredefined([])
  }

  const handleAddCustomRoomType = () => {
    if (newRoomType.name && newRoomType.clearanceRate && newRoomType.recoucheRate) {
      const roomType: HotelRoomType = {
        id: `custom-${Date.now()}`,
        name: newRoomType.name,
        clearanceRate: newRoomType.clearanceRate,
        recoucheRate: newRoomType.recoucheRate,
        isCustom: true,
      }

      onUpdate({
        roomTypes: [...data.roomTypes, roomType],
      })

      setNewRoomType({
        name: "",
        clearanceRate: 0,
        recoucheRate: 0,
      })
      setIsDialogOpen(false)
    }
  }

  const handleEditRoomType = (roomType: HotelRoomType) => {
    setEditingRoomType(roomType)
    setNewRoomType({
      name: roomType.name,
      clearanceRate: roomType.clearanceRate,
      recoucheRate: roomType.recoucheRate,
    })
    setIsDialogOpen(true)
  }

  const handleUpdateRoomType = () => {
    if (editingRoomType && newRoomType.name && newRoomType.clearanceRate && newRoomType.recoucheRate) {
      const updatedRoomTypes = data.roomTypes.map((rt) =>
        rt.id === editingRoomType.id
          ? {
              ...rt,
              name: newRoomType.name!,
              clearanceRate: newRoomType.clearanceRate!,
              recoucheRate: newRoomType.recoucheRate!,
            }
          : rt,
      )

      onUpdate({ roomTypes: updatedRoomTypes })
      setEditingRoomType(null)
      setNewRoomType({ name: "", clearanceRate: 0, recoucheRate: 0 })
      setIsDialogOpen(false)
    }
  }

  const handleDeleteRoomType = (id: string) => {
    onUpdate({
      roomTypes: data.roomTypes.filter((rt) => rt.id !== id),
      roomCounts: Object.fromEntries(
        Object.entries(data.roomCounts).filter(([key]) => key !== id)
      ),
    })
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingRoomType(null)
    setNewRoomType({ name: "", clearanceRate: 0, recoucheRate: 0 })
  }

  const renderStars = (count: number, selected: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 cursor-pointer transition-colors ${
          i < selected ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"
        }`}
        onClick={() => handleClassificationChange(i + 1)}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Zone Hôtel - Classification & Types de Chambres</h2>
        <p className="text-[#858EAD] mt-2">
          Définissez la classification de l'hôtel et sélectionnez les types de chambres
        </p>
      </div>

      {/* Hotel Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Classification de l'hôtel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2">
            {renderStars(5, data.classification)}
            <Badge variant="outline" className="ml-4">
              {data.classification} étoile{data.classification > 1 ? "s" : ""}
            </Badge>
          </div>
        </CardContent>
      </Card>


      {/* Hotel global rate */}
      <Card>
        <CardHeader>
          <CardTitle>Taux horraire global</CardTitle>
        </CardHeader>
        <CardContent>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={data.globalRate}
                    onChange={(e) => onUpdate({globalRate: Number.parseFloat(e.target.value) || 0})}
                    placeholder="Prix horraire global"
                    min={0}
                    step="0.1"
                  />
                </div>
        </CardContent>
      </Card>

      {/* Predefined Room Types */}
      {predefinedRoomTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Types de chambres prédéfinis</CardTitle>
            <p className="text-sm text-[#858EAD]">
              Sélectionnez les types de chambres adaptés à votre classification {data.classification} étoiles
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {predefinedRoomTypes.map((roomType) => {
                const isAlreadyAdded = data.roomTypes.some((rt) => rt.id === roomType.id)
                const isSelected = selectedPredefined.includes(roomType.id)

                return (
                  <div key={roomType.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={roomType.id}
                      checked={isSelected}
                      disabled={isAlreadyAdded}
                      onCheckedChange={(checked) => handlePredefinedSelection(roomType.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={roomType.id} className="font-medium">
                          {roomType.name}
                        </Label>
                        {isAlreadyAdded && <Badge variant="buildingtype">Déjà ajouté</Badge>}
                      </div>
                      <div className="text-sm text-[#858EAD]">
                        Mise à blanc/départ: {roomType.clearanceRate} min/ch • Recouche: {roomType.recoucheRate} min/ch
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedPredefined.length > 0 && (
              <Button onClick={handleAddPredefinedRoomTypes} className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Ajouter {selectedPredefined.length} type{selectedPredefined.length > 1 ? "s" : ""} sélectionné
                {selectedPredefined.length > 1 ? "s" : ""}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Room Types */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Types de chambres personnalisés</CardTitle>
              <p className="text-sm text-[#858EAD] mt-1">
                Créez vos propres types de chambres avec des paramètres spécifiques
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un type personnalisé
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingRoomType ? "Modifier le type de chambre" : "Ajouter un type de chambre personnalisé"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customRoomName">Nom du type</Label>
                    <Input
                      id="customRoomName"
                      value={newRoomType.name || ""}
                      onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                      placeholder="Ex: Chambre Familiale"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customClearanceRate">Mise à blanc/départ (min/ch)</Label>
                      <Input
                        id="customClearanceRate"
                        type="number"
                        value={newRoomType.clearanceRate || ""}
                        onChange={(e) =>
                          setNewRoomType({ ...newRoomType, clearanceRate: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="customRecoucheRate">Recouche (min/ch)</Label>
                      <Input
                        id="customRecoucheRate"
                        type="number"
                        value={newRoomType.recoucheRate || ""}
                        onChange={(e) =>
                          setNewRoomType({ ...newRoomType, recoucheRate: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleDialogClose}>
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      onClick={editingRoomType ? handleUpdateRoomType : handleAddCustomRoomType}
                      disabled={!newRoomType.name || !newRoomType.clearanceRate || !newRoomType.recoucheRate}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {editingRoomType ? "Modifier" : "Ajouter"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {data.roomTypes.length > 0 ? (
            <div className="space-y-3">
              {data.roomTypes.map((roomType) => (
                <div key={roomType.id} className="border rounded-lg p-4 flex items-center justify-between border-[#858EAD]">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-[#1d2f57]">{roomType.name}</div>
                      <Badge variant={roomType.isCustom ? "buildingtype" : "buildingtype"}>
                        {roomType.isCustom ? "Personnalisé" : "Prédéfini"}
                      </Badge>
                    </div>
                    <div className="text-sm text-[#858EAD]">
                      Mise à blanc/départ: {roomType.clearanceRate} min/ch • Recouche: {roomType.recoucheRate} min/ch
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditRoomType(roomType)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRoomType(roomType.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun type de chambre ajouté. Sélectionnez des types prédéfinis ou créez vos propres types.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
