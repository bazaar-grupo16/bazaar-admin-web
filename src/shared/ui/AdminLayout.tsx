import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/users', label: 'Usuarios' },
  { to: '/products', label: 'Productos' },
  { to: '/orders', label: 'Órdenes' },
  { to: '/metrics', label: 'Métricas' },
]

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">Menú</h2>
        <nav>
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="sidebar-link">
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-content">
        <header className="header">Bazaar Admin</header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
