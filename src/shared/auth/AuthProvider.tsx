import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { http, publicHttp, refreshAccessToken } from '../api/http'
import {
  clearAuthSession,
  getAccessToken,
  normalizeTokenResponse,
  persistAuthSession,
  subscribeToAccessToken,
} from './session'
import {
  AuthContext,
  type AdminUser,
  type AuthContextValue,
  type LoginInput,
  useAuth,
} from './context'

async function fetchCurrentAdmin() {
  const { data } = await http.get<AdminUser>('/admin/me')
  return data
}

async function refreshAndLoadAdmin() {
  const tokens = await refreshAccessToken()

  if (!tokens) {
    return null
  }

  return fetchCurrentAdmin()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState(() => getAccessToken())
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)

  useEffect(() => {
    return subscribeToAccessToken(setAccessTokenState)
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const currentAdmin = await refreshAndLoadAdmin()
      if (!currentAdmin) {
        clearAuthSession()
      }
      setAdmin(currentAdmin)
      return Boolean(currentAdmin)
    } catch {
      clearAuthSession()
      setAdmin(null)
      return false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function bootstrapSession() {
      try {
        const currentAdmin = await refreshAndLoadAdmin()

        if (!isMounted) {
          return
        }

        if (!currentAdmin) {
          clearAuthSession()
        }
        setAdmin(currentAdmin)
      } catch {
        clearAuthSession()
        if (isMounted) {
          setAdmin(null)
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false)
        }
      }
    }

    void bootstrapSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async ({ email, password }: LoginInput) => {
    const { data } = await publicHttp.post<Record<string, unknown>>('/admin/login', {
      email,
      password,
    })
    const tokens = normalizeTokenResponse(data)
    persistAuthSession(tokens)
    const currentAdmin = await fetchCurrentAdmin()
    setAdmin(currentAdmin)
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setAdmin(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      accessToken,
      isAuthenticated: Boolean(accessToken && admin),
      isHydrating,
      login,
      logout,
      refreshSession,
    }),
    [accessToken, admin, isHydrating, login, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isHydrating } = useAuth()
  const location = useLocation()

  if (isHydrating) {
    return <div className="auth-loading">Cargando sesión...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isHydrating } = useAuth()

  if (isHydrating) {
    return <div className="auth-loading">Cargando sesión...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}
