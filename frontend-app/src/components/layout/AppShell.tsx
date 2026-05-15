import type { ReactNode } from 'react'

export type NavView = 'dashboard' | 'productos' | 'categorias'

type AppShellProps = {
  activeView: NavView
  children: ReactNode
  onNavigate: (view: NavView) => void
}

const navigation: Array<{ id: NavView; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: 'D' },
  { id: 'productos', label: 'Productos', icon: 'P' },
  { id: 'categorias', label: 'Categorias', icon: 'C' }
]

export function AppShell({ activeView, children, onNavigate }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">H</span>
          <div>
            <strong>Herramientas</strong>
            <span>Inventario</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Navegacion principal">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeView === item.id ? 'active' : ''}`.trim()}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Modulo Dev 2</span>
            <h1>Inventario operativo</h1>
          </div>
          <div className="topbar-user">
            <span className="user-avatar">AD</span>
            <div>
              <strong>Administrador</strong>
              <span>Sesion local</span>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  )
}
