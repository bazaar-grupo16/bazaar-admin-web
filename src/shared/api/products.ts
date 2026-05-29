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