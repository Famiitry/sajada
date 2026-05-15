import { apiFetch, toQueryString } from '../../services/api'
import type {
  PaginatedResponse,
  ProductFilters,
  ProductPayload,
  Producto
} from '../../types/inventory'

export const productsService = {
  list(filters: ProductFilters = {}) {
    return apiFetch<PaginatedResponse<Producto>>(
      `/productos${toQueryString({
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        search: filters.search,
        categoriaId: filters.categoriaId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice
      })}`
    )
  },
  create(payload: ProductPayload) {
    return apiFetch<Producto>('/productos', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  update(id: number, payload: ProductPayload) {
    return apiFetch<Producto>(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },
  remove(id: number) {
    return apiFetch<void>(`/productos/${id}`, {
      method: 'DELETE'
    })
  }
}
