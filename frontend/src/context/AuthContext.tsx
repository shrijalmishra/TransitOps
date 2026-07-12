import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import api, { type AuthResponse } from '../services/api'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string, remember: boolean) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role?: string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'transitops_token'
const USER_KEY = 'transitops_user'

function persist(token: string, user: User, remember: boolean) {
  const tokenStore = remember ? localStorage : sessionStorage
  const userStore = remember ? localStorage : sessionStorage
  tokenStore.setItem(TOKEN_KEY, token)
  userStore.setItem(USER_KEY, JSON.stringify(user))
  if (!remember) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken =
      localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
    const storedUser =
      localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser) as User)
      } catch {
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, remember: boolean) => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    })
    setToken(data.token)
    setUser(data.user)
    persist(data.token, data.user, remember)
  }

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    setToken(data.token)
    setUser(data.user)
    persist(data.token, data.user, true)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  }

  const updateUser = (next: User) => {
    setUser(next)
    if (localStorage.getItem(USER_KEY)) {
      localStorage.setItem(USER_KEY, JSON.stringify(next))
    }
    if (sessionStorage.getItem(USER_KEY)) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(next))
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
