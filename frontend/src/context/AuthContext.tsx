import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api, { getErrorMessage } from '../services/api'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string, remember: boolean) => Promise<void>
  register: (payload: { name: string; email: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken =
      localStorage.getItem('transitops_token') ||
      sessionStorage.getItem('transitops_token')

    if (storedToken) {
      setToken(storedToken)

      api
        .get('/auth/me')
        .then((response) => {
          setUser(response.data)
        })
        .catch(() => {
          localStorage.removeItem('transitops_token')
          sessionStorage.removeItem('transitops_token')
          setToken(null)
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email: string, password: string, remember: boolean) {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password
    })

    const { token: authToken, user: authUser } = response.data
    setToken(authToken)
    setUser(authUser)

    if (remember) {
      localStorage.setItem('transitops_token', authToken)
    } else {
      sessionStorage.setItem('transitops_token', authToken)
    }
  }

  async function register(payload: { name: string; email: string; password: string }) {
    const response = await api.post<AuthResponse>('/auth/register', payload)

    const { token: authToken, user: authUser } = response.data
    setToken(authToken)
    setUser(authUser)

    localStorage.setItem('transitops_token', authToken)
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('transitops_token')
    sessionStorage.removeItem('transitops_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
