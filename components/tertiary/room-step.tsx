"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2 } from "lucide-react"
import AdditionalPropertyField from "./additional-property-field"
import type { RoomType, SectorType } from "@/types/sector"
import type { Building, Room } from "@/types/estimate"

interface RoomStepProps {
  buildings: Building[]
  rooms: Record<string, Room[]>
  selectedSector: string
  sectorTypes: SectorType[]
  onAddRoom: (buildingId: number, room: Room) => void
  onUpdateRoom: (buildingId: number, roomId: number, updates: Partial<Room>) => void
  onDeleteRoom: (buildingId: number, roomId: number) => void
}

const FLOOR_TYPES = [{key: "WASHABLE", title: "Sol lavable"}, {key: "CARPETED", title: "Sol moquetté"}]

const FREQUENCIES = ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "M", "M2", "BIMESTRIEL", "T", "S", "A"]

export default function RoomStep({
  buildings,
  rooms,
  selectedSector,
  sectorTypes,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
}: RoomStepProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(Date.now())
  const [editingRoom, setEditingRoom] = useState<{ buildingId: number; room: Room } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    surface: "",
    floorType: "",
    frequency: "",
    remarks: "",
    additionalProperties: [] as Array<{ key: string; value: any }>,
  })

  const getFloorTypeTitle = (key: string): string => {
    const floorType = FLOOR_TYPES.find((ft) => ft.key === key)
    return floorType ? floorType.title : key
  }

  // Get room types for the selected building type
  const getRoomTypesForBuilding = (buildingId: number): RoomType[] => {
    const building = buildings.find((b) => b.id === buildingId)
    if (!building) return []

    const selectedSectorData = sectorTypes.find((s) => s.sector === selectedSector)
    if (!selectedSectorData) return []

    const buildingType = selectedSectorData.buildingTypes.find((bt) => bt.key === building.buildingType)
    return buildingType?.rooms || []
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.name && formData.type && formData.surface && formData.floorType && formData.frequency) {
      const roomData: Omit<Room, "id"> = {
        name: formData.name,
        type: formData.type,
        surface: Number.parseInt(formData.surface),
        floorType: formData.floorType,
        frequency: formData.frequency,
        remarks: formData.remarks,
        additionalProperties: formData.additionalProperties,
      }

      if (editingRoom) {
        onUpdateRoom(editingRoom.buildingId, editingRoom.room.id, roomData)
      } else {
        const newRoom: Room = {
          ...roomData,
          id: Date.now(),
        }
        onAddRoom(selectedBuildingId, newRoom)
      }
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      surface: "",
      floorType: "",
      frequency: "",
      remarks: "",
      additionalProperties: [],
    })
    setEditingRoom(null)
    setSelectedBuildingId(Date.now())
    setIsDialogOpen(false)
  }

  const handleEdit = (buildingId: number, room: Room) => {
    setEditingRoom({ buildingId, room })
    setSelectedBuildingId(buildingId)
    setFormData({
      name: room.name,
      type: room.type,
      surface: room.surface.toString(),
      floorType: room.floorType,
      frequency: room.frequency,
      remarks: room.remarks || "",
      additionalProperties: room.additionalProperties || [],
    })
    setIsDialogOpen(true)
  }

  const handleAdd = (buildingId: number) => {
    setSelectedBuildingId(buildingId)
    setEditingRoom(null)
    setFormData({
      name: "",
      type: "",
      surface: "",
      floorType: "",
      frequency: "",
      remarks: "",
      additionalProperties: [],
    })
    setIsDialogOpen(true)
  }

  const handleRoomTypeChange = (roomTypeKey: string) => {
    const roomTypes = getRoomTypesForBuilding(selectedBuildingId)
    const selectedRoomType = roomTypes.find((rt) => rt.key === roomTypeKey)

    setFormData((prev) => ({
      ...prev,
      type: roomTypeKey,
      additionalProperties:
        selectedRoomType?.additionalProperties?.map((prop) => ({
          key: prop,
          value: getDefaultValueForProperty(prop),
        })) || [],
    }))
  }

  const updateAdditionalProperty = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      additionalProperties: prev.additionalProperties.map((prop) => (prop.key === key ? { ...prop, value } : prop)),
    }))
  }

  const getDefaultValueForProperty = (key: string): any => {
    switch (key) {
      case "CHECK_BOX_ARMCHAIR":
      case "CHECK_BOX_ACTIVITY":
      case "CHECK_BOX_PARTIAL":
      case "CHECK_BOX_PARKING":
        return false
      case "CUSTOM_WEEK_NUMBER":
        return "52"
      default:
        return ""
    }
  }

  const getRoomTypeTitle = (buildingId: number, roomTypeKey: string) => {
    const roomTypes = getRoomTypesForBuilding(buildingId)
    return roomTypes.find((rt) => rt.key === roomTypeKey)?.title || roomTypeKey
  }

  const getBuildingTypeTitle = (buildingId: number) => {
    const building = buildings.find((b) => b.id === buildingId)
    if (!building) return ""

    const selectedSectorData = sectorTypes.find((s) => s.sector === selectedSector)
    if (!selectedSectorData) return building.buildingType

    const buildingType = selectedSectorData.buildingTypes.find((bt) => bt.key === building.buildingType)
    return buildingType?.title || building.buildingType
  }

  const totalRooms = Object.values(rooms).reduce((sum, buildingRooms) => sum + buildingRooms.length, 0)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Configuration des pièces</h2>
        <p className="text-[#858EAD] mt-2">Ajoutez les pièces pour chaque bâtiment</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#1D2F57]">Pièces par bâtiment ({totalRooms} total)</h3>
      </div>

      <Tabs defaultValue={String(buildings[0]?.id)} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-[#F7F7FD] p-2 sm:grid-cols-2 lg:grid-cols-4">
          {buildings.map((building) => (
            <TabsTrigger
              key={building.id}
              value={String(building.id)}
              className="whitespace-normal text-sm"
            >
              <p className="text-[#2F57A2]">{building.name} ({(rooms[building.id] || []).length})</p>
            </TabsTrigger>
          ))}
        </TabsList>

        {buildings.map((building) => (
          <TabsContent key={building.id} value={String(building.id)} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{building.name}</CardTitle>
                    <p className="text-sm text-[#858EAD]">
                      Type: {getBuildingTypeTitle(building.id)} • {(rooms[building.id] || []).length} pièce(s)
                    </p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => handleAdd(building.id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une pièce
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingRoom ? "Modifier la pièce" : "Ajouter une pièce"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="room-name">Nom de la pièce *</Label>
                            <Input
                              id="room-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="room-type">Type de pièce *</Label>
                            <Select value={formData.type} onValueChange={handleRoomTypeChange} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type" />
                              </SelectTrigger>
                              <SelectContent>
                                {getRoomTypesForBuilding(selectedBuildingId).map((roomType) => (
                                  <SelectItem key={roomType.key} value={roomType.key}>
                                    {roomType.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="room-surface">Surface (m²) *</Label>
                            <Input
                              id="room-surface"
                              type="number"
                              min="1"
                              value={formData.surface}
                              onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="floor-type">Type de sol *</Label>
                            <Select
                              value={formData.floorType}
                              onValueChange={(value) => setFormData({ ...formData, floorType: value })}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type de sol" />
                              </SelectTrigger>
                              <SelectContent>
                                {FLOOR_TYPES.map((type) => (
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

                        {/* Additional Properties */}
                        {formData.additionalProperties.length > 0 && (
                          <div className="space-y-4">
                            {formData.additionalProperties.map((prop) => (
                              <div key={prop.key} className="space-y-2">
                                <AdditionalPropertyField
                                  prop={prop}
                                  update={updateAdditionalProperty}
                                />
                              </div>
                            ))}
                          </div>
                        )}

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
                          <Button type="button" variant="outline" onClick={resetForm}>
                            Annuler
                          </Button>
                          <Button type="submit">{editingRoom ? "Modifier" : "Ajouter"}</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent>
                {(rooms[building.id] || []).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune pièce ajoutée pour ce bâtiment.</p>
                ) : (
                  <div className="grid gap-3">
                    {(rooms[building.id] || []).map((room) => (
                      <div key={room.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{room.name}</div>
                          <div className="text-sm text-[#858EAD]">
                            {getRoomTypeTitle(building.id, room.type)} • {room.surface} m² • {getFloorTypeTitle(room.floorType)} •{" "}
                            {room.frequency}
                          </div>
                          {room.remarks && <div className="text-xs text-gray-500 mt-1">{room.remarks}</div>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(building.id, room)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onDeleteRoom(building.id, room.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
