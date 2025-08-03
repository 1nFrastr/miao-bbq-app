// 订单相关类型
export interface OrderItem {
  id: number
  dish_name: string
  unit_price: number
  quantity: number
  total_price: number
}

export interface Order {
  id: number
  user: number
  status: 'pending' | 'ongoing' | 'completed'
  items: OrderItem[]
  total_amount: number
  start_time?: string
  end_time?: string
  created_at: string
  updated_at: string
}

export interface OrderHistory {
  id: number
  items: OrderItem[]
  totalAmount: number
  waitingTime: number
  completedAt: string
  status: 'completed'
}

export type OrderStatus = 'pending' | 'ongoing' | 'completed'

// 创建订单项的表单数据
export interface OrderItemForm {
  dish_name: string
  unit_price: number
  quantity: number
}

// 订单统计数据
export interface OrderStatistics {
  total_orders: number
  total_amount: number
  average_order_value: number
  popular_dishes: Array<{
    dish_name: string
    order_count: number
  }>
}

// 社区推荐相关类型
export interface Post {
  id: number
  user: number
  shop_name: string
  shop_location: string
  shop_price: number
  comment: string
  latitude?: number
  longitude?: number
  location_address?: string
  images: Array<{ id: number; image_url: string }>
  likes_count: number
  view_count: number
  is_liked: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
  distance?: number
}

export type SortType = 'distance' | 'latest' | 'popular'

// 用户相关类型
export interface User {
  id: number
  openid: string
  unionid?: string
  nickname: string
  avatar_url: string
  gender: number
  city?: string
  province?: string
  country?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 分页响应类型
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// 位置相关类型
export interface UserLocation {
  lat: number
  lng: number
}

export interface LocationPermission {
  granted: boolean
  requested: boolean
}

// 图片上传类型
export interface ImageFile {
  url: string
  file?: File
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 表单验证结果类型
export interface ValidationResult {
  isValid: boolean
  message?: string
}
