import { create } from 'zustand'
import { LocationService } from '../utils/location'
import { StorageService, STORAGE_KEYS } from '../utils'
import { ENV_CONFIG } from '../config/env'

export interface UserLocationData {
  latitude: number
  longitude: number
  address: string
  timestamp: number
}

interface LocationState {
  userLocation: UserLocationData | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

interface LocationActions {
  setUserLocation: (location: UserLocationData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setInitialized: (initialized: boolean) => void
  loadCachedLocation: () => boolean
  getCurrentLocation: () => Promise<UserLocationData | null>
  refreshLocation: () => Promise<void>
  initializeLocation: () => Promise<void>
  calculateDistance: (targetLat: number, targetLng: number) => number | null
  clearLocation: () => void
}

type LocationStore = LocationState & LocationActions

// 位置缓存有效期：30分钟
const LOCATION_CACHE_DURATION = 30 * 60 * 1000

export const useLocationStore = create<LocationStore>((set, get) => ({
  // 状态
  userLocation: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  // Actions
  setUserLocation: (location) => set({ userLocation: location }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),

  // 从缓存中获取位置
  loadCachedLocation: () => {
    const cached = StorageService.get<UserLocationData | null>(STORAGE_KEYS.USER_LOCATION, null)
    
    if (cached && cached.timestamp) {
      const now = Date.now()
      const isExpired = now - cached.timestamp > LOCATION_CACHE_DURATION
      
      if (!isExpired) {
        set({ 
          userLocation: cached, 
          error: null,
          isInitialized: true
        })
        return true
      } else {
        // 清除过期缓存
        StorageService.remove(STORAGE_KEYS.USER_LOCATION)
      }
    }
    
    return false
  },

  // 获取当前位置
  getCurrentLocation: async () => {
    const { setLoading, setError, setUserLocation, setInitialized } = get()
    
    try {
      setLoading(true)
      setError(null)

      // 开发环境下的模拟数据（只有开启了虚拟定位开关才使用）
      if (process.env.NODE_ENV === 'development' && ENV_CONFIG.USE_MOCK_LOCATION) {
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockLocationData: UserLocationData = {
          latitude: 23.12908,
          longitude: 113.264435,
          address: '广东省广州市天河区（模拟位置）',
          timestamp: Date.now()
        }

        // 缓存位置信息并更新状态
        StorageService.set(STORAGE_KEYS.USER_LOCATION, mockLocationData)
        setUserLocation(mockLocationData)
        setLoading(false)
        setInitialized(true)
        
        console.log('使用虚拟定位:', mockLocationData)
        return mockLocationData
      }

      // 真实定位（生产环境或开发环境关闭虚拟定位时）
      console.log('使用真实定位服务')
      
      // 检查并申请位置权限
      const hasPermission = await LocationService.checkLocationPermission()
      
      if (!hasPermission) {
        const granted = await LocationService.requestLocationPermission()
        if (!granted) {
          throw new Error('位置权限被拒绝')
        }
      }

      // 获取当前位置
      const position = await LocationService.getCurrentPosition()
      
      // 获取地址信息（简化版，先用坐标代替）
      let address = `位置: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
      
      try {
        const fullAddress = await LocationService.reverseGeocode(
          position.latitude, 
          position.longitude
        )
        address = fullAddress
      } catch (addressError) {
        // 地址解析失败时继续使用坐标作为地址
      }

      const locationData: UserLocationData = {
        latitude: position.latitude,
        longitude: position.longitude,
        address,
        timestamp: Date.now()
      }

      // 缓存位置信息并更新状态
      StorageService.set(STORAGE_KEYS.USER_LOCATION, locationData)
      setUserLocation(locationData)
      setLoading(false)
      setInitialized(true)
      
      return locationData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取位置失败'
      setLoading(false)
      setError(errorMessage)
      setInitialized(true)
      console.error('获取用户位置失败:', err)
      return null
    }
  },

  // 刷新位置
  refreshLocation: async () => {
    const { getCurrentLocation } = get()
    // 清除缓存，强制重新获取
    StorageService.remove(STORAGE_KEYS.USER_LOCATION)
    await getCurrentLocation()
  },

  // 初始化位置（只执行一次）
  initializeLocation: async () => {
    const { isInitialized, loadCachedLocation, getCurrentLocation } = get()
    
    if (isInitialized) {
      return
    }
    
    // 先尝试加载缓存
    const hasCached = loadCachedLocation()
    
    if (!hasCached) {
      // 如果没有缓存或缓存过期，则获取新位置
      await getCurrentLocation()
    }
  },

  // 计算距离
  calculateDistance: (targetLat: number, targetLng: number) => {
    const { userLocation } = get()
    
    if (!userLocation) {
      return null
    }

    try {
      return LocationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        targetLat,
        targetLng
      )
    } catch (error) {
      console.error('距离计算失败:', error)
      return null
    }
  },

  // 清除位置信息
  clearLocation: () => {
    StorageService.remove(STORAGE_KEYS.USER_LOCATION)
    set({
      userLocation: null,
      error: null,
      isInitialized: false
    })
  }
}))
