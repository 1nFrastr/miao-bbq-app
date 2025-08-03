// 订单相关类型
export interface OrderItem {
  id: number
  dishName: string
  price: number
  quantity: number
  total: number
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

// 社区推荐相关类型
export interface Post {
  id: number
  shopName: string
  shopLocation: string
  shopPrice: number
  shopComment: string
  images: string[]
  publishTime: string
  distance?: number
  userLocation?: {
    lat: number
    lng: number
  }
}

export type SortType = 'distance' | 'latest' | 'popular'

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
