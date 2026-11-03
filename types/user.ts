export interface User {
  id: number
  email: string
  company: string
  role: "USER" | "MANAGER" | "ADMIN"
  manager?: User
  createdAt: string
  isActive: boolean
}

export interface CreateUserData {
  email: string
  password: string
  company: string
  role: "USER" | "MANAGER" | "ADMIN"
  managerId?: number
}

export interface UpdateUserData {
  email: string // email of the user to update (cannot be changed)
  password?: string
  company: string
  role: "USER" | "MANAGER" | "ADMIN"
  managerId?: number
}

export interface UsersListResponse {
  content: User[]
  totalPages: number
  totalElements: number
  numberOfElements: number
  size: number
  number: number
  empty: boolean
  first: boolean
  last: boolean
}
