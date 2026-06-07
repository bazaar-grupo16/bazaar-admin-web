import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/users', label: 'Usuarios' },
  { to: '/products', label: 'Productos' },
  { to: '/orders', label: 'Órdenes' },
  { to: '/metrics', label: 'Métricas' },
]

export function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

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
        <header className="header">
          <span>Bazaar Admin</span>
          <div className="header-actions">
            {admin ? (
              <span className="admin-identity">{admin.name || admin.email}</span>
            ) : null}
            <button type="button" className="logout-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
