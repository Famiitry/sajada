import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import type { Categoria, CategoryPayload } from '../../types/inventory'
import { categoriesService } from './categories.service'

type CategoryFormState = {
  nombre: string
  descripcion: string
}

const emptyForm: CategoryFormState = {
  nombre: '',
  descripcion: ''
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Categoria[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', tone: 'info' as 'success' | 'danger' | 'info' })
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Categoria | null>(null)
  const [form, setForm] = useState<CategoryFormState>(emptyForm)
  const [formError, setFormError] = useState('')

  const loadCategories = async (nextSearch = search) => {
    setLoading(true)
    setError('')
    try {
      const response = await categoriesService.list({ search: nextSearch, limit: 50 })
      setCategories(response.data)
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'No se pudo cargar categorias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function syncCategories() {
      try {
        const response = await categoriesService.list({ search, limit: 50 })

        if (!active) return
        setCategories(response.data)
        setError('')
      } catch (currentError) {
        if (!active) return
        setError(currentError instanceof Error ? currentError.message : 'No se pudo cargar categorias.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void syncCategories()
    return () => {
      active = false
    }
  }, [search])

  const updateSearch = (value: string) => {
    setLoading(true)
    setSearch(value)
  }

  const openCreateForm = () => {
    setEditingCategory(null)
    setForm(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = (category: Categoria) => {
    setEditingCategory(category)
    setForm({
      nombre: category.nombre,
      descripcion: category.descripcion ?? ''
    })
    setFormError('')
    setShowForm(true)
  }

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.nombre.trim()) {
      setFormError('El nombre es requerido.')
      return
    }

    const payload: CategoryPayload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim()
    }

    setSaving(true)
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, payload)
        setToast({ message: 'Categoria actualizada.', tone: 'success' })
      } else {
        await categoriesService.create(payload)
        setToast({ message: 'Categoria creada.', tone: 'success' })
      }
      setShowForm(false)
      await loadCategories()
    } catch (currentError) {
      setToast({
        message: currentError instanceof Error ? currentError.message : 'No se pudo guardar la categoria.',
        tone: 'danger'
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      await categoriesService.remove(categoryToDelete.id)
      setToast({ message: 'Categoria eliminada.', tone: 'success' })
      setCategoryToDelete(null)
      await loadCategories()
    } catch (currentError) {
      setToast({
        message:
          currentError instanceof Error
            ? currentError.message
            : 'No se pudo eliminar la categoria. Verifica que no tenga productos asociados.',
        tone: 'danger'
      })
    }
  }

  return (
    <div className="page-stack">
      <Toast message={toast.message} tone={toast.tone} />

      <section className="page-header">
        <div>
          <span className="eyebrow">Organizacion</span>
          <h2>Categorias</h2>
          <p>Agrupa productos para mejorar busquedas, reportes y filtros.</p>
        </div>
        <Button type="button" onClick={openCreateForm}>
          + Nueva categoria
        </Button>
      </section>

      <Card className="toolbar-card slim">
        <label className="field">
          <span>Buscar categoria</span>
          <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Nombre" />
        </label>
      </Card>

      <Card>
        {loading && <div className="state-block">Cargando categorias...</div>}
        {!loading && error && (
          <div className="state-block danger">
            <strong>No se pudo cargar categorias</strong>
            <p>{error}</p>
            <Button type="button" variant="secondary" onClick={() => void loadCategories()}>
              Reintentar
            </Button>
          </div>
        )}
        {!loading && !error && categories.length === 0 && (
          <div className="state-block">
            <strong>No hay categorias registradas.</strong>
            <p>Crea una categoria para organizar el catalogo de productos.</p>
            <Button type="button" onClick={openCreateForm}>
              Nueva categoria
            </Button>
          </div>
        )}
        {!loading && !error && categories.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripcion</th>
                  <th>Productos</th>
                  <th>Actualizado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.nombre}</strong>
                    </td>
                    <td>{category.descripcion || 'Sin descripcion'}</td>
                    <td>{category.productos?.length ?? 0}</td>
                    <td>{category.updatedAt ? new Date(category.updatedAt).toLocaleDateString('es-EC') : 'Sin fecha'}</td>
                    <td>
                      <div className="row-actions">
                        <Button type="button" variant="ghost" onClick={() => openEditForm(category)}>
                          Editar
                        </Button>
                        <Button type="button" variant="danger" onClick={() => setCategoryToDelete(category)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal title={editingCategory ? 'Editar categoria' : 'Nueva categoria'} open={showForm} onClose={() => setShowForm(false)}>
        <form className="form-grid single" onSubmit={submitCategory}>
          <label className="field field-full">
            <span>Nombre</span>
            <input
              value={form.nombre}
              onChange={(event) => {
                setForm((current) => ({ ...current, nombre: event.target.value }))
                setFormError('')
              }}
              placeholder="Herramientas electricas"
            />
            {formError && <small>{formError}</small>}
          </label>
          <label className="field field-full">
            <span>Descripcion</span>
            <textarea
              value={form.descripcion}
              onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
              placeholder="Productos para perforacion, corte y ajuste"
              rows={3}
            />
          </label>
          <div className="form-actions field-full">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar categoria'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Eliminar categoria"
        open={Boolean(categoryToDelete)}
        confirmLabel="Eliminar"
        danger
        onClose={() => setCategoryToDelete(null)}
        onConfirm={deleteCategory}
      >
        <p>
          Esta accion eliminara <strong>{categoryToDelete?.nombre}</strong>. Si tiene productos asociados, la API
          bloqueara la eliminacion.
        </p>
      </Modal>
    </div>
  )
}
