import Taro from '@tarojs/taro'
import { CONFIG } from '../config/constants'

/**
 * 腾讯地图服务配置
 * 注意：需要在小程序后台配置合法域名 apis.map.qq.com
 */
const TENCENT_MAP_CONFIG = {
  baseUrl: CONFIG.TENCENT_MAP.BASE_URL,
  key: CONFIG.TENCENT_MAP.KEY
}

export interface GeocodeResult {
  address: string
  formatted_addresses: {
    recommend: string
    rough: string
  }
  address_component: {
    nation: string
    province: string
    city: string
    district: string
    street: string
    street_number: string
  }
}

export class LocationService {
  /**
   * 检查定位权限
   */
  static async checkLocationPermission(): Promise<boolean> {
    try {
      const authSetting = await Taro.getSetting()
      return authSetting.authSetting['scope.userLocation'] === true
    } catch (error) {
      console.error('检查定位权限失败:', error)
      return false
    }
  }

  /**
   * 申请定位权限
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      await Taro.authorize({ scope: 'scope.userLocation' })
      return true
    } catch (error) {
      console.error('申请定位权限失败:', error)
      return false
    }
  }

  /**
   * 获取当前位置
   */
  static async getCurrentPosition(): Promise<{
    latitude: number
    longitude: number
  }> {
    try {
      const result = await Taro.getLocation({
        type: 'gcj02', // 使用国测局坐标系
        altitude: false,
        isHighAccuracy: true,
        highAccuracyExpireTime: 10000
      })

      return {
        latitude: result.latitude,
        longitude: result.longitude
      }
    } catch (error) {
      console.error('获取位置失败:', error)
      throw new Error('定位失败，请检查GPS设置')
    }
  }

  /**
   * 逆地理编码 - 将坐标转换为地址
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await Taro.request({
        url: `${TENCENT_MAP_CONFIG.baseUrl}/geocoder/v1/`,
        data: {
          location: `${latitude},${longitude}`,
          key: TENCENT_MAP_CONFIG.key,
          get_poi: 1
        }
      })

      const result = response.data as {
        status: number
        message: string
        result: GeocodeResult
      }

      if (result.status === 0) {
        return result.result.address || 
               result.result.formatted_addresses?.recommend || 
               '位置解析失败'
      } else {
        throw new Error(result.message || '地址解析失败')
      }
    } catch (error) {
      console.error('逆地理编码失败:', error)
      // 如果地址解析失败，返回坐标信息
      return `位置: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    }
  }

  /**
   * 计算两点之间的距离（公里）
   */
  static calculateDistance(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const R = 6371 // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return Math.round(distance * 100) / 100 // 保留两位小数
  }

  /**
   * 角度转弧度
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * 格式化距离显示
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    } else {
      return `${distance}km`
    }
  }

  /**
   * 获取位置权限状态描述
   */
  static async getLocationPermissionStatus(): Promise<{
    status: 'granted' | 'denied' | 'prompt'
    message: string
  }> {
    try {
      const authSetting = await Taro.getSetting()
      const locationAuth = authSetting.authSetting['scope.userLocation']

      if (locationAuth === true) {
        return {
          status: 'granted',
          message: '已授权位置权限'
        }
      } else if (locationAuth === false) {
        return {
          status: 'denied',
          message: '位置权限被拒绝，请在设置中开启'
        }
      } else {
        return {
          status: 'prompt',
          message: '需要申请位置权限'
        }
      }
    } catch (error) {
      return {
        status: 'denied',
        message: '无法获取权限状态'
      }
    }
  }
}
