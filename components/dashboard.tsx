"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react"
import type { User } from "@/types/user"
import { deleteEstimate, fetchEstimate, fetchEstimates } from "@/lib/estimate-api"
import { Alert, AlertDescription } from "./ui/alert"
import type { GetEstimateData, PagedEstimate } from "@/types/estimate"
import type { SectorType } from "@/types/sector"
import { getTitleForSector } from "@/lib/utils/sector-util"
import { useDebounce } from "@/lib/utils/use-debounce"
import Image from "next/image"

const ESTIMATES_PER_PAGE = 10

interface DashboardProps {
  user: User
  onCreateNewEstimate: () => void
  onEditEstimate: (estimate: GetEstimateData) => void
  onLogout: () => void
  onOpenAdminPanel: () => void
  fetchSectorTypes: () => void
  sectors: SectorType[]
}

export default function Dashboard({
  user,
  onCreateNewEstimate,
  onEditEstimate,
  onLogout,
  onOpenAdminPanel,
  fetchSectorTypes,
  sectors,
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [estimates, setEstimates] = useState<PagedEstimate[]>([])

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (sectors.length === 0) {
      fetchSectorTypes()
    }

    loadEstimates()
  }, [currentPage, debouncedSearchTerm, statusFilter])

  const loadEstimates = async () => {
    setLoading(true)
    console.log("ccurentPage", currentPage)
    const result = await fetchEstimates(currentPage - 1, debouncedSearchTerm, statusFilter)
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setEstimates(result.data.content)
      setTotalPages(result.data.totalPages)
      setTotalElements(result.data.totalElements)
    }
    setLoading(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleDeleteEstimate = async (estimateToDelete: PagedEstimate) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce chiffrage ?`)) {
      const result = await deleteEstimate(estimateToDelete.id)

      if (result.error) {
        setError(result.error)
      } else {
        loadEstimates()
      }
    }
  }

  const handleEditEstimate = async (estimateToDelete: PagedEstimate) => {
    const result = await fetchEstimate(estimateToDelete.id)

    if (result.error) {
      setError(result.error)
    } else {
      onEditEstimate(result.data as GetEstimateData)
    }
  }

  const getStatusBadge = (status: string) => {
    const names = {
      DRAFT: "Brouillon",
      COMPLETE: "Complété",
    }

    const colors = {
      DRAFT: "hover:bg-gray-100 bg-gray-100 text-[#858EAD]",
      COMPLETE: "hover:bg-green-100 bg-green-100 text-green-800",
    }

    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {names[status as keyof typeof names]}
      </Badge>
    )
  }

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const displayEstimates = estimates

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image src="/ASR-logo.svg" alt="ASR Logo" width={60} height={60} />
            <div>
              <h1 className="text-3xl font-bold text-[#2F57A2]">Tableau de bord</h1>
              <p className="text-[#858EAD]">
                Bienvenue, {user.email} ({user.company})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.role === "ADMIN" && (
              <Button variant="outline" className="flex items-center gap-2" onClick={onOpenAdminPanel}>
                <Settings className="w-4 h-4" />
                Panneau d'administration
              </Button>
            )}
            <Button onClick={onCreateNewEstimate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer un nouveau chiffrage
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Déconnexion
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6 bg-[#2F57A2]">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#858EAD]" />
                  <Input
                    placeholder="Rechercher des chiffrages par entreprise, secteur ou créateur..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les statuts</SelectItem>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="COMPLETE">Complété</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimates Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {user.role === "ADMIN"
                  ? "Tous les chiffrages"
                  : user.role === "MANAGER"
                    ? "Chiffrage de mon équipe"
                    : "Mes chiffrages"}
              </CardTitle>
              <div className="text-sm text-[#858EAD]">
                Page {currentPage} sur {totalPages} ({totalElements} chiffrages au total)
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Chargement des chiffrages...</span>
              </div>
            ) : displayEstimates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-[#858EAD]">Aucun chiffrage trouvé.</p>
                <Button onClick={onCreateNewEstimate} className="mt-4">
                  Créer votre premier chiffrage
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#858EAD]">
                        <th className="text-left p-3">Entreprise</th>
                        <th className="text-left p-3">Secteur</th>
                        <th className="text-center p-3">Bâtiments</th>
                        <th className="text-center p-3">Pièces</th>
                        <th className="text-center p-3">Statut</th>
                        <th className="text-left p-3">Créé par</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayEstimates.map((estimate) => (
                        <tr key={estimate.id} className="border-b border-[#858EAD] hover:bg-gray-50">
                          <td className="p-3 text-[#2F57A2]">{estimate.companyName}</td>
                          <td className="p-3 text-[#858EAD]">{getTitleForSector(estimate.businessSector, sectors)}</td>
                          <td className="p-3 text-center text-[#858EAD]">{estimate.buildingCount}</td>
                          <td className="p-3 text-center text-[#858EAD]">{estimate.roomCount}</td>
                          <td className="p-3 text-center">{getStatusBadge(estimate.status)}</td>
                          <td className="p-3 text-[#858EAD]">{estimate.createdBy}</td>
                          <td className="p-3 text-[#858EAD]">{getFormattedDate(estimate.createdAt)}</td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              {(estimate.createdBy === user.email || user.role === "ADMIN") && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditEstimate(estimate)}>
                                    <Edit className="w-4 h-4 text-[#2F57A2]" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteEstimate(estimate)}>
                                    <Trash2 className="w-4 h-4 text-[#2F57A2]" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#858EAD]">Page</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <span className="text-sm text-[#858EAD]">sur {totalPages}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#858EAD]">Aller à la page:</span>
                      <Input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = Number.parseInt(e.target.value)
                          if (page >= 1 && page <= totalPages) {
                            handlePageChange(page)
                          }
                        }}
                        className="w-16 h-8 text-center"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
