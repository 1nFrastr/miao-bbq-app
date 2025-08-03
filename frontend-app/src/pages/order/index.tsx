import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtCard, AtForm, AtInput, AtButton, AtList, AtListItem, AtTag } from 'taro-ui'
import { 
  StorageService, 
  STORAGE_KEYS, 
  TimeUtils, 
  ValidationUtils, 
  MessageUtils 
} from '../../utils'
import { OrderItem, OrderHistory, OrderStatus } from '../../types'
import './index.scss'

export default function OrderPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [dishName, setDishName] = useState('')
  const [dishPrice, setDishPrice] = useState('')
  const [dishQuantity, setDishQuantity] = useState('1')
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending')
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [waitingTime, setWaitingTime] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  // 计算总金额
  useEffect(() => {
    const total = orderItems.reduce((sum, item) => sum + item.total, 0)
    setTotalAmount(total)
  }, [orderItems])

  // 添加菜品到订单
  const addOrderItem = () => {
    if (!ValidationUtils.isNotEmpty(dishName)) {
      MessageUtils.showError('请输入菜名')
      return
    }

    const price = parseFloat(dishPrice)
    if (!ValidationUtils.isValidPrice(price)) {
      MessageUtils.showError('请输入有效的价格')
      return
    }

    const quantity = parseInt(dishQuantity)
    if (!ValidationUtils.isValidInteger(quantity)) {
      MessageUtils.showError('请输入有效的数量')
      return
    }

    const newItem: OrderItem = {
      id: Date.now(),
      dishName: dishName.trim(),
      price,
      quantity,
      total: price * quantity
    }

    setOrderItems(prev => [...prev, newItem])
    
    // 清空表单
    setDishName('')
    setDishPrice('')
    setDishQuantity('1')

    MessageUtils.showSuccess('已添加到订单')
  }

  // 删除订单项
  const removeOrderItem = (id: number) => {
    setOrderItems(prev => prev.filter(item => item.id !== id))
    MessageUtils.showInfo('已移除菜品')
  }

  // 开始计时
  const startTimer = () => {
    if (orderItems.length === 0) {
      MessageUtils.showError('请先添加菜品')
      return
    }

    setOrderStatus('ongoing')
    const startTime = Date.now()
    
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setWaitingTime(elapsed)
    }, 1000)
    
    setTimer(timerInterval)
    MessageUtils.showInfo('开始计时，等餐中...')
  }

  // 完成订单
  const completeOrder = () => {
    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }
    
    setOrderStatus('completed')
    
    MessageUtils.showSuccess(`订单完成！等餐时间：${TimeUtils.formatTime(waitingTime)}`)

    // 保存到历史记录
    const orderHistory: OrderHistory = {
      id: Date.now(),
      items: orderItems,
      totalAmount,
      waitingTime,
      completedAt: new Date().toISOString(),
      status: 'completed'
    }

    const existingHistory = StorageService.get<OrderHistory[]>(STORAGE_KEYS.ORDER_HISTORY, [])
    StorageService.set(STORAGE_KEYS.ORDER_HISTORY, [orderHistory, ...existingHistory])
  }

  // 新建订单
  const newOrder = () => {
    setOrderItems([])
    setOrderStatus('pending')
    setWaitingTime(0)
    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }
  }

  const getStatusText = () => {
    switch (orderStatus) {
      case 'pending': return '未开始'
      case 'ongoing': return '进行中'
      case 'completed': return '已完成'
      default: return '未开始'
    }
  }

  const getStatusColor = () => {
    switch (orderStatus) {
      case 'pending': return '#6c757d'
      case 'ongoing': return '#FF6B35'
      case 'completed': return '#28a745'
      default: return '#6c757d'
    }
  }

  return (
    <View className='order-page'>
      {/* 添加菜品表单 */}
      <AtCard title='添加菜品' className='form-card'>
        <AtForm>
          <AtInput
            name='dishName'
            title='菜名'
            type='text'
            placeholder='例如：烤羊肉串'
            value={dishName}
            onChange={(value) => setDishName(value as string)}
            required
          />
          <View className='price-quantity-row'>
            <AtInput
              name='dishPrice'
              title='单价(元)'
              type='digit'
              placeholder='0.00'
              value={dishPrice}
              onChange={(value) => setDishPrice(value as string)}
              required
            />
            <AtInput
              name='dishQuantity'
              title='数量'
              type='number'
              value={dishQuantity}
              onChange={(value) => setDishQuantity(value as string)}
              required
            />
          </View>
          <AtButton 
            type='primary' 
            className='add-button'
            onClick={addOrderItem}
          >
            添加到订单
          </AtButton>
        </AtForm>
      </AtCard>

      {/* 订单列表 */}
      <AtCard title={`我的订单 (${orderItems.length} 个菜品)`} className='order-list-card'>
        {orderItems.length === 0 ? (
          <View className='empty-order'>
            <Text className='empty-text'>暂无订单，请添加菜品</Text>
          </View>
        ) : (
          <ScrollView scrollY className='order-scroll'>
            <AtList>
              {orderItems.map((item) => (
                <AtListItem
                  key={item.id}
                  title={item.dishName}
                  note={`单价：￥${item.price.toFixed(2)} × ${item.quantity}`}
                  extraText={`￥${item.total.toFixed(2)}`}
                  arrow='right'
                  onClick={() => removeOrderItem(item.id)}
                />
              ))}
            </AtList>
          </ScrollView>
        )}
      </AtCard>

      {/* 订单状态和计时 */}
      <AtCard className='status-card'>
        <View className='status-header'>
          <View className='status-info'>
            <Text className='status-label'>订单状态：</Text>
            <AtTag 
              name='status' 
              type='primary' 
              size='small'
              customStyle={{ backgroundColor: getStatusColor() }}
            >
              {getStatusText()}
            </AtTag>
          </View>
          <View className='timer-info'>
            <Text className='timer-label'>等待时间：</Text>
            <Text className='timer-value'>{TimeUtils.formatTime(waitingTime)}</Text>
          </View>
        </View>

        <View className='control-buttons'>
          {orderStatus === 'pending' && (
            <AtButton 
              type='primary' 
              size='normal'
              onClick={startTimer}
              disabled={orderItems.length === 0}
            >
              开始计时
            </AtButton>
          )}
          
          {orderStatus === 'ongoing' && (
            <AtButton 
              type='primary' 
              size='normal'
              onClick={completeOrder}
            >
              完成订单
            </AtButton>
          )}

          {orderStatus === 'completed' && (
            <AtButton 
              type='secondary' 
              size='normal'
              onClick={newOrder}
            >
              新建订单
            </AtButton>
          )}
        </View>

        <View className='total-amount'>
          <Text className='total-label'>总计金额：</Text>
          <Text className='total-value'>￥{totalAmount.toFixed(2)}</Text>
        </View>
      </AtCard>
    </View>
  )
}
