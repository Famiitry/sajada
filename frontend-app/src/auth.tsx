/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, type LoginPayload, type RegisterPayload, type User } from './api'

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<void>
}

const TOKEN_KEY = 'sajada_token'
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const persistSession = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshSession = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      setLoading(false)
      return
    }

    try {
      const response = await authApi.me(storedToken)
      setToken(storedToken)
      setUser(response.user)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    queueMicrotask(() => {
      void refreshSession()
    })
  }, [refreshSession])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload)
      persistSession(response.token, response.user)
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authApi.register(payload)
      persistSession(response.token, response.user)
    },
    [persistSession],
  )

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshSession }),
    [user, token, loading, login, register, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
