import type { StockStatus } from '../../types/inventory'

export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return 'Agotado'
  if (stock <= 5) return 'Stock bajo'
  return 'Disponible'
}

export function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value))
}

export function formatDate(value?: string) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value))
}
