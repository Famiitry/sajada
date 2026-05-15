export type Role = 'admin' | 'vendedor' | 'user'

export type Cliente = {
  id: number
  identificacion: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
}

export type User = {
  id: number
  username: string
  rol: Role
  clienteId?: number | null
  cliente?: Cliente
}

export type AuthResponse = {
  message: string
  token: string
  user: User
}

export type RegisterPayload = {
  username: string
  password: string
  identificacion?: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
}

export type LoginPayload = {
  username: string
  password: string
}

export type ClientesResponse = {
  data: Cliente[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const rawApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl

type RequestOptions = RequestInit & {
  token?: string | null
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

export async function apiRequest<T>(
  path: string,
  { token, headers, ...options }: RequestOptions = {},
) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? 'No se pudo completar la solicitud',
      response.status,
      payload?.errors,
    )
  }

  return payload as T
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: RegisterPayload) =>
    apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: (token: string) =>
    apiRequest<{ user: User }>('/api/auth/me', {
      token,
    }),
}

export const clientesApi = {
  list: (token: string, search = '') => {
    const params = new URLSearchParams({ page: '1', limit: '50' })
    if (search.trim()) params.set('search', search.trim())

    return apiRequest<ClientesResponse>(`/api/clientes?${params}`, { token })
  },
  create: (token: string, cliente: Omit<Cliente, 'id'>) =>
    apiRequest<Cliente>('/api/clientes', {
      method: 'POST',
      token,
      body: JSON.stringify(cliente),
    }),
  update: (token: string, id: number, cliente: Partial<Omit<Cliente, 'id'>>) =>
    apiRequest<Cliente>(`/api/clientes/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(cliente),
    }),
  remove: (token: string, id: number) =>
    apiRequest<void>(`/api/clientes/${id}`, {
      method: 'DELETE',
      token,
    }),
}
