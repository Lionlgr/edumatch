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

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(path, { ...init, headers })
  if (!res.ok) {
    let body: unknown
    try { body = await res.json() } catch { body = await res.text() }
    const msg = typeof body === 'object' && body && 'message' in body
      ? String((body as { message: unknown }).message)
      : `HTTP ${res.status}`
    throw new Error(msg)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
