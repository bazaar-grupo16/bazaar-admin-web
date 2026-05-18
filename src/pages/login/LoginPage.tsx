export function LoginPage() {
  return (
    <div className="login-page">
      <h1>Login</h1>
      <form className="login-form">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" placeholder="admin@bazaar.com" />

        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" placeholder="••••••••" />

        <button type="submit">Ingresar</button>
      </form>
    </div>
  )
}
