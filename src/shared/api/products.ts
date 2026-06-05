import { http } from './http'

export interface AdminProduct {
  id: string
  title: string
  description: string
  price: number
  stock: number
  category: string
  sellerId: string
  status: 'active' | 'inactive' | 'out_of_stock'
  createdAt: string
  adminDisabled: boolean
}

export interface PaginatedProductResponse {
  data: AdminProduct[]
  total: number
  limit: number
  offset: number
}

export async function getProducts(page: number = 1, limit: number = 10, search?: string) {
  const params: Record<string, string | number | boolean> = {
    limit,
    offset: (page - 1) * limit,
    include_inactive: true,
    include_blocked: true,
  }
  
  if (search) {
    params.search_query = search
  }
  
  const { data } = await http.get<PaginatedProductResponse>('/catalog/products', { params })
  return data
}

export interface SellerProfileResponse {
  id: string
  user_id: string
  name: string
  description: string}

export async function getSellerProfile(sellerId: string) {
  const { data } = await http.get<SellerProfileResponse>(`/profile/${sellerId}`)
  return data
}
export async function blockProduct(productId: string) {
  const { data } = await http.patch<{ data: AdminProduct }>(`/catalog/products/${productId}/block`)
  return data.data
}

export async function unblockProduct(productId: string) {
  const { data } = await http.patch<{ data: AdminProduct }>(`/catalog/products/${productId}/unblock`)
  return data.data
}

export interface ProductStatusHistoryEntry {
  id: string
  previousState: string | null
  newState: string
  changedAt: string
  changedBy: string | null
  changedByRole: string | null
}

export interface ProductStatusHistoryResponse {
  data: ProductStatusHistoryEntry[]
}

export async function getProductStatusHistory(productId: string) {
  const { data } = await http.get<ProductStatusHistoryResponse>(`/catalog/products/${productId}/status-history`)
  return data.data
}