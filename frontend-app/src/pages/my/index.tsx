import { View, Text, Image } from '@tarojs/components'
import { AtIcon, AtList, AtListItem } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { Order } from '../../types'
import { OrderAPI } from '../../utils/api'
import { AuthService } from '../../utils/auth'
import { MessageUtils } from '../../utils'
import './index.scss'

const My = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  Taro.useLoad(() => {
    console.log('我的页面加载')
    checkLoginAndLoadData()
  })

  Taro.useDidShow(() => {
    checkLoginAndLoadData()
  })

  // 检查登录状态并加载数据
  const checkLoginAndLoadData = useCallback(async () => {
    const loggedIn = AuthService.isLoggedIn()
    setIsLoggedIn(loggedIn)
    
    if (loggedIn) {
      const user = AuthService.getCurrentUser()
      setUserInfo(user)
      await loadOrderHistory()
    }
  }, [])

  // 加载订单历史
  const loadOrderHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await OrderAPI.getOrders({
        ordering: '-created_at',
        page_size: 20
      })
      
      if (response.results) {
        setOrders(response.results)
      }
    } catch (error) {
      console.error('加载订单历史失败:', error)
      MessageUtils.showError('加载失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 处理登录
  const handleLogin = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/login/index'
    })
  }, [])

  // 查看订单详情
  const handleOrderDetail = useCallback((orderId: number) => {
    Taro.navigateTo({
      url: `/pages/order-detail/index?orderId=${orderId}`
    })
  }, [])

  // 格式化订单状态
  const getOrderStatusText = (status: string) => {
    const statusMap = {
      'pending': '待处理',
      'preparing': '准备中',
      'ready': '已完成',
      'completed': '已完成'
    }
    return statusMap[status] || status
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colorMap = {
      'pending': '#ff9500',
      'preparing': '#007aff',
      'ready': '#34c759',
      'completed': '#34c759'
    }
    return colorMap[status] || '#666'
  }

  if (!isLoggedIn) {
    return (
      <View className="my-page">
        <View className="login-prompt">
          <AtIcon value="user" size="48" color="#ccc" />
          <Text className="prompt-text">请先登录查看个人信息</Text>
          <View className="login-btn" onClick={handleLogin}>
            <Text className="btn-text">立即登录</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="my-page">
      {/* 用户信息头部 */}
      <View className="user-header">
        <View className="user-info">
          <View className="avatar">
            {userInfo?.avatar_url ? (
              <Image 
                className="avatar-img" 
                src={userInfo.avatar_url} 
                mode="aspectFill"
              />
            ) : (
              <View className="avatar-placeholder">
                <AtIcon value="user" size="32" color="#fff" />
              </View>
            )}
          </View>
          <View className="user-details">
            <Text className="nickname">{userInfo?.nickname || '用户'}</Text>
            <Text className="user-id">ID: {userInfo?.id}</Text>
          </View>
        </View>
        {/* <View className="user-stats">
          <View className="stat-item">
            <Text className="stat-number">{orders.length}</Text>
            <Text className="stat-label">订单数</Text>
          </View>
        </View> */}
      </View>

      {/* 功能菜单 */}
      <View className="menu-section">
        <AtList>
          <AtListItem
            title="我的订单"
            extraText={`${orders.length}个`}
            arrow="right"
            iconInfo={{ value: 'list', color: '#FF6B35', size: 18 }}
          />
          <AtListItem
            title="我的推荐"
            arrow="right"
            iconInfo={{ value: 'heart', color: '#FF6B35', size: 18 }}
            onClick={() => Taro.navigateTo({ url: '/pages/community/index' })}
          />
        </AtList>
      </View>

      {/* 订单历史 */}
      <View className="order-history">
        <View className="section-header">
          <Text className="section-title">最近订单</Text>
          <Text className="section-more">查看全部</Text>
        </View>

        {isLoading ? (
          <View className="loading">
            <Text>加载中...</Text>
          </View>
        ) : orders.length > 0 ? (
          <View className="order-list">
            {orders.slice(0, 5).map((order) => (
              <View 
                key={order.id} 
                className="order-item"
                onClick={() => handleOrderDetail(order.id)}
              >
                <View className="order-header">
                  <Text className="order-id">订单 #{order.id}</Text>
                  <Text 
                    className="order-status"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {getOrderStatusText(order.status)}
                  </Text>
                </View>
                <View className="order-content">
                  <Text className="order-items">
                    {order.items?.length || 0} 个菜品
                  </Text>
                  <Text className="order-amount">¥{order.total_amount}</Text>
                </View>
                <Text className="order-time">
                  {new Date(order.created_at).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="empty-orders">
            <AtIcon value="shopping-cart" size="32" color="#ccc" />
            <Text className="empty-text">暂无订单记录</Text>
            <Text className="empty-tip">快去点单吧~</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default My
