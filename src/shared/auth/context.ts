import { createContext, useContext } from 'react'

export interface LoginInput {
  email: string
  password: string
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  is_active: boolean
  is_admin: boolean
}

export interface AuthContextValue {
  admin: AdminUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isHydrating: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
