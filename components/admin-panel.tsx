"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Crown,
  Shield,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { fetchUsers, createUser, updateUser, deleteUser, fetchManagers } from "../lib/admin-api"
import type { User, CreateUserData, UpdateUserData } from "@/types/user"
import { useDebounce } from "@/lib/utils/use-debounce"
import Image from "next/image"

interface AdminPanelProps {
  user: User
  onBackToDashboard: () => void
  onLogout: () => void
}

export default function AdminPanel({ user, onBackToDashboard, onLogout }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([])
  const [availableManagers, setAvailableManagers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    company: "",
    role: "USER",
    managerId: undefined,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Load users and managers on component mount and page change
  useEffect(() => {
    loadManagers()
  }, [])

  useEffect(() => {
    loadUsers()
  }, [currentPage, debouncedSearchTerm, roleFilter])

  const loadUsers = async () => {
    setLoading(true)
    const result = await fetchUsers(currentPage - 1, debouncedSearchTerm, roleFilter)
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setUsers(result.data.content)
      setTotalPages(result.data.totalPages)
      setTotalElements(result.data.totalElements)
    }
    setLoading(false)
  }

  const loadManagers = async () => {
    const result = await fetchManagers()
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setAvailableManagers(result.data)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role)
    setCurrentPage(1)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "MANAGER":
        return <Users className="w-4 h-4 text-blue-600" />
      case "USER":
        return <Shield className="w-4 h-4 text-green-600" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: "bg-red-100 text-red-800",
      MANAGER: "bg-blue-100 text-blue-800",
      USER: "bg-green-100 text-green-800",
    }

    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
      </Badge>
    )
  }

  const getManagerName = (manager?: User) => {
    if (!manager) return "N/A"
    return manager.email
  }

  const handleCreateUser = async () => {
    setError("")
    setSuccess("")
    setActionLoading(true)

    // Basic validation
    if (!formData.email || !formData.password || !formData.company) {
      setError("Veuillez remplir tous les champs obligatoires")
      setActionLoading(false)
      return
    }

    // Validate manager for USER role
    if (formData.role === "USER" && !formData.managerId) {
      setError("Veuillez sélectionner un responsable pour le rôle Utilisateur")
      setActionLoading(false)
      return
    }

    const result = await createUser(formData)
    setActionLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Utilisateur créé avec succès!")
      setFormData({
        email: "",
        password: "",
        company: "",
        role: "USER",
        managerId: undefined,
      })
      loadUsers() // Reload users list
      loadManagers()
      setTimeout(() => {
        setIsCreateDialogOpen(false)
        setSuccess("")
      }, 1000)
    }
  }

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit)
    setFormData({
      email: userToEdit.email,
      password: "", // Don't pre-fill password
      company: userToEdit.company,
      role: userToEdit.role,
      managerId: userToEdit.manager?.id,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    setError("")
    setSuccess("")
    setActionLoading(true)

    if (!editingUser) {
      setActionLoading(false)
      return
    }

    // Basic validation
    if (!formData.email || !formData.company) {
      setError("Veuillez remplir tous les champs obligatoires")
      setActionLoading(false)
      return
    }

    // Validate manager for USER role
    if (formData.role === "USER" && !formData.managerId) {
      setError("Veuillez sélectionner un responsable pour le rôle Utilisateur")
      setActionLoading(false)
      return
    }

    const updateData: UpdateUserData = {
      email: editingUser.email, // Email cannot be changed
      company: formData.company,
      role: formData.role,
      managerId: formData.role === "USER" ? formData.managerId : undefined,
    }

    // Only include password if it's provided
    if (formData.password) {
      updateData.password = formData.password
    }

    const result = await updateUser(updateData)
    setActionLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Utilisateur mis à jour avec succès!")
      loadUsers() // Reload users list
      loadManagers()
      setTimeout(() => {
        setIsEditDialogOpen(false)
        setEditingUser(null)
        setSuccess("")
      }, 2000)
    }
  }

  const handleDeleteUser = async (userToDelete: User) => {
    if (userToDelete.id === user.id) {
      setError("Vous ne pouvez pas supprimer votre propre compte")
      return
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.email} ?`)) {
      setActionLoading(true)
      const result = await deleteUser(userToDelete.email)
      setActionLoading(false)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Utilisateur supprimé avec succès!")
        loadUsers() // Reload users list
        loadManagers()
        setTimeout(() => setSuccess(""), 3000)
      }
    }
  }

  const displayUsers = users

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image src="/ASR-logo.svg" alt="ASR Logo" width={60} height={60} />
            <div>
              <h1 className="text-3xl font-bold text-[#2F57A2]">Panneau d'administration</h1>
              <p className="text-[#858EAD]">Gérer les utilisateurs et les paramètres du système</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBackToDashboard} className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Retour au tableau de bord
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Global Error/Success Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#858EAD]" />
                    <Input
                      placeholder="Rechercher des utilisateurs par email ou entreprise..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={handleRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les rôles</SelectItem>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                    <SelectItem value="MANAGER">Responsable</SelectItem>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Créer un utilisateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Entrez l'email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Entrez le mot de passe"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Entreprise *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Entrez le nom de l'entreprise"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">Utilisateur</SelectItem>
                          <SelectItem value="MANAGER">Responsable</SelectItem>
                          <SelectItem value="ADMIN">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.role === "USER" && (
                      <div className="space-y-2">
                        <Label htmlFor="manager">Responsable *</Label>
                        <Select
                          value={formData.managerId ? String(formData.managerId) : ""}
                          onValueChange={(value) =>
                            setFormData({ ...formData, managerId: value ? Number.parseInt(value, 10) : undefined })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un responsable" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableManagers.map((manager) => (
                              <SelectItem key={manager.id} value={String(manager.id)}>
                                {manager.email} ({manager.company})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleCreateUser} className="flex-1" disabled={actionLoading}>
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Créer un utilisateur
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <div className="text-sm text-[#858EAD]">
                Page {currentPage} sur {totalPages} ({totalElements} utilisateurs au total)
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Chargement des utilisateurs...</span>
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-[#858EAD]">Aucun utilisateur trouvé correspondant à vos critères.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#858EAD]">
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Entreprise</th>
                        <th className="text-center p-3">Rôle</th>
                        <th className="text-left p-3">Responsable</th>
                        <th className="text-center p-3">Statut</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayUsers.map((u) => (
                        <tr key={u.id} className="border-b border-[#858EAD] hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(u.role)}
                              <span className="text-[#2F57A2]">{u.email}</span>
                            </div>
                          </td>
                          <td className="p-3 text-[#858EAD]">{u.company}</td>
                          <td className="p-3 text-center">{getRoleBadge(u.role)}</td>
                          <td className="p-3 text-[#858EAD]">{getManagerName(u.manager)}</td>
                          <td className="p-3 text-center">
                            {u.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Actif</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Inactif</Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditUser(u)}>
                                <Edit className="w-4 h-4 text-[#2F57A2]" />
                              </Button>
                              {u.id !== user.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={actionLoading}
                                >
                                  <Trash2 className="w-4 h-4 text-[#2F57A2]" />
                                </Button>
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
                          } else if (currentPage <= 2) {
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
                        value={currentPage + 1}
                        onChange={(e) => {
                          const page = Number.parseInt(e.target.value) - 1
                          if (page >= 0 && page < totalPages) {
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

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email (ne peut pas être modifié)</Label>
                <Input id="edit-email" type="email" value={formData.email} disabled className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Mot de passe (laisser vide pour conserver l'actuel)</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Entrez un nouveau mot de passe"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Entreprise *</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Entrez le nom de l'entreprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rôle *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                    <SelectItem value="MANAGER">Responsable</SelectItem>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.role === "USER" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-manager">Responsable *</Label>
                  <Select
                    value={formData.managerId ? String(formData.managerId) : ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, managerId: value ? Number.parseInt(value, 10) : undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableManagers.map((manager) => (
                        <SelectItem key={manager.id} value={String(manager.id)}>
                          {manager.email} ({manager.company})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button onClick={handleUpdateUser} className="flex-1" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Modifier l'utilisateur
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
