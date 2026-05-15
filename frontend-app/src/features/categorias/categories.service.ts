import { apiFetch, toQueryString } from '../../services/api'
import type { Categoria, CategoryPayload, PaginatedResponse } from '../../types/inventory'

export const categoriesService = {
  list(params: { search?: string; page?: number; limit?: number } = {}) {
    return apiFetch<PaginatedResponse<Categoria>>(
      `/categorias${toQueryString({
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search
      })}`
    )
  },
  create(payload: CategoryPayload) {
    return apiFetch<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  update(id: number, payload: CategoryPayload) {
    return apiFetch<Categoria>(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },
  remove(id: number) {
    return apiFetch<void>(`/categorias/${id}`, {
      method: 'DELETE'
    })
  }
}
