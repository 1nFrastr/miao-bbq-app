import { View, Text } from '@tarojs/components'
import { AtIcon, AtButton } from 'taro-ui'
import Taro from '@tarojs/taro'
import React, { useState, useCallback } from 'react'
import { LocationPickerProps, LocationData } from './types'
import { LocationService } from '../../utils/location'
import './index.scss'

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = '点击获取当前位置',
  disabled = false
}) => {
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string>('')

  // 检查授权状态
  const checkLocationAuth = useCallback(async (): Promise<boolean> => {
    try {
      const authSetting = await Taro.getSetting()
      
      if (authSetting.authSetting['scope.userLocation'] === false) {
        // 用户之前拒绝了授权，引导去设置页面
        const result = await Taro.showModal({
          title: '需要位置权限',
          content: '为了获取您的当前位置，需要您的授权。请在设置中开启位置权限。',
          confirmText: '去设置',
          cancelText: '取消'
        })
        
        if (result.confirm) {
          await Taro.openSetting()
          // 重新检查权限
          const newAuthSetting = await Taro.getSetting()
          return newAuthSetting.authSetting['scope.userLocation'] === true
        }
        return false
      }
      
      if (authSetting.authSetting['scope.userLocation'] === undefined) {
        // 用户还没有授权过，先申请授权
        try {
          await Taro.authorize({ scope: 'scope.userLocation' })
          return true
        } catch (authError) {
          return false
        }
      }
      
      return authSetting.authSetting['scope.userLocation'] === true
    } catch (error) {
      console.error('检查位置权限失败:', error)
      return false
    }
  }, [])

  // 获取当前位置
  const getCurrentLocation = useCallback(async () => {
    if (disabled || isLocating) return

    setIsLocating(true)
    setError('')

    try {
      // 1. 检查定位权限
      const hasAuth = await checkLocationAuth()
      if (!hasAuth) {
        setError('需要位置权限才能获取当前位置')
        return
      }

      // 2. 获取GPS坐标
      const position = await LocationService.getCurrentPosition()

      // 3. 进行地址解析
      const address = await LocationService.reverseGeocode(position.latitude, position.longitude)

      // 4. 构建位置数据
      const locationData: LocationData = {
        latitude: position.latitude,
        longitude: position.longitude,
        address: address,
        isLocationEnabled: true
      }

      // 5. 回调通知父组件
      onChange?.(locationData)

    } catch (error: any) {
      console.error('获取位置失败:', error)
      
      let errorMessage = '定位失败'
      if (error.message?.includes('权限')) {
        errorMessage = '定位权限被拒绝'
      } else if (error.message?.includes('超时')) {
        errorMessage = '定位超时，请重试'
      } else if (error.message?.includes('网络')) {
        errorMessage = '网络错误，请检查网络连接'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      
      Taro.showToast({
        title: errorMessage,
        icon: 'error',
        duration: 2000
      })
    } finally {
      setIsLocating(false)
    }
  }, [disabled, isLocating, checkLocationAuth, onChange])

  // 重新定位
  const handleRelocate = useCallback(() => {
    getCurrentLocation()
  }, [getCurrentLocation])

  return (
    <View className="location-picker">
      <View className="location-picker__header">
        <Text className="location-picker__label">当前位置</Text>
        {value?.isLocationEnabled && (
          <View className="location-picker__action" onClick={handleRelocate}>
            <AtIcon value="reload" size="14" color="#007aff" />
            <Text className="location-picker__action-text">重新定位</Text>
          </View>
        )}
      </View>

      <View className="location-picker__content">
        {!value?.isLocationEnabled ? (
          <AtButton
            size="small"
            loading={isLocating}
            disabled={disabled || isLocating}
            onClick={getCurrentLocation}
            className={`location-picker__button ${isLocating ? 'location-picker__button--loading' : ''}`}
          >
            <AtIcon value="map-pin" size="16" color={isLocating ? "#d55a2b" : "#fff"} />
            <Text className="location-picker__button-text">
              {isLocating ? '定位中...' : placeholder}
            </Text>
          </AtButton>
        ) : (
          <View className="location-picker__result">
            <View className="location-picker__address">
              <AtIcon value="map-pin" size="16" color="#52c41a" />
              <Text className="location-picker__address-text">{value.address}</Text>
            </View>
            <Text className="location-picker__coords">
              经度: {value.longitude.toFixed(6)}, 纬度: {value.latitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {error && (
        <View className="location-picker__error">
          <AtIcon value="close-circle" size="14" color="#ff4757" />
          <Text className="location-picker__error-text">{error}</Text>
          <Text className="location-picker__retry" onClick={getCurrentLocation}>
            重试
          </Text>
        </View>
      )}
    </View>
  )
}

export default React.memo(LocationPicker)
