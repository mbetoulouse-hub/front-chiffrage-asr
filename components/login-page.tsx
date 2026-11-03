"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, User, AlertCircle } from "lucide-react"
import { authService } from "../lib/auth"
import { getCurrentUser } from "../lib/api"
import type { User as UserType } from "../types/user"

interface LoginPageProps {
  onLogin: (user: UserType) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const refreshResult = await authService.tryToRecoverSession()

      if (refreshResult) {
        try {
          const result = await getCurrentUser()
          if (result.data) {
            onLogin(result.data)
            return
          }
        } catch (error) {
          console.error("Failed to get current user:", error)
          authService.logout()
        }
      }
      setIsCheckingAuth(false)
    }

    checkExistingAuth()
  }, [onLogin])

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setIsCheckingAuth(false)
      setError("")
      setFormData({ email: "", password: "" })
    }

    window.addEventListener("auth:logout", handleLogout)
    return () => window.removeEventListener("auth:logout", handleLogout)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const loginResult = await authService.login(formData)
      
      if (loginResult.success) {
        // Get user profile after successful login
        const userResult = await getCurrentUser()

        if (userResult.data) {
          onLogin(userResult.data)
        } else {
          setError(userResult.error || "Failed to get user profile")
        }
      } else {
        setError(loginResult.error || "La connexion a échoué")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[#858EAD]">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chiffrage ASR Nettoyage</h1>
          <p className="text-[#858EAD] mt-2">Connectez-vous pour accéder à Chiffrage ASR Nettoyage</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Se connecter</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Entrez votre email"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Entrez votre mot de passe"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Entrez vos identifiants pour accéder à l'application.</p>
        </div>
      </div>
    </div>
  )
}
