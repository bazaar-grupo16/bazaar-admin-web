export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in?: number
  refresh_expires_in?: number
}

const REFRESH_TOKEN_KEY = 'bazaar.admin.refreshToken'

let accessToken: string | null = null
const listeners = new Set<(token: string | null) => void>()

function isBrowser() {
  return typeof window !== 'undefined'
}

function readStringField(payload: Record<string, unknown>, keys: string[], fieldName: string) {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }

  throw new Error(`Invalid auth response: missing ${fieldName}`)
}

function readOptionalNumberField(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return undefined
}

export function normalizeTokenResponse(payload: Record<string, unknown>): AuthTokens {
  return {
    access_token: readStringField(payload, ['access_token', 'accessToken'], 'access_token'),
    refresh_token: readStringField(payload, ['refresh_token', 'refreshToken'], 'refresh_token'),
    token_type:
      typeof payload.token_type === 'string'
        ? payload.token_type
        : typeof payload.tokenType === 'string'
          ? payload.tokenType
          : 'bearer',
    expires_in: readOptionalNumberField(payload, ['expires_in', 'expiresIn']),
    refresh_expires_in: readOptionalNumberField(payload, [
      'refresh_expires_in',
      'refreshExpiresIn',
    ]),
  }
}

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
  listeners.forEach((listener) => listener(token))
}

export function subscribeToAccessToken(listener: (token: string | null) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getRefreshToken() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function persistAuthSession(tokens: AuthTokens) {
  setAccessToken(tokens.access_token)

  if (isBrowser()) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  }
}

export function clearAuthSession() {
  setAccessToken(null)

  if (isBrowser()) {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}
