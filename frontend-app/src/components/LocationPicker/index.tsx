import { View, Text } from '@tarojs/components'
import { AtIcon, AtButton } from 'taro-ui'
import React, { useEffect } from 'react'
import { LocationPickerProps, LocationData } from './types'
import { useUserLocation } from '../../hooks/useUserLocation'
import './index.scss'

const LocationPicker: React.FC<LocationPickerProps> = ({
  onChange,
  placeholder = '点击获取当前位置',
  disabled = false
}) => {
  const { userLocation, isLoading: isLocating, error, refreshLocation, hasValidLocation } = useUserLocation()

  // 当全局位置状态变化时，同步到父组件
  useEffect(() => {
    if (hasValidLocation && userLocation) {
      const locationData: LocationData = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address,
        isLocationEnabled: true
      }
      onChange?.(locationData)
    } else if (!hasValidLocation && !isLocating) {
      // 如果没有有效位置且不在加载中，清除父组件的位置数据
      onChange?.(undefined)
    }
  }, [hasValidLocation, userLocation, isLocating, onChange])

  return (
    <View className="location-picker">
      <View className="location-picker__header">
        <Text className="location-picker__label">当前位置</Text>
        {hasValidLocation && (
          <View className="location-picker__action" onClick={refreshLocation}>
            <AtIcon value="reload" size="14" color="#007aff" />
            <Text className="location-picker__action-text">重新定位</Text>
          </View>
        )}
      </View>

      <View className="location-picker__content">
        {!hasValidLocation && !isLocating ? (
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
        ) : hasValidLocation && userLocation ? (
          <View className="location-picker__result">
            <View className="location-picker__address">
              <AtIcon value="map-pin" size="16" color="#52c41a" />
              <Text className="location-picker__address-text">{userLocation.address}</Text>
            </View>
            <Text className="location-picker__coords">
              经度: {userLocation.longitude.toFixed(6)}, 纬度: {userLocation.latitude.toFixed(6)}
            </Text>
          </View>
        ) : null}
      </View>

      {error && !isLocating && (
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
