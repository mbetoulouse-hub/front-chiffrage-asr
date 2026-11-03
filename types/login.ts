export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresAt: number
}

export interface ApiError {
  timestamp?: string | number
  status: number
  error: string
  path?: string
  details?: Record<string, any>
}
