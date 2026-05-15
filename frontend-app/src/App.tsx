import { useState } from 'react'
import { AppShell, type NavView } from './components/layout/AppShell'
import { CategoriesPage } from './features/categorias/CategoriesPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ProductsPage } from './features/productos/ProductsPage'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState<NavView>('dashboard')

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      {activeView === 'dashboard' && <DashboardPage onNavigate={setActiveView} />}
      {activeView === 'productos' && <ProductsPage />}
      {activeView === 'categorias' && <CategoriesPage />}
    </AppShell>
  )
}

export default App
