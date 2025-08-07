import { View, Text, Button } from '@tarojs/components'
import { AtIcon, AtCard, AtList, AtListItem } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { OrderAPI } from '../../utils/api'
import { MessageUtils, TimeUtils } from '../../utils'
import { Order } from '../../types'
import './index.scss'

const OrderDetailPage = () => {
  // 状态管理
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 页面加载
  Taro.useLoad((options) => {
    console.log('订单详情页面加载', options)
    if (options.orderId) {
      loadOrderDetail(parseInt(options.orderId))
    } else {
      MessageUtils.showError('缺少订单ID参数')
      Taro.navigateBack()
    }
  })

  // 加载订单详情
  const loadOrderDetail = useCallback(async (orderId: number) => {
    try {
      setIsLoading(true)
      const orderData = await OrderAPI.getOrderDetail(orderId)
      setOrder(orderData)
    } catch (error) {
      console.error('加载订单详情失败:', error)
      MessageUtils.showError('加载订单详情失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 格式化订单状态
  const getOrderStatusText = (status: string) => {
    const statusMap = {
      'pending': '待开始',
      'processing': '进行中', 
      'completed': '已完成'
    }
    return statusMap[status] || status
  }

  // 获取状态颜色类
  const getStatusClass = (status: string) => {
    const statusClassMap = {
      'pending': 'status--pending',
      'processing': 'status--processing',
      'completed': 'status--completed'
    }
    return statusClassMap[status] || ''
  }

  // 计算总金额
  const totalAmount = order?.items.reduce((sum, item) => {
    const subtotal = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal
    return sum + subtotal
  }, 0) || 0

  // 返回上一页
  const handleGoBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  // 重新进入订单
  const handleReenterOrder = useCallback(() => {
    Taro.switchTab({
      url: '/pages/order/index'
    })
  }, [])

  if (isLoading) {
    return (
      <View className="order-detail-page">
        <View className="loading-container">
          <AtIcon value="loading-3" size="32" color="#FF6B35" />
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    )
  }

  if (!order) {
    return (
      <View className="order-detail-page">
        <View className="error-container">
          <AtIcon value="close-circle" size="64" color="#ccc" />
          <Text className="error-text">订单不存在</Text>
          <Button className="back-button" onClick={handleGoBack}>
            返回
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="order-detail-page">
      {/* 订单基本信息 */}
      <AtCard
        title="订单信息"
        className="order-info-card"
      >
        <View className="order-info">
          <View className="info-row">
            <Text className="info-label">订单编号</Text>
            <Text className="info-value">#{order.id}</Text>
          </View>
          
          <View className="info-row">
            <Text className="info-label">订单状态</Text>
            <Text className={`info-value order-status ${getStatusClass(order.status)}`}>
              {getOrderStatusText(order.status)}
            </Text>
          </View>
          
          <View className="info-row">
            <Text className="info-label">创建时间</Text>
            <Text className="info-value">
              {TimeUtils.formatDate(order.created_at)}
            </Text>
          </View>
          
          {order.start_time && (
            <View className="info-row">
              <Text className="info-label">开始时间</Text>
              <Text className="info-value">
                {TimeUtils.formatDate(order.start_time)}
              </Text>
            </View>
          )}
          
          {order.complete_time && (
            <View className="info-row">
              <Text className="info-label">完成时间</Text>
              <Text className="info-value">
                {TimeUtils.formatDate(order.complete_time)}
              </Text>
            </View>
          )}
          
          {order.waiting_seconds > 0 && (
            <View className="info-row">
              <Text className="info-label">等待时长</Text>
              <Text className="info-value highlight">
                {TimeUtils.formatTime(order.waiting_seconds)}
              </Text>
            </View>
          )}
        </View>
      </AtCard>

      {/* 菜品列表 */}
      <AtCard
        title={`菜品清单 (${order.items.length}项)`}
        className="items-card"
      >
        <AtList hasBorder={false}>
          {order.items.map((item) => (
            <AtListItem
              key={item.id}
              title={item.dish_name}
              note={`单价：¥${typeof item.unit_price === 'string' ? parseFloat(item.unit_price).toFixed(2) : item.unit_price.toFixed(2)} × ${item.quantity}`}
              extraText={`¥${typeof item.subtotal === 'string' ? parseFloat(item.subtotal).toFixed(2) : item.subtotal.toFixed(2)}`}
            />
          ))}
        </AtList>
      </AtCard>

      {/* 费用统计 */}
      <AtCard
        title="费用统计"
        className="summary-card"
      >
        <View className="summary-info">
          <View className="summary-row">
            <Text className="summary-label">菜品数量</Text>
            <Text className="summary-value">{order.item_count} 项</Text>
          </View>
          
          <View className="summary-row total-row">
            <Text className="summary-label">总计金额</Text>
            <Text className="summary-value total-amount">¥{totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </AtCard>

      {/* 底部操作区域 */}
      <View className="bottom-actions">
        <Button 
          className="action-btn back-btn"
          onClick={handleGoBack}
        >
          <AtIcon value="chevron-left" size="16" color="#666" />
          <Text className="btn-text">返回</Text>
        </Button>
        
        {order.status !== 'completed' && (
          <Button 
            className="action-btn reenter-btn"
            onClick={handleReenterOrder}
          >
            <AtIcon value="edit" size="16" color="#fff" />
            <Text className="btn-text">继续编辑</Text>
          </Button>
        )}
      </View>
    </View>
  )
}

export default OrderDetailPage
