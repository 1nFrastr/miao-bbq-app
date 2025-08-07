import Taro from '@tarojs/taro'

// 存储key常量
export const STORAGE_KEYS = {
  ORDER_HISTORY: 'orderHistory',
  COMMUNITY_POSTS: 'communityPosts',
  LOCATION_PERMISSION: 'locationPermission',
  USER_LOCATION: 'userLocation'
}

// 本地存储服务
export class StorageService {
  // 获取存储数据
  static get<T>(key: string, defaultValue: T): T {
    try {
      const data = Taro.getStorageSync(key)
      return data || defaultValue
    } catch (error) {
      console.error('获取存储数据失败:', error)
      return defaultValue
    }
  }

  // 设置存储数据
  static set<T>(key: string, value: T): boolean {
    try {
      Taro.setStorageSync(key, value)
      return true
    } catch (error) {
      console.error('设置存储数据失败:', error)
      return false
    }
  }

  // 删除存储数据
  static remove(key: string): boolean {
    try {
      Taro.removeStorageSync(key)
      return true
    } catch (error) {
      console.error('删除存储数据失败:', error)
      return false
    }
  }

  // 清空所有存储数据
  static clear(): boolean {
    try {
      Taro.clearStorageSync()
      return true
    } catch (error) {
      console.error('清空存储数据失败:', error)
      return false
    }
  }
}

// 位置服务
export class LocationService {
  // 获取用户位置
  static async getUserLocation(): Promise<{ lat: number, lng: number } | null> {
    try {
      const res = await Taro.getLocation({
        type: 'gcj02',
        isHighAccuracy: true
      })
      return {
        lat: res.latitude,
        lng: res.longitude
      }
    } catch (error) {
      console.error('获取位置失败:', error)
      return null
    }
  }

  // 计算两点间距离（公里）
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371 // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // 格式化距离显示
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }
}

// 时间工具
export class TimeUtils {
  // 格式化时间显示（分:秒）
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 格式化相对时间
  static formatRelativeTime(timeString: string): string {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 5) return `${minutes}分钟前`
    return '刚刚'
  }

  // 智能格式化日期
  static formatDate(timeString: string): string {
    const date = new Date(timeString)
    const now = new Date()
    
    // 获取今天的开始时间（00:00:00）
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    // 获取昨天的开始时间
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    // 获取今年的开始时间
    const thisYear = new Date(now.getFullYear(), 0, 1)
    
    // 今天之内：显示相对时间
    if (date >= today) {
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      
      if (hours > 0) return `${hours}小时前`
      if (minutes > 5) return `${minutes}分钟前`
      return '刚刚'
    }
    
    // 昨天：显示"昨天 时:分"
    if (date >= yesterday) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    }
    
    // 今年之内：显示月日时分
    if (date >= thisYear) {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // 更早：显示年月日时分
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 数据验证工具
export class ValidationUtils {
  // 验证非空字符串
  static isNotEmpty(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0
  }

  // 验证数字
  static isValidNumber(value: string | number): boolean {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return !isNaN(num) && isFinite(num) && num > 0
  }

  // 验证价格
  static isValidPrice(value: string | number): boolean {
    const price = typeof value === 'string' ? parseFloat(value) : value
    return this.isValidNumber(price) && price >= 0
  }

  // 验证整数
  static isValidInteger(value: string | number): boolean {
    const num = typeof value === 'string' ? parseInt(value) : value
    return Number.isInteger(num) && num > 0
  }
}

// 消息提示工具
export class MessageUtils {
  // 显示成功消息
  static showSuccess(message: string) {
    Taro.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    })
  }

  // 显示错误消息
  static showError(message: string) {
    Taro.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    })
  }

  // 显示普通消息
  static showInfo(message: string) {
    Taro.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }

  // 显示确认对话框
  static async showConfirm(title: string, content?: string): Promise<boolean> {
    try {
      const res = await Taro.showModal({
        title,
        content: content || '',
        showCancel: true,
        cancelText: '取消',
        confirmText: '确定'
      })
      return res.confirm
    } catch {
      return false
    }
  }
}

// 位置精度处理工具
export class LocationUtils {
  /**
   * 处理纬度精度，确保符合数据库字段限制
   * 数据库限制：max_digits=10, decimal_places=8
   * 即：最多2位整数 + 8位小数
   */
  static formatLatitude(latitude: number): number {
    // 纬度范围 -90 到 90，最多2位整数
    const rounded = parseFloat(latitude.toFixed(8))
    
    // 确保不超过总位数限制
    const str = Math.abs(rounded).toString()
    const [integerPart = '', decimalPart = ''] = str.split('.')
    
    if (integerPart.length + (decimalPart.length > 0 ? decimalPart.length : 0) > 10) {
      // 如果总位数超过10位，减少小数位数
      const maxDecimalPlaces = Math.max(0, 10 - integerPart.length)
      return parseFloat(latitude.toFixed(maxDecimalPlaces))
    }
    
    return rounded
  }
  
  /**
   * 处理经度精度，确保符合数据库字段限制
   * 数据库限制：max_digits=11, decimal_places=8
   * 即：最多3位整数 + 8位小数
   */
  static formatLongitude(longitude: number): number {
    // 经度范围 -180 到 180，最多3位整数
    const rounded = parseFloat(longitude.toFixed(8))
    
    // 确保不超过总位数限制
    const str = Math.abs(rounded).toString()
    const [integerPart = '', decimalPart = ''] = str.split('.')
    
    if (integerPart.length + (decimalPart.length > 0 ? decimalPart.length : 0) > 11) {
      // 如果总位数超过11位，减少小数位数
      const maxDecimalPlaces = Math.max(0, 11 - integerPart.length)
      return parseFloat(longitude.toFixed(maxDecimalPlaces))
    }
    
    return rounded
  }
}
