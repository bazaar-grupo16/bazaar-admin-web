# bazaar-admin-web

Backoffice web para administradores del marketplace Bazaar. Permite gestionar usuarios, productos, órdenes y consultar métricas de la plataforma.

## Requisitos

- Node.js 20+
- npm 10+

## Configuración del entorno local

```bash
npm install
cp .env.example .env
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base de la API de Bazaar |
| `VITE_AUTH_BASE_URL` | URL base para los endpoints de autenticación (por defecto igual a `VITE_API_BASE_URL`) |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`tsc` + Vite) |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Linting con ESLint |

## Stack y dependencias

**Runtime**

- React 19
- React Router 7
- Axios 1 — cliente HTTP con interceptores para autenticación y refresh de tokens
- TanStack Query 5 — caché y sincronización de estado del servidor
- Recharts 3 — gráficos para el dashboard de métricas
- Lucide React — íconos
- Tailwind CSS 4

**Tooling**

- Vite 8
- TypeScript 6
- ESLint 10 con plugins para React Hooks y React Refresh

## Estructura del proyecto

```
src/
  app/
    App.tsx           # Raíz de la aplicación
    router.tsx        # Definición de rutas
    providers.tsx     # Providers globales (QueryClient, AuthProvider)
  shared/
    api/
      http.ts         # Instancias de Axios y lógica de refresh de tokens
      users.ts        # Llamadas a la API de usuarios
      products.ts     # Llamadas a la API de productos
      orders.ts       # Llamadas a la API de órdenes
    auth/
      AuthProvider.tsx # Provider de sesión y rutas protegidas
      context.ts      # Contexto y tipos de autenticación
      session.ts      # Persistencia de tokens en storage
      index.ts        # Re-exports públicos
    ui/
      AdminLayout.tsx  # Layout con sidebar y navegación
  hooks/
    useMetrics.ts     # Hook para obtener métricas
  pages/
    login/
      LoginPage.tsx
    dashboard/
      DashboardPage.tsx
    users/
      UsersPage.tsx
    products/
      ProductsPage.tsx
    orders/
      OrdersPage.tsx
    metrics/
      MetricsPage.tsx
```

## Producción

La versión de producción está disponible en **https://backoffice.bazaar.pib.ar** y se actualiza automáticamente con cada push a `main` mediante Cloudflare Pages.
