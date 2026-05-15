import { useEffect, useMemo, useState } from 'react'
import type { NavView } from '../../components/layout/AppShell'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { categoriesService } from '../categorias/categories.service'
import { formatCurrency, getStockStatus } from '../productos/stock'
import { productsService } from '../productos/products.service'
import type { Categoria, Producto } from '../../types/inventory'

type DashboardPageProps = {
  onNavigate: (view: NavView) => void
}

const stockTone = {
  Disponible: 'success',
  'Stock bajo': 'warning',
  Agotado: 'danger'
} as const

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [products, setProducts] = useState<Producto[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsService.list({ limit: 100 }),
        categoriesService.list({ limit: 100 })
      ])
      setProducts(productsResponse.data)
      setCategories(categoriesResponse.data)
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'No se pudo cargar el dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function syncDashboard() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productsService.list({ limit: 100 }),
          categoriesService.list({ limit: 100 })
        ])

        if (!active) return
        setProducts(productsResponse.data)
        setCategories(categoriesResponse.data)
        setError('')
      } catch (currentError) {
        if (!active) return
        setError(currentError instanceof Error ? currentError.message : 'No se pudo cargar el dashboard.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void syncDashboard()
    return () => {
      active = false
    }
  }, [])

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock > 0 && product.stock <= 5),
    [products]
  )
  const outOfStockProducts = useMemo(() => products.filter((product) => product.stock === 0), [products])
  const lowestStockProducts = useMemo(
    () => [...products].sort((a, b) => a.stock - b.stock).slice(0, 6),
    [products]
  )
  const inventoryValue = useMemo(
    () => products.reduce((total, product) => total + Number(product.precio) * product.stock, 0),
    [products]
  )

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="eyebrow">Resumen</span>
          <h2>Dashboard de inventario</h2>
          <p>Vista rapida del catalogo, niveles de stock y valor aproximado.</p>
        </div>
        <div className="header-actions">
          <Button type="button" variant="secondary" onClick={() => onNavigate('categorias')}>
            Categorias
          </Button>
          <Button type="button" onClick={() => onNavigate('productos')}>
            Productos
          </Button>
        </div>
      </section>

      {loading && <div className="state-block">Cargando dashboard...</div>}
      {!loading && error && (
        <Card>
          <div className="state-block danger">
            <strong>No se pudo cargar el dashboard</strong>
            <p>{error}</p>
            <Button type="button" variant="secondary" onClick={() => void loadDashboard()}>
              Reintentar
            </Button>
          </div>
        </Card>
      )}
      {!loading && !error && (
        <>
          <section className="metrics-grid">
            <Card>
              <span className="metric-label">Total productos</span>
              <strong className="metric-value">{products.length}</strong>
              <small>Items registrados</small>
            </Card>
            <Card>
              <span className="metric-label">Stock bajo</span>
              <strong className="metric-value warning">{lowStockProducts.length}</strong>
              <small>Requieren reposicion</small>
            </Card>
            <Card>
              <span className="metric-label">Agotados</span>
              <strong className="metric-value danger">{outOfStockProducts.length}</strong>
              <small>Sin unidades</small>
            </Card>
            <Card>
              <span className="metric-label">Categorias</span>
              <strong className="metric-value">{categories.length}</strong>
              <small>Grupos activos</small>
            </Card>
          </section>

          <section className="dashboard-grid">
            <Card>
              <div className="card-title-row">
                <div>
                  <h3>Productos con menor stock</h3>
                  <p>Prioridad operativa para reabastecimiento.</p>
                </div>
                <Badge tone="info">{formatCurrency(inventoryValue)}</Badge>
              </div>

              {lowestStockProducts.length === 0 ? (
                <div className="state-block">No hay productos para mostrar.</div>
              ) : (
                <div className="stock-list">
                  {lowestStockProducts.map((product) => {
                    const status = getStockStatus(product.stock)
                    return (
                      <article key={product.id} className="stock-item">
                        <div>
                          <strong>{product.nombre}</strong>
                          <span>{product.categoria?.nombre ?? 'Sin categoria'}</span>
                        </div>
                        <div className="stock-meta">
                          <strong>{product.stock}</strong>
                          <Badge tone={stockTone[status]}>{status}</Badge>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card>
              <div className="card-title-row">
                <div>
                  <h3>Accesos rapidos</h3>
                  <p>Gestiona los puntos principales del modulo Dev 2.</p>
                </div>
              </div>
              <div className="quick-actions">
                <button type="button" onClick={() => onNavigate('productos')}>
                  <strong>Gestion de productos</strong>
                  <span>Crear, editar, filtrar y eliminar productos.</span>
                </button>
                <button type="button" onClick={() => onNavigate('categorias')}>
                  <strong>Categorias</strong>
                  <span>Organizar el catalogo y revisar asociaciones.</span>
                </button>
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
