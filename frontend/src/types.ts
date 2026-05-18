export type Role = 'STUDENT' | 'TUTOR' | 'ADMIN'

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  createdAt: string
}

export interface Tutor {
  id: string
  userId: string
  fullName: string
  subjects: string[]
  hourlyRateCents: number
  bio: string
  yearsExperience: number
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  expiresInSeconds: number
  user: User
}
