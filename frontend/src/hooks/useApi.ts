import { useCallback, useEffect, useRef, useState } from 'react'
import type { AxiosRequestConfig } from 'axios'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T = unknown>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const request = useCallback(
    async (config: AxiosRequestConfig): Promise<T | null> => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setState({ data: null, loading: true, error: null })
      try {
        const { default: api } = await import('../services/api')
        const response = await api.request<T>({
          ...config,
          signal: controller.signal,
        })
        setState({ data: response.data, loading: false, error: null })
        return response.data
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setState({ data: null, loading: false, error: message })
        return null
      }
    },
    [],
  )

  const get = useCallback(
    (url: string, config?: AxiosRequestConfig) =>
      request({ ...config, method: 'GET', url }),
    [request],
  )

  const post = useCallback(
    (url: string, body?: unknown, config?: AxiosRequestConfig) =>
      request({ ...config, method: 'POST', url, data: body }),
    [request],
  )

  const put = useCallback(
    (url: string, body?: unknown, config?: AxiosRequestConfig) =>
      request({ ...config, method: 'PUT', url, data: body }),
    [request],
  )

  const del = useCallback(
    (url: string, config?: AxiosRequestConfig) =>
      request({ ...config, method: 'DELETE', url }),
    [request],
  )

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  return { ...state, request, get, post, put, del }
}
