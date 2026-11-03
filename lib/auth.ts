import { LoginRequest, LoginResponse } from "@/types/login"
import { API_BASE_URL, handleApiError } from "./api";

class AuthService {
  private accessToken: string | null = null
  private tokenExpiration: number | null = null
  private refreshTimer: NodeJS.Timeout | null = null

  constructor() {
    // only story in runtime
  }

  async login(credentials: LoginRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for refresh token
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        return {
          success: false,
          error: handleApiError({ response: { data: errorData, status: response.status } }),
        }
      }

      const data: LoginResponse = await response.json()
      this.setTokens(data.token, data.expiresAt)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  async tryToRecoverSession(): Promise<boolean> {
    return await this.refreshToken(false)
  }

  async refreshToken(useLogout: boolean = true): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Include cookies for refresh token
      })

      if (!response.ok) {
        if(useLogout) this.logout()
        return false
      }

      const data: LoginResponse = await response.json()
      this.setTokens(data.token, data.expiresAt)
      return true
    } catch (error) {
      console.error("Token refresh error:", error)
      if(useLogout) this.logout()
      return false
    }
  }

  private setTokens(accessToken: string, expiresAt: number) {
    this.accessToken = accessToken
    this.tokenExpiration = expiresAt
    this.scheduleTokenRefresh()
  }

  private scheduleTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    if (!this.tokenExpiration) return

    const now = Date.now()
    const timeUntilRefresh = this.tokenExpiration - now - 5 * 60 * 1000 // Refresh 5 minutes before expiration

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken()
      }, timeUntilRefresh)
    } else {
      // Token is already expired or about to expire, refresh immediately
      this.refreshToken()
    }
  }

  async logout() {
    try {
      this.accessToken = null
      this.tokenExpiration = null

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Include cookies for refresh token
      })

      if (!response.ok) {
        console.error("Logout error, response invalid..")
      } else {
        if (typeof window !== "undefined") {
          console.log("User logged out successfully")
          window.dispatchEvent(new CustomEvent("auth:logout"))
        }
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  isAuthenticated(): boolean {
    if (!this.accessToken || !this.tokenExpiration) return false
    return Date.now() < this.tokenExpiration
  }

  getToken(): string | null {
    return this.accessToken
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isAuthenticated()) {
      const refreshed = await this.refreshToken()
      if (!refreshed) {
        throw new Error("Authentication required")
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
      credentials: "include",
    })

    // If we get a 401, try to refresh the token once
    if (response.status === 401 && this.accessToken) {
      const refreshed = await this.refreshToken()
      if (refreshed) {
        // Retry the request with the new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.accessToken}`,
          },
          credentials: "include",
        })
      }
    }

    return response
  }

}

export const authService = new AuthService()
