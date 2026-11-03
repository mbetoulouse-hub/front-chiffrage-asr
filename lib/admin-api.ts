import { UsersListResponse, CreateUserData, UpdateUserData, User } from "@/types/user"
import { apiRequest } from "./api"

// Admin API functions
export async function fetchUsers(page = 0, input: string, role: string): Promise<{ data?: UsersListResponse; error?: string }> {
  return apiRequest<UsersListResponse>(`/profile/all?page=${page}&input=${encodeURIComponent(input)}&role=${role}`)
}

export async function fetchManagers(): Promise<{ data?: User[]; error?: string }> {
  return apiRequest<User[]>(`/profile/all-managers`)
}

export async function createUser(userData: CreateUserData): Promise<{ data?: any; error?: string }> {
  return apiRequest("/profile/create", {
    method: "POST",
    body: JSON.stringify(userData),
  })
}

export async function updateUser(userData: UpdateUserData): Promise<{ data?: any; error?: string }> {
  return apiRequest("/profile/update", {
    method: "PUT",
    body: JSON.stringify(userData),
  })
}

export async function deleteUser(email: string): Promise<{ data?: any; error?: string }> {
  return apiRequest(`/profile/delete?email=${encodeURIComponent(email)}`, {
    method: "DELETE",
  })
}
