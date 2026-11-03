import { ApiError } from "@/types/login"
import { authService } from "./auth"
import { User } from "@/types/user"
import { CUSTOM_ERROR_MESSAGES } from "./utils/error-util"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!

export function handleApiError(error: any): string {
  if (error.response?.data) {
    const apiError: ApiError = error.response.data

    // Check if it's a custom error code
    if (CUSTOM_ERROR_MESSAGES[apiError.error]) {
      let message = CUSTOM_ERROR_MESSAGES[apiError.error]
      if (apiError.details) {
        message = message.replace(/%(\w+)%/g, (match, key) => {
          return apiError.details && apiError.details[key] != null
            ? apiError.details[key].toString()
            : match
        })
      }
      return message
    }

    // Return the error message from API
    return apiError.error || "Une erreur inattendue s'est produite."
  }

  if (error.status == 401 || error.status == 403) {
    return "Vous n'êtes pas autorisé à effectuer cette action. Veuillez vous connecter ou vérifier vos permissions."
  }

  // Network or other errors
  if (error.message) {
    return error.message
  }

  return "Une erreur inattendue s'est produite."
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await authService.authenticatedFetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData ? handleApiError({ response: { data: errorData }, status: response.status }) : `HTTP ${response.status}`
      return { error: errorMessage }
    }

    // Handle empty responses (like DELETE operations)
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      return { data }
    }

    if (contentType && contentType.includes("spreadsheetml.sheet")) {
      // Handle Excel file response
      const blob = await response.blob()
      return { data: blob as unknown as T }
    }

    return { data: {} as T }
  } catch (error) {
    console.error("API request error:", error)
    return { error: handleApiError(error) }
  }
}

// API functions
export async function getCurrentUser(): Promise<{ data?: User; error?: string }> {
  return apiRequest<User>("/auth/me")
}

// Export the auth service for direct use
export { authService }
