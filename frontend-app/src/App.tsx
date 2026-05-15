import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { ApiError, clientesApi, type Cliente, type RegisterPayload } from './api'
import { AuthProvider, useAuth } from './auth'
import { CategoriesPage } from './features/categorias/CategoriesPage'
import { DashboardPage as InventoryDashboardPage } from './features/dashboard/DashboardPage'
import { ProductsPage } from './features/productos/ProductsPage'
import './App.css'

const emptyCliente = {
  identificacion: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
}

type ClienteForm = typeof emptyCliente
type RegisterForm = RegisterPayload & ClienteForm

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Ocurrio un error inesperado'
}

function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.rol)) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

function PublicRoute() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

function LoadingScreen() {
  return (
    <main className="screen center-screen">
      <div className="loader-card">Cargando sesion...</div>
    </main>
  )
}

function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const canManageOperationalData = user?.rol === 'admin' || user?.rol === 'vendedor'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-main">
          <div className="brand-lockup">
            <strong>Sajada</strong>
            <span>Panel de Control</span>
          </div>

          <nav className="nav-list" aria-label="Principal">
            <NavLink to="/dashboard">
              <span aria-hidden="true">D</span>
              Dashboard
            </NavLink>
            {canManageOperationalData && (
              <NavLink to="/inventario">
                <span aria-hidden="true">I</span>
                Inventario
              </NavLink>
            )}
            {canManageOperationalData && (
              <NavLink to="/productos">
                <span aria-hidden="true">P</span>
                Productos
              </NavLink>
            )}
            {canManageOperationalData && (
              <NavLink to="/clientes">
                <span aria-hidden="true">C</span>
                Clientes
              </NavLink>
            )}
            {canManageOperationalData && (
              <NavLink to="/categorias">
                <span aria-hidden="true">G</span>
                Categorias
              </NavLink>
            )}
          </nav>
        </div>

        <div className="session-box">
          <div className="user-avatar">{user?.username?.slice(0, 2).toUpperCase()}</div>
          <div>
            <span>{user?.username}</span>
            <strong>{user?.rol}</strong>
          </div>
          <button type="button" className="ghost-button" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="topbar-copy">
            <span className="eyebrow">Panel de Control</span>
          </div>
          <div className="topbar-actions">
            <label className="search-shell">
              <span className="sr-only">Buscar</span>
              <input placeholder="Buscar productos..." />
            </label>
            <div className="status-dot" aria-hidden="true" />
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </section>
    </div>
  )
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthScreen title="Ingresar" subtitle="Accede al panel de gestion">
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Usuario
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            required
          />
        </label>
        <label>
          Contrasena
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        {error && <p className="alert">{error}</p>}
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p className="auth-link">
        No tienes cuenta? <Link to="/register">Crear cuenta</Link>
      </p>
    </AuthScreen>
  )
}

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    password: '',
    identificacion: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthScreen title="Registro" subtitle="Crea tu usuario cliente">
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Usuario
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            minLength={3}
            required
          />
        </label>
        <label>
          Contrasena
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            minLength={6}
            required
          />
        </label>
        <ClienteFields form={form} onChange={setForm} />
        {error && <p className="alert wide">{error}</p>}
        <button type="submit" className="primary-button wide" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear cuenta'}
        </button>
      </form>
      <p className="auth-link">
        Ya tienes cuenta? <Link to="/login">Ingresar</Link>
      </p>
    </AuthScreen>
  )
}

function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <main className="screen auth-screen">
      <section className="auth-panel">
        <p className="eyebrow">Sajada</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </section>
    </main>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const canManageOperationalData = user?.rol === 'admin' || user?.rol === 'vendedor'

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Sesion activa</p>
          <h2>Hola, {user?.username}</h2>
        </div>
        <span className="role-pill">{user?.rol}</span>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Usuario</span>
          <strong>{user?.username}</strong>
        </article>
        <article className="metric-card">
          <span>Rol</span>
          <strong>{user?.rol}</strong>
        </article>
        <article className="metric-card">
          <span>Cliente vinculado</span>
          <strong>{user?.clienteId ?? 'Sin cliente'}</strong>
        </article>
      </div>

      {canManageOperationalData ? (
        <>
          <div className="action-band">
            <div>
              <h3>Clientes</h3>
              <p>Gestiona registros de clientes y permisos de venta.</p>
            </div>
            <Link className="primary-button link-button" to="/clientes">
              Abrir clientes
            </Link>
          </div>
          <div className="action-band">
            <div>
              <h3>Inventario</h3>
              <p>Administra productos, categorias y niveles de stock.</p>
            </div>
            <Link className="primary-button link-button" to="/inventario">
              Abrir inventario
            </Link>
          </div>
        </>
      ) : (
        <div className="action-band">
          <div>
            <h3>Cuenta cliente</h3>
            <p>Tu usuario esta registrado con permisos de cliente.</p>
          </div>
        </div>
      )}
    </section>
  )
}

function InventoryDashboardRoute() {
  const navigate = useNavigate()

  return (
    <InventoryDashboardPage
      onNavigate={(view) => navigate(view === 'dashboard' ? '/inventario' : `/${view}`)}
    />
  )
}

function ClientesPage() {
  const { token, user } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyCliente)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const isAdmin = user?.rol === 'admin'

  const loadClientes = useCallback(async (nextSearch: string) => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await clientesApi.list(token, nextSearch)
      setClientes(response.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    queueMicrotask(() => {
      void loadClientes('')
    })
  }, [loadClientes])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return

    setSubmitting(true)
    setError('')

    try {
      if (editingId) {
        await clientesApi.update(token, editingId, form)
      } else {
        await clientesApi.create(token, form)
      }

      setForm(emptyCliente)
      setEditingId(null)
      await loadClientes(search)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingId(cliente.id)
    setForm({
      identificacion: cliente.identificacion,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
    })
  }

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('Eliminar este cliente?')) return

    try {
      await clientesApi.remove(token, id)
      await loadClientes(search)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestion</p>
          <h2>Clientes</h2>
        </div>
        <form className="search-row" onSubmit={(event) => {
          event.preventDefault()
          void loadClientes(search)
        }}>
          <input
            placeholder="Buscar"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit" className="secondary-button">
            Buscar
          </button>
        </form>
      </header>

      {error && <p className="alert">{error}</p>}

      <form className="panel-form form-grid" onSubmit={handleSubmit}>
        <h3 className="wide">{editingId ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <ClienteFields form={form} onChange={setForm} />
        <div className="button-row wide">
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setEditingId(null)
                setForm(emptyCliente)
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap">
        {loading ? (
          <p className="empty-state">Cargando clientes...</p>
        ) : clientes.length === 0 ? (
          <p className="empty-state">No hay clientes para mostrar.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Identificacion</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Telefono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.identificacion}</td>
                  <td>
                    {cliente.nombre} {cliente.apellido}
                  </td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="secondary-button compact"
                        onClick={() => handleEdit(cliente)}
                      >
                        Editar
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="danger-button compact"
                          onClick={() => void handleDelete(cliente.id)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function ClienteFields<T extends ClienteForm>({
  form,
  onChange,
}: {
  form: T
  onChange: (value: T) => void
}) {
  return (
    <>
      <label>
        Identificacion
        <input
          value={form.identificacion}
          onChange={(event) => onChange({ ...form, identificacion: event.target.value })}
          required
        />
      </label>
      <label>
        Nombre
        <input
          value={form.nombre}
          onChange={(event) => onChange({ ...form, nombre: event.target.value })}
          required
        />
      </label>
      <label>
        Apellido
        <input
          value={form.apellido}
          onChange={(event) => onChange({ ...form, apellido: event.target.value })}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          required
        />
      </label>
      <label>
        Telefono
        <input
          value={form.telefono}
          onChange={(event) => onChange({ ...form, telefono: event.target.value })}
          required
        />
      </label>
      <label>
        Direccion
        <input
          value={form.direccion}
          onChange={(event) => onChange({ ...form, direccion: event.target.value })}
          required
        />
      </label>
    </>
  )
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route element={<ProtectedRoute roles={['admin', 'vendedor']} />}>
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/inventario" element={<InventoryDashboardRoute />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/categorias" element={<CategoriesPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
