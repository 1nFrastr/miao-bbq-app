import { View, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { Order } from '../../types'
import { OrderAPI } from '../../utils/api'
import { MessageUtils } from '../../utils'
import './index.scss'

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  Taro.useLoad(() => {
    console.log('订单列表页面加载')
    loadOrders()
  })

  // 加载订单列表
  const loadOrders = useCallback(async (isLoadMore = false) => {
    try {
      setIsLoading(true)
      const currentPage = isLoadMore ? page + 1 : 1
      
      const response = await OrderAPI.getOrders({
        page: currentPage,
        page_size: 10,
        ordering: '-created_at'
      })
      
      if (response.results) {
        if (isLoadMore) {
          setOrders(prev => [...prev, ...response.results])
          setPage(currentPage)
        } else {
          setOrders(response.results)
          setPage(1)
        }
        
        // 检查是否还有更多数据
        setHasMore(!!response.next)
      }
    } catch (error) {
      console.error('加载订单列表失败:', error)
      MessageUtils.showError('加载失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [page])

  // 加载更多
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadOrders(true)
    }
  }, [hasMore, isLoading, loadOrders])

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

  return (
    <View className="order-list-page">
      {/* 页面标题 */}
      <View className="page-header">
        <Text className="page-title">我的订单</Text>
      </View>

      {/* 订单列表 */}
      {isLoading && orders.length === 0 ? (
        <View className="loading">
          <Text>加载中...</Text>
        </View>
      ) : orders.length > 0 ? (
        <View className="orders-container">
          {orders.map((order) => (
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
          
          {/* 加载更多 */}
          {hasMore && (
            <View className="load-more" onClick={loadMore}>
              <Text className="load-more-text">
                {isLoading ? '加载中...' : '点击加载更多'}
              </Text>
            </View>
          )}
          
          {!hasMore && orders.length > 0 && (
            <View className="no-more">
              <Text className="no-more-text">没有更多订单了</Text>
            </View>
          )}
        </View>
      ) : (
        <View className="empty-orders">
          <AtIcon value="shopping-cart" size="48" color="#ccc" />
          <Text className="empty-text">暂无订单记录</Text>
          <Text className="empty-tip">快去点单吧~</Text>
          <View 
            className="go-order-btn"
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <Text className="btn-text">去点单</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default OrderList
