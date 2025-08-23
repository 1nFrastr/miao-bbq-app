import { View, Text } from '@tarojs/components'
import { AtIcon, AtButton } from 'taro-ui'
import Taro from '@tarojs/taro'
import React, { useEffect, useCallback } from 'react'
import { LocationPickerProps, LocationData } from './types'
import { useUserLocation } from '../../hooks/useUserLocation'
import './index.scss'

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = '点击获取当前位置',
  disabled = false,
  allowPOISelection = true
}) => {
  const { userLocation, isLoading: isLocating, error, refreshLocation, hasValidLocation } = useUserLocation()

  // 当全局位置状态变化时，同步到父组件（仅在没有手动选择位置时）
  useEffect(() => {
    if (hasValidLocation && userLocation && !value) {
      const locationData: LocationData = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address,
        isLocationEnabled: true
      }
      onChange?.(locationData)
    } else if (!hasValidLocation && !isLocating && !value) {
      // 如果没有有效位置且不在加载中，清除父组件的位置数据
      onChange?.(undefined)
    }
  }, [hasValidLocation, userLocation, isLocating, onChange, value])

  // 处理POI选择 - 使用 chooseLocation 替代 choosePoi
  const handleChoosePOI = useCallback(async () => {
    try {
      // 使用 chooseLocation 可以获取真实经纬度
      const res: any = await Taro.chooseLocation({})

      if (res) {
        console.log('chooseLocation 返回数据:', res)
        
        const poiData: LocationData = {
          latitude: res.latitude || 0,
          longitude: res.longitude || 0,
          address: res.address || '地址解析失败',
          name: res.name || '未知地点',
          city: res.city ? String(res.city) : '',
          isLocationEnabled: true
        }
        
        console.log('处理后的位置数据:', poiData)
        onChange?.(poiData)
        
        Taro.showToast({
          title: '位置选择成功',
          icon: 'success',
          duration: 1500
        })
      }
    } catch (error) {
      console.error('选择地点失败:', error)
      Taro.showToast({
        title: '选择地点失败',
        icon: 'error',
        duration: 2000
      })
    }
  }, [onChange])

  // 处理重新定位
  const handleRefreshLocation = useCallback(async () => {
    await refreshLocation()
    // 清除手动选择的位置，使用系统定位
    if (value?.name) {
      onChange?.(undefined)
    }
  }, [refreshLocation, value, onChange])

  // 当前显示的位置数据（优先显示手动选择的位置）
  const currentLocation = value || (hasValidLocation && userLocation ? {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    address: userLocation.address,
    isLocationEnabled: true
  } : undefined)

  return (
    <View className="location-picker">
      <View className="location-picker__header">
        <Text className="location-picker__label">店铺位置</Text>
        <View className="location-picker__actions">
          {allowPOISelection && (
            <View className="location-picker__action" onClick={handleChoosePOI}>
              <AtIcon value="search" size="14" color="#007aff" />
              <Text className="location-picker__action-text">选择位置</Text>
            </View>
          )}
          {(hasValidLocation || currentLocation) && (
            <View className="location-picker__action" onClick={handleRefreshLocation}>
              <AtIcon value="reload" size="14" color="#007aff" />
              <Text className="location-picker__action-text">重新定位</Text>
            </View>
          )}
        </View>
      </View>

      <View className="location-picker__content">
        {!currentLocation && !isLocating ? (
          <View className="location-picker__buttons">
            <AtButton
              size="small"
              disabled={disabled}
              onClick={refreshLocation}
              className="location-picker__button"
            >
              <AtIcon value="map-pin" size="16" color="#fff" />
              <Text className="location-picker__button-text">
                {placeholder}
              </Text>
            </AtButton>
            
            {allowPOISelection && (
              <AtButton
                size="small"
                disabled={disabled}
                onClick={handleChoosePOI}
                className="location-picker__button location-picker__button--secondary"
              >
                <AtIcon value="search" size="16" color="#007aff" />
                <Text className="location-picker__button-text">
                  选择地图位置
                </Text>
              </AtButton>
            )}
          </View>
        ) : isLocating ? (
          <AtButton
            size="small"
            loading={true}
            disabled={true}
            className="location-picker__button location-picker__button--loading"
          >
            <Text className="location-picker__button-text">
              定位中...
            </Text>
          </AtButton>
        ) : currentLocation ? (
          <View className="location-picker__result">
            <View className="location-picker__address">
              <AtIcon 
                value={value?.name ? "shop" : "map-pin"} 
                size="16" 
                color="#52c41a" 
              />
              <View className="location-picker__address-content">
                {value?.name && (
                  <Text className="location-picker__poi-name">{value.name}</Text>
                )}
                <Text className="location-picker__address-text">{currentLocation.address}</Text>
              </View>
            </View>
            <Text className="location-picker__coords">
              经度: {currentLocation.longitude.toFixed(6)}, 纬度: {currentLocation.latitude.toFixed(6)}
            </Text>
            {value?.name && (
              <View className="location-picker__poi-badge">
                <Text className="location-picker__poi-badge-text">已选择地点</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>

      {error && !isLocating && !currentLocation && (
        <View className="location-picker__error">
          <AtIcon value="close-circle" size="14" color="#ff4757" />
          <Text className="location-picker__error-text">{error}</Text>
          <Text className="location-picker__retry" onClick={refreshLocation}>
            重试
          </Text>
        </View>
      )}
    </View>
  )
}

export default React.memo(LocationPicker)
