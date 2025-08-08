import { useEffect, useCallback } from 'react'
import { useLocationStore } from '../store'
import type { UserLocationData } from '../store'

export type { UserLocationData } from '../store'

export interface UseUserLocationResult {
  userLocation: UserLocationData | null
  isLoading: boolean
  error: string | null
  refreshLocation: () => Promise<void>
  calculateDistance: (targetLat: number, targetLng: number) => number | null
  hasValidLocation: boolean
}

export const useUserLocation = (): UseUserLocationResult => {
  const {
    userLocation,
    isLoading,
    error,
    initializeLocation,
    refreshLocation,
    calculateDistance
  } = useLocationStore()

  // 初始化位置
  useEffect(() => {
    initializeLocation()
  }, [initializeLocation])

  // 计算距离的callback包装
  const handleCalculateDistance = useCallback((targetLat: number, targetLng: number): number | null => {
    return calculateDistance(targetLat, targetLng)
  }, [calculateDistance])

  // 检查是否有有效位置
  const hasValidLocation = !!(userLocation && !error)

  return {
    userLocation,
    isLoading,
    error,
    refreshLocation,
    calculateDistance: handleCalculateDistance,
    hasValidLocation
  }
}
