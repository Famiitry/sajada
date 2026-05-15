import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import type { Categoria, ProductPayload, Producto } from '../../types/inventory'

type ProductFormProps = {
  categorias: Categoria[]
  product?: Producto | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (payload: ProductPayload) => Promise<void>
}

type FormState = {
  nombre: string
  descripcion: string
  precio: string
  stock: string
  categoriaId: string
}

const initialState: FormState = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '0',
  categoriaId: ''
}

const getInitialState = (product?: Producto | null): FormState => {
  if (!product) return initialState

  return {
    nombre: product.nombre,
    descripcion: product.descripcion ?? '',
    precio: String(product.precio),
    stock: String(product.stock),
    categoriaId: String(product.categoriaId)
  }
}

export function ProductForm({
  categorias,
  product,
  loading = false,
  onCancel,
  onSubmit
}: ProductFormProps) {
  const [form, setForm] = useState<FormState>(() => getInitialState(product))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const title = useMemo(() => (product ? 'Editar producto' : 'Nuevo producto'), [product])

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    const price = Number(form.precio)
    const stock = Number(form.stock)

    if (!form.nombre.trim()) nextErrors.nombre = 'El nombre es requerido.'
    if (!form.categoriaId) nextErrors.categoriaId = 'Selecciona una categoria.'
    if (!form.precio || Number.isNaN(price) || price < 0) {
      nextErrors.precio = 'Ingresa un precio valido.'
    }
    if (form.stock === '' || Number.isNaN(stock) || stock < 0) {
      nextErrors.stock = 'Ingresa un stock valido.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return

    await onSubmit({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock),
      categoriaId: Number(form.categoriaId)
    })
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>{title}</h2>
        <p>Completa los datos requeridos para mantener el catalogo actualizado.</p>
      </div>

      <label className="field">
        <span>Nombre</span>
        <input
          value={form.nombre}
          onChange={(event) => updateField('nombre', event.target.value)}
          placeholder="Taladro percutor"
        />
        {errors.nombre && <small>{errors.nombre}</small>}
      </label>

      <label className="field">
        <span>Categoria</span>
        <select
          value={form.categoriaId}
          onChange={(event) => updateField('categoriaId', event.target.value)}
        >
          <option value="">Seleccionar categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
        {errors.categoriaId && <small>{errors.categoriaId}</small>}
      </label>

      <label className="field">
        <span>Precio</span>
        <input
          min="0"
          step="0.01"
          type="number"
          value={form.precio}
          onChange={(event) => updateField('precio', event.target.value)}
          placeholder="0.00"
        />
        {errors.precio && <small>{errors.precio}</small>}
      </label>

      <label className="field">
        <span>Stock</span>
        <input
          min="0"
          type="number"
          value={form.stock}
          onChange={(event) => updateField('stock', event.target.value)}
          placeholder="0"
        />
        {errors.stock && <small>{errors.stock}</small>}
      </label>

      <label className="field field-full">
        <span>Descripcion</span>
        <textarea
          value={form.descripcion}
          onChange={(event) => updateField('descripcion', event.target.value)}
          placeholder="Detalle breve del producto"
          rows={3}
        />
      </label>

      <div className="form-actions field-full">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar producto'}
        </Button>
      </div>
    </form>
  )
}
