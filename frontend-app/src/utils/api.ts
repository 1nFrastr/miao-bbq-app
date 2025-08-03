import Taro from '@tarojs/taro'

// API配置
const API_BASE_URL = 'http://localhost:8000/api'

// 请求拦截器配置
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

// 统一请求方法
export const request = async <T = any>(config: RequestConfig): Promise<T> => {
  try {
    // 获取用户openid用于认证
    const openid = Taro.getStorageSync('user_openid')
    
    const response = await Taro.request({
      url: `${API_BASE_URL}${config.url}`,
      method: config.method || 'GET',
      data: config.data,
      header: {
        'Content-Type': 'application/json',
        'X-Openid': openid || '',
        ...config.header
      }
    })

    // 处理响应
    if (response.statusCode === 200) {
      // 如果是分页数据，直接返回
      if (response.data.results !== undefined) {
        return response.data as T
      }
      // 如果有data字段，返回data内容
      if (response.data.data !== undefined) {
        return response.data.data as T
      }
      // 否则直接返回响应数据
      return response.data as T
    } else {
      throw new Error(response.data?.error || '请求失败')
    }
  } catch (error: any) {
    console.error('API请求失败:', error)
    Taro.showToast({
      title: error.message || '网络请求失败',
      icon: 'error',
      duration: 2000
    })
    throw error
  }
}

// 订单相关API
export class OrderAPI {
  // 创建订单
  static async createOrder(orderData: {
    status: 'pending'
    items: Array<{
      dish_name: string
      unit_price: number
      quantity: number
    }>
  }) {
    return request({
      url: '/orders/orders/',
      method: 'POST',
      data: orderData
    })
  }

  // 获取订单列表
  static async getOrders(params?: {
    page?: number
    page_size?: number
    ordering?: string
  }) {
    const queryStr = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return request({
      url: `/orders/orders/${queryStr}`,
      method: 'GET'
    })
  }

  // 获取订单详情
  static async getOrderDetail(orderId: number) {
    return request({
      url: `/orders/orders/${orderId}/`,
      method: 'GET'
    })
  }

  // 开始计时
  static async startTimer(orderId: number) {
    return request({
      url: `/orders/orders/${orderId}/start_timer/`,
      method: 'POST'
    })
  }

  // 完成订单
  static async completeOrder(orderId: number) {
    return request({
      url: `/orders/orders/${orderId}/complete/`,
      method: 'POST'
    })
  }

  // 添加菜品
  static async addItem(orderId: number, itemData: {
    dish_name: string
    unit_price: number
    quantity: number
  }) {
    return request({
      url: `/orders/orders/${orderId}/add_item/`,
      method: 'POST',
      data: itemData
    })
  }

  // 删除菜品
  static async removeItem(orderId: number, itemId: number) {
    return request({
      url: `/orders/orders/${orderId}/remove_item/?item_id=${itemId}`,
      method: 'DELETE'
    })
  }

  // 获取订单统计
  static async getStatistics() {
    return request({
      url: '/orders/orders/statistics/',
      method: 'GET'
    })
  }
}

// 用户相关API
export class UserAPI {
  // 用户登录/注册
  static async login(userData: {
    openid: string
    unionid?: string
    nickname: string
    avatar_url: string
    gender: number
    city?: string
    province?: string
    country?: string
  }) {
    return request({
      url: '/users/users/login/',
      method: 'POST',
      data: userData
    })
  }

  // 获取用户列表
  static async getUsers(params?: {
    page?: number
    page_size?: number
  }) {
    const queryStr = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return request({
      url: `/users/users/${queryStr}`,
      method: 'GET'
    })
  }

  // 获取用户详情
  static async getUserDetail(userId: number) {
    return request({
      url: `/users/users/${userId}/`,
      method: 'GET'
    })
  }

  // 更新用户资料
  static async updateProfile(userId: number, profileData: any) {
    return request({
      url: `/users/users/${userId}/update_profile/`,
      method: 'POST',
      data: profileData
    })
  }
}

// 社区相关API
export class CommunityAPI {
  // 创建分享
  static async createPost(postData: {
    shop_name: string
    shop_location: string
    shop_price: number
    comment: string
    latitude?: number
    longitude?: number
    location_address?: string
    images?: Array<{ image_url: string }>
  }) {
    return request({
      url: '/community/posts/',
      method: 'POST',
      data: postData
    })
  }

  // 获取分享列表
  static async getPosts(params?: {
    search?: string
    lat?: number
    lng?: number
    radius?: number
    ordering?: string
    page?: number
    page_size?: number
  }) {
    const queryStr = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return request({
      url: `/community/posts/${queryStr}`,
      method: 'GET'
    })
  }

  // 获取分享详情
  static async getPostDetail(postId: number) {
    return request({
      url: `/community/posts/${postId}/`,
      method: 'GET'
    })
  }

  // 点赞/取消点赞
  static async likePost(postId: number) {
    return request({
      url: `/community/posts/${postId}/like/`,
      method: 'POST'
    })
  }

  // 获取点赞列表
  static async getLikes(postId: number) {
    return request({
      url: `/community/posts/${postId}/likes/`,
      method: 'GET'
    })
  }

  // 获取我的分享
  static async getMyPosts(params?: {
    page?: number
    page_size?: number
  }) {
    const queryStr = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return request({
      url: `/community/posts/my_posts/${queryStr}`,
      method: 'GET'
    })
  }

  // 获取附近分享
  static async getNearbyPosts(params: {
    lat: number
    lng: number
    radius?: number
  }) {
    const queryStr = '?' + new URLSearchParams(params as any).toString()
    return request({
      url: `/community/posts/nearby/${queryStr}`,
      method: 'GET'
    })
  }
}
