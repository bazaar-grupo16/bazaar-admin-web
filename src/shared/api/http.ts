import axios, { type InternalAxiosRequestConfig } from 'axios'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  normalizeTokenResponse,
  persistAuthSession,
} from '../auth/session'

const baseURL = import.meta.env.VITE_API_BASE_URL
const authBaseURL = import.meta.env.VITE_AUTH_BASE_URL || baseURL

export const publicHttp = axios.create({
  baseURL,
})

export const authHttp = axios.create({
  baseURL: authBaseURL,
})

export const http = axios.create({
  baseURL,
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshPromise: Promise<ReturnType<typeof normalizeTokenResponse> | null> | null = null

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

async function requestTokenRefresh() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    clearAuthSession()
    return null
  }

  try {
    const { data } = await authHttp.post<Record<string, unknown>>('/token/refresh', {
      refresh_token: refreshToken,
    })
    const tokens = normalizeTokenResponse(data)
    persistAuthSession(tokens)
    return tokens
  } catch (error) {
    clearAuthSession()
    throw error
  }
}

function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

http.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.config || error.response?.status !== 401) {
      throw error
    }

    const originalRequest = error.config as RetryableRequestConfig

    if (originalRequest._retry) {
      clearAuthSession()
      redirectToLogin()
      throw error
    }

    originalRequest._retry = true

    try {
      const tokens = await refreshAccessToken()

      if (!tokens) {
        redirectToLogin()
        throw error
      }

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`

      return http.request(originalRequest)
    } catch (refreshError) {
      redirectToLogin()
      throw refreshError
    }
  },
)
