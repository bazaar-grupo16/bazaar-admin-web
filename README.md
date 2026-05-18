# bazaar-admin-web

Backoffice web base para Bazaar, creado con React + Vite + TypeScript.

## Requisitos

- Node.js 20+
- npm 10+

## Levantar en desarrollo

```bash
npm install
cp .env.example .env
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Stack

- React
- Vite
- TypeScript
- React Router
- Axios
- TanStack Query

## Estructura base

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
  shared/
    api/
      http.ts
    ui/
      AdminLayout.tsx
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
