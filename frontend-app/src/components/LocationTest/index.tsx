import { View, Text, Button } from '@tarojs/components'
import React from 'react'
import { useLocationStore } from '../../store'
import './LocationTest.scss'

const LocationTest: React.FC = () => {
  const {
    userLocation,
    isLoading,
    error,
    isInitialized,
    initializeLocation,
    refreshLocation,
    getCurrentLocation,
    clearLocation
  } = useLocationStore()

  const handleInitialize = async () => {
    await initializeLocation()
  }

  const handleRefresh = async () => {
    await refreshLocation()
  }

  const handleGetCurrent = async () => {
    await getCurrentLocation()
  }

  const handleClear = () => {
    clearLocation()
  }

  return (
    <View className="location-test">
      <Text className="title">位置状态测试</Text>
      
      <View className="status-section">
        <Text className="section-title">当前状态</Text>
        <Text className="status-item">初始化状态: {isInitialized ? '已初始化' : '未初始化'}</Text>
        <Text className="status-item">加载状态: {isLoading ? '加载中' : '空闲'}</Text>
        <Text className="status-item">错误信息: {error || '无错误'}</Text>
        <Text className="status-item">
          位置信息: {userLocation ? 
            `${userLocation.address} (${userLocation.latitude}, ${userLocation.longitude})` : 
            '无位置信息'}
        </Text>
      </View>

      <View className="button-section">
        <Text className="section-title">操作按钮</Text>
        <Button 
          className="test-button" 
          onClick={handleInitialize}
          disabled={isLoading}
        >
          初始化位置
        </Button>
        <Button 
          className="test-button" 
          onClick={handleGetCurrent}
          disabled={isLoading}
        >
          获取当前位置
        </Button>
        <Button 
          className="test-button" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          刷新位置
        </Button>
        <Button 
          className="test-button" 
          onClick={handleClear}
          disabled={isLoading}
        >
          清除位置
        </Button>
      </View>
    </View>
  )
}

export default React.memo(LocationTest)
