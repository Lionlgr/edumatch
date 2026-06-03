import { useEffect, useState } from 'react'
import { AuthResponse, User } from './types'

const TOKEN_KEY = 'edumatch.token'
const USER_KEY = 'edumatch.user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as User } catch { return null }
}

export function setAuth(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.accessToken)
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
  window.dispatchEvent(new Event('auth-changed'))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('auth-changed'))
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(getUser())
  useEffect(() => {
    const handler = () => setUser(getUser())
    window.addEventListener('auth-changed', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('auth-changed', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])
  return user
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(path, { ...init, headers })

  if (!res.ok) {
    // Read the body exactly once as text, then try to parse it as JSON.
    // (Calling res.json() then res.text() locks the stream -> "Body is
    // disturbed or locked".)
    const raw = await res.text().catch(() => '')
    let message = `HTTP ${res.status}`
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { message?: unknown; error?: unknown }
        message = String(parsed.message ?? parsed.error ?? raw)
      } catch {
        message = raw
      }
    }
    // A 401/403 with a token in hand means the session expired or is invalid:
    // wipe it so the UI can redirect to login cleanly.
    if ((res.status === 401 || res.status === 403) && token) {
      clearAuth()
      message = 'Session expirée, reconnecte-toi.'
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
