import { http } from './http'

export interface OrderStatusHistoryEntry {
  item_id?: string | null
  previous_status?: string | null
  new_status: string
  timestamp: string
  origin: string
  tracking_code?: string | null
}

export interface OrderItemDetailResponse {
  id: string
  product_id: string
  seller_id?: string | null
  product_name: string
  quantity: number
  unit_price: number
  status: string
  tracking_code?: string | null
  created_at?: string | null
  updated_at?: string | null
  status_history: OrderStatusHistoryEntry[]
}

export interface OrderResponse {
  order_id: string
  user_id: string
  status: string
  aggregated_status: string | null
  shipping_address: Record<string, any>
  total_amount: number
  tracking_code?: string | null
  preference_id?: string | null
  init_point?: string | null
  created_at: string
  updated_at: string
  items: OrderItemDetailResponse[]
  status_history: OrderStatusHistoryEntry[]
}

export interface OrderListResponse {
  orders: OrderResponse[]
  total: number
  page: number
  size: number
}

export async function getOrders(page: number = 1, size: number = 10, status?: string) {
  const params: Record<string, string | number> = { page, size }
  if (status) {
    params.order_status = status
  }
  const { data } = await http.get<OrderListResponse>('/orders/admin/orders', { params })
  return data
}

export async function getOrder(orderId: string) {
  const { data } = await http.get<OrderResponse>(`/orders/admin/orders/${orderId}`)
  return data
}