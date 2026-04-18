import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from './api'
import type { AuthUser } from './types'

type LoginPayload = { email: string; password: string }

type RegisterPayload = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      async login(payload) {
        const response = await loginRequest(payload)
        setUser(response.data)
      },
      async register(payload) {
        const response = await registerRequest(payload)
        setUser(response.data)
      },
      async logout() {
        await logoutRequest()
        setUser(null)
      },
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
