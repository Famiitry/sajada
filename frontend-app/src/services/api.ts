const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

type RequestOptions = RequestInit & {
  auth?: boolean
}

type ApiErrorBody = {
  message?: string
  errors?: unknown
}

export class ApiError extends Error {
  status: number
  errors?: unknown

  constructor(message: string, status: number, errors?: unknown) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

const getAuthToken = () =>
  localStorage.getItem('sajada_token') ??
  localStorage.getItem('token') ??
  localStorage.getItem('authToken') ??
  localStorage.getItem('accessToken')

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json')
    ? ((await response.json()) as ApiErrorBody | T)
    : undefined

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | undefined
    throw new ApiError(
      errorBody?.message ?? 'No se pudo completar la solicitud',
      response.status,
      errorBody?.errors
    )
  }

  return body as T
}

export function toQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}
