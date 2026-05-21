import { createBrowserRouter } from 'react-router-dom'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { LoginPage } from '../pages/login/LoginPage'
import { MetricsPage } from '../pages/metrics/MetricsPage'
import { OrdersPage } from '../pages/orders/OrdersPage'
import { ProductsPage } from '../pages/products/ProductsPage'
import { UsersPage } from '../pages/users/UsersPage'
import { ProtectedRoute, PublicOnlyRoute } from '../shared/auth'
import { AdminLayout } from '../shared/ui/AdminLayout'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'metrics',
        element: <MetricsPage />,
      },
    ],
  },
])
