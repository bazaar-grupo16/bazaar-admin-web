import { http } from './http'

// ── Tipos ────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string | null
  is_active: boolean
  is_admin: boolean
  created_at: string
}

export interface PaginatedUserResponse {
  items: User[]
  total: number
  page: number
  size: number
}

// ── Llamadas a la API ────────────────────────────────────────────

export async function getUsers(page: number = 1, size: number = 10, search?: string) {
  // Solo enviamos el parámetro 'search' si tiene texto
  const params: Record<string, string | number> = { page, size }
  if (search) {
    params.search = search
  }

  const { data } = await http.get<PaginatedUserResponse>('/admin/users', { params })
  return data
}

export async function blockUser(userId: string) {
  const { data } = await http.patch<{ message: string }>(`/admin/users/${userId}/block`)
  return data
}

export async function unblockUser(userId: string) {
  const { data } = await http.patch<{ message: string }>(`/admin/users/${userId}/unblock`)
  return data
}