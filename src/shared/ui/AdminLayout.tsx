import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, Package, ShoppingCart, Users, LogOut } from 'lucide-react'
import { useAuth } from '../auth'
import logo from '../../assets/logo.jpg'

const links = [
  { to: '/metrics', label: 'Métricas', icon: BarChart3 },
  { to: '/users', label: 'Usuarios', icon: Users },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/orders', label: 'Órdenes', icon: ShoppingCart },
]

export function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const adminInitial = (admin?.name?.[0] ?? admin?.email?.[0] ?? 'A').toUpperCase()
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const adminEmail = admin?.email || ''

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr' }}>
      <aside style={{ background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
          <img src={logo} alt="Bazaar" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', lineHeight: 1.2, margin: 0 }}>Bazaar</p>
            <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, margin: 0 }}>Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#F97316' : '#6b7280',
                background: isActive ? '#FFF7ED' : 'transparent',
                borderLeft: isActive ? '3px solid #F97316' : '3px solid transparent',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFF7ED', color: '#F97316', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {adminInitial}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminLabel}</p>
              {adminEmail && <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminEmail}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#9ca3af', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#6b7280' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af' }}
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
