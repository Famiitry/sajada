import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { categoriesService } from '../categorias/categories.service'
import { formatCurrency, formatDate, getStockStatus } from './stock'
import { ProductForm } from './ProductForm'
import { productsService } from './products.service'
import type { Categoria, ProductFilters, ProductPayload, Producto } from '../../types/inventory'

type ToastState = {
  message: string
  tone: 'success' | 'danger' | 'info'
}

const stockTone = {
  Disponible: 'success',
  'Stock bajo': 'warning',
  Agotado: 'danger'
} as const

export function ProductsPage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<ToastState>({ message: '', tone: 'info' })
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null)

  const loadData = async (nextFilters = filters) => {
    setLoading(true)
    setError('')
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsService.list(nextFilters),
        categoriesService.list({ limit: 100 })
      ])
      setProducts(productsResponse.data)
      setCategorias(categoriesResponse.data)
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'No se pudo cargar el inventario.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function syncProducts() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productsService.list(filters),
          categoriesService.list({ limit: 100 })
        ])

        if (!active) return
        setProducts(productsResponse.data)
        setCategorias(categoriesResponse.data)
        setError('')
      } catch (currentError) {
        if (!active) return
        setError(currentError instanceof Error ? currentError.message : 'No se pudo cargar el inventario.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void syncProducts()
    return () => {
      active = false
    }
  }, [filters])

  const updateFilters = (nextFilters: ProductFilters) => {
    setLoading(true)
    setFilters(nextFilters)
  }

  const lowStockCount = useMemo(
    () => products.filter((product) => product.stock > 0 && product.stock <= 5).length,
    [products]
  )

  const openCreateForm = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleSubmit = async (payload: ProductPayload) => {
    setSaving(true)
    try {
      if (editingProduct) {
        await productsService.update(editingProduct.id, payload)
        setToast({ message: 'Producto actualizado correctamente.', tone: 'success' })
      } else {
        await productsService.create(payload)
        setToast({ message: 'Producto creado correctamente.', tone: 'success' })
      }
      setShowForm(false)
      setEditingProduct(null)
      await loadData()
    } catch (currentError) {
      setToast({
        message: currentError instanceof Error ? currentError.message : 'No se pudo guardar el producto.',
        tone: 'danger'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await productsService.remove(productToDelete.id)
      setToast({ message: 'Producto eliminado.', tone: 'success' })
      setProductToDelete(null)
      await loadData()
    } catch (currentError) {
      setToast({
        message: currentError instanceof Error ? currentError.message : 'No se pudo eliminar el producto.',
        tone: 'danger'
      })
    }
  }

  return (
    <div className="page-stack">
      <Toast message={toast.message} tone={toast.tone} />

      <section className="page-header">
        <div>
          <span className="eyebrow">Catalogo</span>
          <h2>Productos</h2>
          <p>Consulta, filtra y administra el inventario de herramientas.</p>
        </div>
        <Button type="button" onClick={openCreateForm}>
          + Nuevo producto
        </Button>
      </section>

      <section className="metrics-grid compact">
        <Card>
          <span className="metric-label">Productos</span>
          <strong className="metric-value">{products.length}</strong>
        </Card>
        <Card>
          <span className="metric-label">Stock bajo</span>
          <strong className="metric-value warning">{lowStockCount}</strong>
        </Card>
        <Card>
          <span className="metric-label">Categorias</span>
          <strong className="metric-value">{categorias.length}</strong>
        </Card>
      </section>

      <Card className="toolbar-card">
        <label className="field">
          <span>Buscar</span>
          <input
            value={filters.search ?? ''}
            onChange={(event) => updateFilters({ ...filters, search: event.target.value })}
            placeholder="Nombre o descripcion"
          />
        </label>
        <label className="field">
          <span>Categoria</span>
          <select
            value={filters.categoriaId ?? ''}
            onChange={(event) => updateFilters({ ...filters, categoriaId: event.target.value })}
          >
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Precio minimo</span>
          <input
            min="0"
            type="number"
            value={filters.minPrice ?? ''}
            onChange={(event) => updateFilters({ ...filters, minPrice: event.target.value })}
            placeholder="0"
          />
        </label>
        <label className="field">
          <span>Precio maximo</span>
          <input
            min="0"
            type="number"
            value={filters.maxPrice ?? ''}
            onChange={(event) => updateFilters({ ...filters, maxPrice: event.target.value })}
            placeholder="500"
          />
        </label>
      </Card>

      <Card>
        {loading && <div className="state-block">Cargando productos...</div>}
        {!loading && error && (
          <div className="state-block danger">
            <strong>No se pudo cargar productos</strong>
            <p>{error}</p>
            <Button type="button" variant="secondary" onClick={() => void loadData()}>
              Reintentar
            </Button>
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="state-block">
            <strong>No hay productos registrados.</strong>
            <p>Crea el primer producto para empezar a controlar el inventario.</p>
            <Button type="button" onClick={openCreateForm}>
              Nuevo producto
            </Button>
          </div>
        )}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Actualizado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const status = getStockStatus(product.stock)
                    return (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.nombre}</strong>
                          <span>{product.descripcion || 'Sin descripcion'}</span>
                        </td>
                        <td>{product.categoria?.nombre ?? 'Sin categoria'}</td>
                        <td>{formatCurrency(product.precio)}</td>
                        <td>{product.stock}</td>
                        <td>
                          <Badge tone={stockTone[status]}>{status}</Badge>
                        </td>
                        <td>{formatDate(product.updatedAt)}</td>
                        <td>
                          <div className="row-actions">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setEditingProduct(product)
                                setShowForm(true)
                              }}
                            >
                              Editar
                            </Button>
                            <Button type="button" variant="danger" onClick={() => setProductToDelete(product)}>
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mobile-list">
              {products.map((product) => {
                const status = getStockStatus(product.stock)
                return (
                  <article className="mobile-card" key={product.id}>
                    <div>
                      <strong>{product.nombre}</strong>
                      <span>{product.categoria?.nombre ?? 'Sin categoria'}</span>
                    </div>
                    <Badge tone={stockTone[status]}>{status}</Badge>
                    <dl>
                      <div>
                        <dt>Precio</dt>
                        <dd>{formatCurrency(product.precio)}</dd>
                      </div>
                      <div>
                        <dt>Stock</dt>
                        <dd>{product.stock}</dd>
                      </div>
                    </dl>
                    <div className="row-actions">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setEditingProduct(product)
                          setShowForm(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button type="button" variant="danger" onClick={() => setProductToDelete(product)}>
                        Eliminar
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </Card>

      <Modal title={editingProduct ? 'Editar producto' : 'Nuevo producto'} open={showForm} onClose={() => setShowForm(false)}>
        <ProductForm
          key={editingProduct?.id ?? 'new-product'}
          categorias={categorias}
          product={editingProduct}
          loading={saving}
          onCancel={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal
        title="Eliminar producto"
        open={Boolean(productToDelete)}
        confirmLabel="Eliminar"
        danger
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      >
        <p>
          Esta accion eliminara <strong>{productToDelete?.nombre}</strong> del inventario.
        </p>
      </Modal>
    </div>
  )
}
