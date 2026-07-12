import axios, {
  AxiosInstance,
  AxiosError,
  isAxiosError,
} from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

function getAuthToken(): string | null {
  return (
    localStorage.getItem('transitops_token') ??
    sessionStorage.getItem('transitops_token')
  )
}

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('transitops_token')
      localStorage.removeItem('transitops_user')
      sessionStorage.removeItem('transitops_token')
      sessionStorage.removeItem('transitops_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; message?: string }
      | undefined
    if (data) {
      if (typeof data === 'string') return data
      if (data.error) return data.error
      if (data.message) return data.message
    }
    if (error.message && error.message !== 'Network Error') {
      return error.message
    }
    return 'Request failed. Please check your connection.'
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

export default api
