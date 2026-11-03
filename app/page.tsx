"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import CompanyInfoStep from "../components/tertiary/company-info-step"
import BuildingStep from "../components/tertiary/building-step"
import RoomStep from "../components/tertiary/room-step"
import RecapStep from "../components/tertiary/recap-step"
import ResultsStep from "../components/tertiary/results-step"
import HourlyRateStep from "../components/tertiary/hourly-rate-step"
import LoginPage from "../components/login-page"
import Dashboard from "../components/dashboard"
import AdminPanel from "../components/admin-panel"
import { authService } from "../lib/auth"
import type { User } from "@/types/user"
import { getSectorTypes } from "../lib/sector-api"
import { calculateEstimate, exportEstimate } from "../lib/calculate-api"
import { createEstimate, updateEstimate } from "../lib/estimate-api"
import type { SectorType } from "@/types/sector"
import type { EstimateData, Building, Room, GetEstimateData } from "@/types/estimate"
import type { CalculateResult } from "@/types/calculate"
import ZoneSelector from "../components/zone-selector"
import HotelZoneStep1 from "../components/hotel/hotel-zone-step1"
import HotelZoneStep2 from "../components/hotel/hotel-zone-step2"
import HotelZoneStep3 from "../components/hotel/hotel-zone-step3"
import HotelZoneStep4 from "../components/hotel/hotel-zone-step4"
import HotelZoneStep5 from "../components/hotel/hotel-zone-step5"
import type { HotelRoomType, HotelZoneData } from "@/types/hotel"
import { fetchPrefillRoomType } from "@/lib/zone-hotel-api"
import type { FatalError } from "@/types/error"
import FatalErrorAlert from "@/components/fatal-error-alert"
import {
  prepareDataForCalculation,
  prepareEstimateForUpdate,
  prepareHotelZoneForUpdate,
} from "@/lib/utils/prepare-data-for-api-util"
import PreviousNext from "@/components/previous-next"
import Header from "@/components/header"
import { isHotelSector } from "@/lib/utils/sector-util"
import { getTechnicalCadences } from "@/lib/technical-cadence-api"
import type { MultiPurpose, TechnicalCadence } from "@/types/multi-purpose"
import MultiPurposeStep1 from "@/components/multi-purpose/multi-purpose-zone-step1"
import MultiPurposeStep2 from "@/components/multi-purpose/multi-purpose-zone-step2"
import MultiPurposeStep3 from "@/components/multi-purpose/multi-purpose-zone-step3"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export const STEPS = [
  { id: 1, title: "Informations sur l'entreprise", description: "" },
  { id: 2, title: "Bâtiments / Zones", description: "" },
  { id: 3, title: "Pièces", description: "" },
  { id: 4, title: "Taux horaire", description: "" },
  { id: 5, title: "Résumé chiffrage", description: "" },
  { id: 6, title: "Résultats", description: "" },
]

export const HOTEL_STEPS = [
  { id: 1, title: "Classification & Types", description: "" },
  { id: 2, title: "Nombre de chambres", description: "" },
  { id: 3, title: "Forfait minimum", description: "" },
  { id: 4, title: "Forfait encadrement", description: "" },
  { id: 5, title: "Résultats hôtel", description: "" },
]

export const MULTI_PURPOSE_STEPS = [
  { id: 1, title: "Prestations", description: "" },
  { id: 2, title: "Taux horaire(s)", description: "" },
  { id: 3, title: "Résultats Prestation polyvalentes", description: "" },
]

export type AppView = "login" | "dashboard" | "estimate-management" | "admin-panel"
export type AppZone = "tertiary" | "hotel" | "multi-purpose"

export default function EstimateManagement() {
  const [currentView, setCurrentView] = useState<AppView>("login")
  const [currentZone, setCurrentZone] = useState<AppZone>("tertiary")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [editMode, setEditMode] = useState(false)

  const [fatalError, setFatalError] = useState<FatalError | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [calculationError, setCalculationError] = useState<string | null>(null)

  const [sectorsLoading, setSectorsLoading] = useState(false)
  const [calculationLoading, setCalculationLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [sectorTypes, setSectorTypes] = useState<SectorType[]>([])
  const [technicalCadences, setTechnicalCadences] = useState<TechnicalCadence[]>([])
  const [prefillRoomTypes, setPrefillRoomTypes] = useState<Record<number, HotelRoomType[]>>([])

  const [calculationResults, setCalculationResults] = useState<CalculateResult | null>(null)

  const [tertiaryStep, setTertiaryStep] = useState(1)
  const [estimateData, setEstimateData] = useState<EstimateData>({
    id: Date.now(),
    company: {
      name: "",
      businessSector: "",
    },
    buildings: [],
    multiPurposeData: { multiPurposes: [], multiPurposeRates: [] },
    rooms: {},
  })

  const [multiPurposeStep, setMultiPurposeStep] = useState(1)

  const [hotelStep, setHotelStep] = useState(1)
  const [hotelZoneData, setHotelZoneData] = useState<HotelZoneData>({
    classification: 3,
    globalRate: 21.0,
    occupancyRate: 75,
    openingDaysPerWeek: 6,
    roomTypes: [],
    roomCounts: {},
  })

  const { toast } = useToast()

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setCurrentUser(null)
      setCurrentView("login")
      // Reset estimate data
      setEstimateData({
        id: Date.now(),
        company: { name: "", businessSector: "" },
        buildings: [],
        multiPurposeData: { multiPurposes: [], multiPurposeRates: [] },
        rooms: {},
      })
      setHotelZoneData({
        classification: 3,
        globalRate: 21.0,
        occupancyRate: 75,
        openingDaysPerWeek: 6,
        roomTypes: [],
        roomCounts: {},
      })
      setTertiaryStep(1)
      setHotelStep(1)
      setMultiPurposeStep(1)
      setCurrentZone("tertiary")
      setCalculationResults(null)
      setSectorTypes([])
      setTechnicalCadences([])
      setPrefillRoomTypes([])
      setFatalError(null)
      setCalculationError(null)
      setSaveError(null)
    }

    window.addEventListener("auth:logout", handleLogout)
    return () => window.removeEventListener("auth:logout", handleLogout)
  }, [])

  const fetchSectorTypes = async () => {
    setSectorsLoading(true)
    setFatalError(null)

    const result = await getSectorTypes()

    if (result.error) {
      setFatalError({ type: "SECTOR_TYPE", error: result.error })
      setSectorTypes([])
    } else if (result.data) {
      setSectorTypes(result.data)
      setFatalError(null)

      const resultTechnicalCadences = await getTechnicalCadences()
      if (resultTechnicalCadences.error) {
        setFatalError({ type: "TECHNICAL_CADENCE", error: resultTechnicalCadences.error })
        setTechnicalCadences([])
      } else if (resultTechnicalCadences.data) {
        setTechnicalCadences(resultTechnicalCadences.data)
      }
    }

    setSectorsLoading(false)
  }

  const fetchPrefillRooms = async () => {
    if (isHotelSector(estimateData)) {
      const result = await fetchPrefillRoomType()

      if (result.error) {
        setFatalError({ type: "PREFILL_ROOM_TYPE", error: result.error })
        setPrefillRoomTypes([])
      } else if (result.data) {
        setPrefillRoomTypes(result.data.prefillRoomType)
        setFatalError(null)
      }
    }
  }

  const updateEstimateData = (updates: Partial<EstimateData>) => {
    if (updates.company && updates.company.businessSector !== estimateData.company.businessSector) {
      // Reset buildings and rooms if sector changes
      updates.buildings = []
      updates.rooms = {}
    }

    setEstimateData((prev) => ({ ...prev, ...updates }))
  }

  const updateHotelZoneData = (updates: Partial<HotelZoneData>) => {
    setHotelZoneData((prev) => ({ ...prev, ...updates }))
  }

  const addMultiPurpose = (multiPurpose: MultiPurpose) => {
    setEstimateData((prev) => ({
      ...prev,
      multiPurposeData: {
        ...prev.multiPurposeData,
        multiPurposes: [...prev.multiPurposeData.multiPurposes, multiPurpose],
      },
    }))
  }

  const updateMultiPurpose = (purposeId: number, updates: Partial<MultiPurpose>) => {
    setEstimateData((prev) => ({
      ...prev,
      multiPurposeData: {
        ...prev.multiPurposeData,
        multiPurposes: prev.multiPurposeData.multiPurposes.map((b) => (b.id === purposeId ? { ...b, ...updates } : b)),
      },
    }))
  }

  const deleteMultiPurpose = (purposeId: number) => {
    setEstimateData((prev) => ({
      ...prev,
      multiPurposeData: {
        ...prev.multiPurposeData,
        multiPurposes: prev.multiPurposeData.multiPurposes.filter((b) => b.id !== purposeId),
      },
    }))
  }

  const addBuilding = (building: Building) => {
    setEstimateData((prev) => ({
      ...prev,
      buildings: [...prev.buildings, building],
      rooms: { ...prev.rooms, [building.id]: [] },
    }))
  }

  const updateBuilding = (buildingId: number, updates: Partial<Building>) => {
    setEstimateData((prev) => ({
      ...prev,
      buildings: prev.buildings.map((b) => (b.id === buildingId ? { ...b, ...updates } : b)),
    }))
  }

  const deleteBuilding = (buildingId: number) => {
    setEstimateData((prev) => {
      const newRooms = { ...prev.rooms }
      delete newRooms[buildingId]
      return {
        ...prev,
        buildings: prev.buildings.filter((b) => b.id !== buildingId),
        rooms: newRooms,
      }
    })
  }

  const addRoom = (buildingId: number, room: Room) => {
    setEstimateData((prev) => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [buildingId]: [...(prev.rooms[buildingId] || []), room],
      },
    }))
  }

  const updateRoom = (buildingId: number, roomId: number, updates: Partial<Room>) => {
    setEstimateData((prev) => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [buildingId]: prev.rooms[buildingId]?.map((r) => (r.id === roomId ? { ...r, ...updates } : r)) || [],
      },
    }))
  }

  const deleteRoom = (buildingId: number, roomId: number) => {
    setEstimateData((prev) => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [buildingId]: prev.rooms[buildingId]?.filter((r) => r.id !== roomId) || [],
      },
    }))
  }

  const saveEstimateData = async () => {
    setSaveLoading(true)
    setSaveError(null)

    try {
      if (!editMode && tertiaryStep === 1) {
        const result = await createEstimate(estimateData.company)

        if (result.error) {
          setSaveError(result.error)
          return false
        } else if (result.data) {
          setEstimateData((prev) => ({
            ...prev,
            ...result.data,
          }))
          return true
        }
      } else if ((editMode || tertiaryStep >= 2) && tertiaryStep <= 4) {
        // Update existing estimate for subsequent steps
        const result = await updateEstimate({
          estimate: prepareEstimateForUpdate(estimateData),
          hotelZoneData: isHotelSector(estimateData) ? prepareHotelZoneForUpdate(hotelZoneData) : undefined,
        })

        if (result.error) {
          setSaveError(result.error)
          return false
        } else if (result.data) {
          setEstimateData((prev) => ({
            ...prev,
            ...result.data?.estimate,
          }))
          setHotelZoneData((prev) => ({
            ...prev,
            ...result.data?.hotelZoneData,
          }))
          return true
        }
      }

      return true
    } catch (error) {
      console.error("Save error:", error)
      setSaveError("Une erreur inattendue s'est produite lors de la sauvegarde")
      return false
    } finally {
      setSaveLoading(false)
    }
  }

  const handleNext = async () => {
    if (currentZone === "hotel") {
      if (hotelStep < HOTEL_STEPS.length) {
        setEditMode(true)

        const saveSuccess = await saveEstimateData()
        if (!saveSuccess) {
          return // Don't proceed if save failed
        }

        setHotelStep(hotelStep + 1)
        return
      }
    } else if (currentZone === "multi-purpose") {
      if (multiPurposeStep < MULTI_PURPOSE_STEPS.length) {
        setEditMode(true)

        const saveSuccess = await saveEstimateData()
        if (!saveSuccess) {
          return // Don't proceed if save failed
        }

        setMultiPurposeStep(multiPurposeStep + 1)
        return
      }
    } else if (currentZone === "tertiary") {
      // Save data before proceeding to next step (except for recap and results steps)
      if (tertiaryStep >= 1 && tertiaryStep <= 4) {
        setEditMode(true)

        const saveSuccess = await saveEstimateData()
        if (!saveSuccess) {
          return // Don't proceed if save failed
        }
      }

      if (tertiaryStep < STEPS.length) {
        setTertiaryStep(tertiaryStep + 1)

        if (tertiaryStep === 1 && isHotelSector(estimateData)) {
          setCurrentZone("hotel")
          setHotelStep(1)
          await fetchPrefillRooms()
        }
      }
    }
  }

  const handlePrevious = async () => {
    if (currentZone === "hotel") {
      if (hotelStep > 1) {
        const saveSuccess = await saveEstimateData()
        if (!saveSuccess) {
          return // Don't proceed if save failed
        }

        setHotelStep(hotelStep - 1)
        return
      }
    } else if (currentZone === "multi-purpose") {
      if (multiPurposeStep > 1) {
        const saveSuccess = await saveEstimateData()
        if (!saveSuccess) {
          return // Don't proceed if save failed
        }

        setMultiPurposeStep(multiPurposeStep - 1)
        return
      }
    } else if (currentZone === "tertiary") {
      if (tertiaryStep > 1) {
        const saveSuccess = await saveEstimateData()
        if (!saveSuccess) {
          return // Don't proceed if save failed
        }

        if (tertiaryStep === 6 && isHotelSector(estimateData) && estimateData.buildings.length === 0) {
          setCurrentZone("hotel")
          setHotelStep(1)
        } else {
          setTertiaryStep(tertiaryStep - 1)
        }

        setSaveError(null) // Clear save error when going back
      }
    }
  }

  const handleZoneChange = (zone: AppZone) => {
    //TODO: rework this logic to avoid duplication
    if (zone === "hotel") {
      if (tertiaryStep === 6) {
        setHotelStep(5)
        setTertiaryStep(2)
      } else if (multiPurposeStep === 3) {
        setHotelStep(5)
        setMultiPurposeStep(1)
      } else {
        setHotelStep(1)
      }
    } else if (zone === "tertiary") {
      if (hotelStep === 5) {
        setHotelStep(1)
        setTertiaryStep(6)
      } else if (multiPurposeStep === 3) {
        setTertiaryStep(6)
        setMultiPurposeStep(1)
      } else {
        setTertiaryStep(2)
      }
    } else if (zone === "multi-purpose") {
      if (tertiaryStep === 6) {
        setMultiPurposeStep(3)
        setTertiaryStep(2)
      } else if (hotelStep === 5) {
        setMultiPurposeStep(3)
        setHotelStep(1)
      } else {
        setMultiPurposeStep(1)
      }
    }

    setCurrentZone(zone)
  }

  const handleSubmitEstimate = async () => {
    const saveSuccess = await saveEstimateData()
    if (!saveSuccess) {
      return // Don't proceed if save failed
    }

    setCalculationLoading(true)
    setCalculationError(null)

    try {
      // Transform data to match API format
      const apiData = prepareDataForCalculation(isHotelSector(estimateData), estimateData, hotelZoneData)
      console.log("Data to send to API:", apiData)

      const result = await calculateEstimate(apiData)

      if (result.error) {
        setCalculationError(result.error)
        setCalculationLoading(false)
      } else if (result.data) {
        setCalculationResults(result.data)
        setCalculationError(null)
      }

      handleNext()
    } catch (error) {
      console.error("Calculation error:", error)
      setCalculationError("Une erreur inattendue s'est produite lors du calcul du chiffrage.")
    } finally {
      setCalculationLoading(false)
    }
  }

  const handleExport = async () => {
    const downloadToast = toast({
      title: "Téléchargement en cours...",
      duration: 3000,
    })

    try {
      // Transform data to match API format
      const apiData = prepareDataForCalculation(isHotelSector(estimateData), estimateData, hotelZoneData)
      console.log("Data to send to API:", apiData)

      const result = await exportEstimate(apiData)

      if (result.error) {
        downloadToast.dismiss()
        toast({
          title: result.error || "Une erreur s'est produite lors de l'export.",
          variant: "destructive",
          duration: 3000,
        })
      } else if (result.data) {
        const url = URL.createObjectURL(result.data)
        const a = Object.assign(document.createElement("a"), { href: url, download: "export.xlsx" })
        a.click()
        URL.revokeObjectURL(url)
      }

    } catch (error) {
      console.error("Export error:", error)
      downloadToast.dismiss()
      toast({
        title: "Une erreur s'est produite lors de l'export.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const renderMultiPurposeStep = () => {
    switch (multiPurposeStep) {
      case 1:
        return (
          <MultiPurposeStep1
            multiPurposes={estimateData.multiPurposeData.multiPurposes}
            technicalCadences={technicalCadences}
            onAdd={addMultiPurpose}
            onUpdate={updateMultiPurpose}
            onDelete={deleteMultiPurpose}
          />
        )
      case 2:
        return (
          <MultiPurposeStep2
            technicalCadences={technicalCadences}
            multiPurposes={estimateData.multiPurposeData.multiPurposes}
            multiPurposeRates={estimateData.multiPurposeData.multiPurposeRates}
            onUpdateRates={(rates) =>
              setEstimateData((prev) => ({
                ...prev,
                multiPurposeData: {
                  ...prev.multiPurposeData,
                  multiPurposeRates: rates,
                },
              }))
            }
          />
        )
      case 3:
        return (
          <MultiPurposeStep3
            handleDownloadPDF={handleExport}
            handlePrevious={handlePrevious}
            technicalCadences={technicalCadences}
            results={calculationResults}
            calculationError={calculationError}
          />
        )
      default:
        return null
    }
  }

  const renderHotelStep = () => {
    switch (hotelStep) {
      case 1:
        return (
          <HotelZoneStep1 data={hotelZoneData} prefillRoomTypes={prefillRoomTypes} onUpdate={updateHotelZoneData} />
        )
      case 2:
        return <HotelZoneStep2 data={hotelZoneData} onUpdate={updateHotelZoneData} />
      case 3:
        return <HotelZoneStep3 data={hotelZoneData} onUpdate={updateHotelZoneData} />
      case 4:
        return <HotelZoneStep4 data={hotelZoneData} onUpdate={updateHotelZoneData} />
      case 5:
        return (
          <HotelZoneStep5
            handleDownloadPDF={handleExport}
            handlePrevious={handlePrevious}
            data={hotelZoneData}
            results={calculationResults}
            calculationError={calculationError}
          />
        )
      default:
        return null
    }
  }

  const renderTertiaryStep = () => {
    switch (tertiaryStep) {
      case 1:
        return (
          <CompanyInfoStep
            data={estimateData.company}
            onUpdate={(company) => updateEstimateData({ company })}
            sectors={sectorTypes}
          />
        )
      case 2:
        return (
          <BuildingStep
            buildings={estimateData.buildings}
            selectedSector={estimateData.company.businessSector}
            sectorTypes={sectorTypes}
            onAdd={addBuilding}
            onUpdate={updateBuilding}
            onDelete={deleteBuilding}
          />
        )
      case 3:
        return (
          <RoomStep
            buildings={estimateData.buildings}
            rooms={estimateData.rooms}
            selectedSector={estimateData.company.businessSector}
            sectorTypes={sectorTypes}
            onAddRoom={addRoom}
            onUpdateRoom={updateRoom}
            onDeleteRoom={deleteRoom}
          />
        )
      case 4:
        return <HourlyRateStep estimateData={estimateData} onUpdate={updateEstimateData} />
      case 5:
        return <RecapStep estimateData={estimateData} sectorTypes={sectorTypes} />
      case 6:
        return (
          <ResultsStep
            handleDownloadPDF={handleExport}
            handlePrevious={handlePrevious}
            results={calculationResults}
            estimateData={estimateData}
            sectorTypes={sectorTypes}
            calculationError={calculationError}
          />
        )
      default:
        return null
    }
  }

  const renderStep = () => {
    if (tertiaryStep === 1) {
      return renderTertiaryStep()
    }

    return (
      <div className="space-y-6">
        <ZoneSelector
          currentZone={currentZone}
          onZoneChange={handleZoneChange}
          estimateData={estimateData}
          hotelZoneData={hotelZoneData}
        />

        {currentZone === "tertiary"
          ? renderTertiaryStep()
          : currentZone === "hotel"
            ? renderHotelStep()
            : renderMultiPurposeStep()}
      </div>
    )
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setCurrentView("dashboard")
  }

  const handleLogout = () => {
    authService.logout()
    // The logout event listener will handle the rest
  }

  const handleCreateNewEstimate = async () => {
    // Reset estimate data for new estimate
    setEstimateData({
      id: Date.now(),
      company: { name: "", businessSector: "" },
      buildings: [],
      multiPurposeData: { multiPurposes: [], multiPurposeRates: [] },
      rooms: {},
    })
    setHotelZoneData({
      classification: 3,
      globalRate: 21.0,
      occupancyRate: 75,
      openingDaysPerWeek: 6,
      roomTypes: [],
      roomCounts: {},
    })
    setTertiaryStep(1)
    setHotelStep(1)
    setMultiPurposeStep(1)
    setCurrentZone("tertiary")
    setCalculationResults(null)
    setCalculationError(null)
    setSaveError(null)
    setEditMode(false)

    // Fetch sector types before allowing estimate creation
    await fetchSectorTypes()
    setCurrentView("estimate-management")
  }

  const handleEditEstimate = async (data: GetEstimateData) => {
    // Reset estimate data for new estimate
    setEstimateData(data.estimate)
    if (data.hotelZoneData) {
      setHotelZoneData(data.hotelZoneData)
    } else {
      setHotelZoneData({
        classification: 3,
        globalRate: 21.0,
        occupancyRate: 75,
        openingDaysPerWeek: 6,
        roomTypes: [],
        roomCounts: {},
      })
    }
    setTertiaryStep(1)
    setHotelStep(1)
    setMultiPurposeStep(1)
    setCurrentZone("tertiary")
    setCalculationResults(null)
    setCalculationError(null)
    setSaveError(null)
    setEditMode(true)

    await fetchSectorTypes()
    setCurrentView("estimate-management")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
  }

  const handleOpenAdminPanel = () => {
    setCurrentView("admin-panel")
  }

  if (currentView === "login") {
    return <LoginPage onLogin={handleLogin} />
  }

  if (currentView === "dashboard") {
    return (
      <Dashboard
        user={currentUser!}
        onCreateNewEstimate={handleCreateNewEstimate}
        onEditEstimate={handleEditEstimate}
        onLogout={handleLogout}
        onOpenAdminPanel={handleOpenAdminPanel}
        fetchSectorTypes={fetchSectorTypes}
        sectors={sectorTypes}
      />
    )
  }

  if (currentView === "admin-panel") {
    return <AdminPanel user={currentUser!} onBackToDashboard={handleBackToDashboard} onLogout={handleLogout} />
  }

  // Show loading state while fetching sector types
  if (sectorsLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Chargement...</h2>
                <p className="text-[#858EAD]">Récupération des informations nécessaires pour créer votre chiffrage...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show error state if sector types failed to load
  if (fatalError) {
    return (
      <FatalErrorAlert
        fatalError={fatalError}
        onRetry={fatalError.type === "PREFILL_ROOM_TYPE" ? fetchPrefillRoomType : fetchSectorTypes}
        onBackToDashboard={handleBackToDashboard}
      />
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header / Progress Bar */}
        <Header
          currentZone={currentZone}
          tertiaryStep={tertiaryStep}
          hotelStep={hotelStep}
          multiPurposeStep={multiPurposeStep}
          estimateData={estimateData}
          handleBackToDashboard={handleBackToDashboard}
        />

        {/* Save Error Alert */}
        {saveError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Erreur de sauvegarde : {saveError} - Réessayez l'action..</span>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        <PreviousNext
          currentZone={currentZone}
          hotelStep={hotelStep}
          hotelZoneData={hotelZoneData}
          tertiaryStep={tertiaryStep}
          estimateData={estimateData}
          multiPurposeStep={multiPurposeStep}
          calculationLoading={calculationLoading}
          saveLoading={saveLoading}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          handleSubmitEstimate={handleSubmitEstimate}
        />
        <Toaster />
      </div>
    </div>
  )
}
