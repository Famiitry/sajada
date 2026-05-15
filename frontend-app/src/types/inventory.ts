export type Categoria = {
  id: number
  nombre: string
  descripcion?: string | null
  productos?: Producto[]
  createdAt?: string
  updatedAt?: string
}

export type Producto = {
  id: number
  nombre: string
  descripcion?: string | null
  precio: string | number
  stock: number
  categoriaId: number
  categoria?: Categoria | null
  createdAt?: string
  updatedAt?: string
}

export type Pagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: Pagination
}

export type ProductFilters = {
  search?: string
  categoriaId?: string
  minPrice?: string
  maxPrice?: string
  page?: number
  limit?: number
}

export type ProductPayload = {
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  categoriaId: number
}

export type CategoryPayload = {
  nombre: string
  descripcion?: string
}

export type StockStatus = 'Disponible' | 'Stock bajo' | 'Agotado'
