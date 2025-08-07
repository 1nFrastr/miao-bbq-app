// 订单相关类型
export interface OrderItem {
  id: number
  dish_name: string
  unit_price: number | string  // 后端可能返回字符串
  quantity: number
  subtotal: number | string    // 后端字段名是subtotal，不是total_price
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user: any  // 用户对象，不只是id
  status: 'pending' | 'processing' | 'completed'  // 后端用processing而不是ongoing
  items: OrderItem[]
  total_amount: number | string  // 后端可能返回字符串
  item_count: number
  start_time?: string | null
  complete_time?: string | null  // 后端字段名是complete_time
  waiting_seconds: number
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
  shop_price: number
  comment: string
  latitude?: number
  longitude?: number
  location_address?: string
  images: Array<{ id: number; image_url: string }>
  likes_count: number
  view_count: number
  is_liked: boolean
  status: 'pending' | 'approved' | 'rejected'
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

export interface LocationData {
  latitude: number      // 纬度
  longitude: number     // 经度
  address: string       // 详细地址
  isLocationEnabled: boolean  // 是否已获取位置
}

// 扩展后的表单数据结构
export interface PostFormData {
  shop_name: string
  shop_price: string
  comment: string
  // 位置字段
  latitude?: number
  longitude?: number
  location_address?: string
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
