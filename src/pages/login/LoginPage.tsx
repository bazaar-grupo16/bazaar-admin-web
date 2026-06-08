import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import logo2 from '../../assets/logo2.jpg'
import { useAuth } from '../../shared/auth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault()
    setError('')

    try {
      setIsSubmitting(true)
      await login({ email, password })
      navigate(from, { replace: true })
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f9fafb' }}>
      {/* Left panel — image */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ width: 440, flexShrink: 0 }}
      >
        <img
          src="https://images.unsplash.com/photo-1631692994621-d26f83cf4db8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Marketplace artesanal"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(249,115,22,0.88) 0%, rgba(154,52,18,0.82) 100%)' }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-2xl overflow-hidden"
            style={{ width: 44, height: 44, background: '#fff' }}
          >
            <img src={logo2} alt="Bazaar" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1 }}>Bazaar</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Admin Panel</p>
          </div>
        </div>

        <div className="relative z-10">
          <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
            Gestión del marketplace en un solo lugar
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>
            Administrá usuarios, productos, órdenes y métricas desde el panel de control de Bazaar.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div
            className="flex items-center justify-center rounded-xl overflow-hidden"
            style={{ width: 36, height: 36, background: '#fff' }}
          >
            <img src={logo2} alt="Bazaar" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          </div>
          <p style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>Bazaar Admin</p>
        </div>

        <div style={{ width: '100%', maxWidth: 380 }}>
          <div className="mb-8">
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
              Iniciar sesión
            </h1>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>
              Accedé con tu cuenta de administrador.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="admin@bazaar.com"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  fontSize: 14,
                  color: '#111827',
                  background: '#fff',
                  border: '1.5px solid #e5e7eb',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)' }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)' }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }} htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    fontSize: 14,
                    color: '#111827',
                    background: '#fff',
                    border: '1.5px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    paddingRight: 44,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg"
                  style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
              >
                <AlertCircle size={15} style={{ color: '#dc2626', flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl transition-all mt-1"
              style={{
                fontSize: 14,
                fontWeight: 700,
                background: isSubmitting ? '#fdba74' : '#F97316',
                color: '#fff',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(249,115,22,0.35)',
              }}
            >
              {isSubmitting ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
