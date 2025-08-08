import { View, Text, Input, Button } from '@tarojs/components'
import { AtIcon, AtInputNumber } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { Order, OrderItemForm } from '../../types'
import { OrderAPI } from '../../utils/api'
import { AuthService } from '../../utils/auth'
import { ValidationUtils, MessageUtils, TimeUtils } from '../../utils'
import './index.scss'

const OrderPage = () => {
  // 表单状态
  const [dishName, setDishName] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  
  // 订单状态
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  
  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  Taro.useLoad(() => {
    console.log('订单页面加载')
    checkLoginAndLoadOrder()
  })

  // 检查登录状态并加载订单
  const checkLoginAndLoadOrder = useCallback(async () => {
    const loggedIn = AuthService.isLoggedIn()
    setIsLoggedIn(loggedIn)
    
    if (loggedIn) {
      await loadCurrentOrder()
    }
  }, [])

  // 处理登录
  const handleLogin = useCallback(async () => {
    Taro.navigateTo({
      url: '/pages/login/index'
    })
  }, [])

  Taro.useDidShow(() => {
    // 页面显示时重新检查登录状态
    checkLoginAndLoadOrder()
  })

  // 加载当前进行中的订单
  const loadCurrentOrder = useCallback(async () => {
    if (!AuthService.isLoggedIn()) {
      return
    }

    try {
      setIsLoading(true)
      const response = await OrderAPI.getOrders({
        ordering: '-created_at',
        page_size: 1
      })
      
      if (response.results && response.results.length > 0) {
        const order = response.results[0]
        // 只显示进行中或待开始的订单
        if (order.status === 'pending' || order.status === 'processing') {
          setCurrentOrder(order)
          
          // 如果订单正在进行中，开始计时器
          if (order.status === 'processing' && order.start_time) {
            startTimerFromOrder(order)
          }
        }
      }
    } catch (error) {
      console.error('加载订单失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 从订单开始计时
  const startTimerFromOrder = useCallback((order: Order) => {
    if (order.start_time) {
      const startTime = new Date(order.start_time).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setTimer(elapsed)
      
      const interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
      setTimerInterval(interval)
    }
  }, [])

  // 清理计时器
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [timerInterval])

  // 表单验证
  const validateForm = useCallback((): boolean => {
    if (!ValidationUtils.isNotEmpty(dishName)) {
      MessageUtils.showError('请输入菜名')
      return false
    }
    
    if (!ValidationUtils.isValidPrice(unitPrice)) {
      MessageUtils.showError('请输入有效的单价')
      return false
    }
    
    if (!ValidationUtils.isValidInteger(quantity)) {
      MessageUtils.showError('请输入有效的数量')
      return false
    }
    
    return true
  }, [dishName, unitPrice, quantity])

  // 添加菜品到订单
  const handleAddItem = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      
      const itemData: OrderItemForm = {
        dish_name: dishName.trim(),
        unit_price: parseFloat(unitPrice),
        quantity: parseInt(quantity)
      }

      if (currentOrder) {
        // 添加到现有订单
        await OrderAPI.addItem(currentOrder.id, itemData)
        // 移除了烦人的成功提示
      } else {
        // 创建新订单
        const newOrder = await OrderAPI.createOrder({
          status: 'pending',
          items: [itemData]
        })
        setCurrentOrder(newOrder)
        // 移除了烦人的成功提示
      }

      // 重新加载订单数据
      await loadCurrentOrder()
      
      // 清空表单
      setDishName('')
      setUnitPrice('')
      setQuantity('1')
      
    } catch (error) {
      console.error('添加菜品失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dishName, unitPrice, quantity, currentOrder, validateForm, loadCurrentOrder])

  // 删除订单项
  const handleRemoveItem = useCallback(async (itemId: number) => {
    if (!currentOrder) return

    const confirmed = await MessageUtils.showConfirm('确认删除', '确定要删除这个菜品吗？')
    if (!confirmed) return

    try {
      setIsLoading(true)
      await OrderAPI.removeItem(currentOrder.id, itemId)
      await loadCurrentOrder()
      // 移除了烦人的成功提示
    } catch (error) {
      console.error('删除菜品失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, loadCurrentOrder])

  // 更新订单项数量
  const handleUpdateQuantity = useCallback(async (itemId: number, newQuantity: number) => {
    if (!currentOrder || newQuantity < 1) return

    try {
      setIsLoading(true)
      await OrderAPI.updateItemQuantity(currentOrder.id, itemId, newQuantity)
      await loadCurrentOrder()
    } catch (error) {
      console.error('更新数量失败:', error)
      MessageUtils.showError('更新数量失败')
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, loadCurrentOrder])

  // 处理数量变化
  const handleQuantityChange = useCallback(async (itemId: number, newQuantity: number, oldQuantity: number) => {
    if (newQuantity === oldQuantity) return
    
    if (newQuantity === 0) {
      // 当数量变为0时，提示是否删除
      const confirmed = await MessageUtils.showConfirm('删除菜品', '数量将变为0，是否要删除这个菜品？')
      if (confirmed) {
        handleRemoveItem(itemId)
      }
      // 如果用户取消删除，不做任何操作，AtInputNumber会保持原值
    } else {
      handleUpdateQuantity(itemId, newQuantity)
    }
  }, [handleUpdateQuantity, handleRemoveItem])

  // 开始计时
  const handleStartTimer = useCallback(async () => {
    if (!currentOrder) return

    try {
      setIsLoading(true)
      await OrderAPI.startTimer(currentOrder.id)
      await loadCurrentOrder()
      // 移除了烦人的成功提示
    } catch (error) {
      console.error('开始计时失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, loadCurrentOrder])

  // 完成订单
  const handleCompleteOrder = useCallback(async () => {
    if (!currentOrder) return

    const confirmed = await MessageUtils.showConfirm('完成订单', '确定要完成这个订单吗？')
    if (!confirmed) return

    try {
      setIsLoading(true)
      await OrderAPI.completeOrder(currentOrder.id)
      
      // 清理计时器
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
      }
      setTimer(0)
      setCurrentOrder(null)
      
      // 移除了烦人的成功提示，订单完成这种重要操作可以保留提示
      MessageUtils.showSuccess('订单已完成')
    } catch (error) {
      console.error('完成订单失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, timerInterval])

  // 计算总金额 - 处理字符串和数字类型
  const totalAmount = currentOrder?.items.reduce((sum, item) => {
    const subtotal = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal
    return sum + subtotal
  }, 0) || 0

  return (
    <View className="order-page">
      {!isLoggedIn ? (
        // 未登录状态
        <View className="login-prompt">
          <AtIcon value="user" size="64" color="#ccc" />
          <Text className="login-prompt__title">请先登录</Text>
          <Text className="login-prompt__desc">登录后即可使用烧烤点单记录功能</Text>
          <Button 
            className="login-prompt__btn"
            type="primary"
            onClick={handleLogin}
          >
            立即登录
          </Button>
        </View>
      ) : (
        <>
          {/* 添加菜品表单 */}
          <View className="add-dish-section">
            <View className="section-title">
              <Text className="section-title__text">添加菜品</Text>
            </View>
        
        <View className="form-container">
          <View className="form-item">
            <Text className="form-label">菜名</Text>
            <Input 
              className="form-input" 
              placeholder="例如：烤羊肉串"
              placeholderClass="form-placeholder"
              value={dishName}
              onInput={(e) => setDishName(e.detail.value)}
            />
          </View>
          
          <View className="form-row">
            <View className="form-item form-item--half">
              <Text className="form-label">单价(元)</Text>
              <Input 
                className="form-input" 
                placeholder="0.00"
                placeholderClass="form-placeholder"
                type="digit"
                value={unitPrice}
                onInput={(e) => setUnitPrice(e.detail.value)}
              />
            </View>
            
            <View className="form-item form-item--half">
              <Text className="form-label">数量</Text>
              <Input 
                className="form-input" 
                placeholder="1"
                placeholderClass="form-placeholder"
                type="number"
                value={quantity}
                onInput={(e) => setQuantity(e.detail.value)}
              />
            </View>
          </View>
          
          <Button 
            className="add-button"
            loading={isLoading}
            disabled={isLoading}
            onClick={handleAddItem}
          >
            <AtIcon value="add" size="16" color="#fff" />
            <Text className="add-button__text">添加到订单</Text>
          </Button>
        </View>
      </View>

      {/* 我的订单列表 */}
      <View className="order-section">
        <View className="order-header">
          <Text className="order-title">我的订单</Text>
          <Text className="order-count">{currentOrder?.items.length || 0} 个菜品</Text>
        </View>
        
        <View className="order-list">
          {currentOrder?.items && currentOrder.items.length > 0 ? (
            currentOrder.items.map((item) => (
              <View key={item.id} className="order-item">
                <View className="order-item__info">
                  <Text className="order-item__name">{item.dish_name}</Text>
                  <Text className="order-item__price">
                    ¥{(typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price).toFixed(2)}
                  </Text>
                </View>
                <View className="order-item__actions">
                  <Text className="order-item__total">
                    ¥{(typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal).toFixed(2)}
                  </Text>
                  <View className="order-item__controls">
                    <AtInputNumber
                      className="quantity-input"
                      type="number"
                      min={0}
                      max={999}
                      step={1}
                      value={item.quantity}
                      disabled={isLoading}
                      onChange={(value) => handleQuantityChange(item.id, value, item.quantity)}
                    />
                    <Button 
                      className="delete-button"
                      size="mini"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <AtIcon value="trash" size="12" color="#ff4757" />
                    </Button>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="empty-order">
              <AtIcon value="file-new" size="32" color="#ccc" />
              <Text className="empty-text">暂无订单，请添加菜品</Text>
            </View>
          )}
        </View>
      </View>

      {/* 底部操作区域 */}
      <View className="bottom-section">
        <View className="order-status">
          <Text className="status-label">订单状态：</Text>
          <Text className={`status-value status-value--${currentOrder?.status || 'pending'}`}>
            {currentOrder?.status === 'pending' && '未开始'}
            {currentOrder?.status === 'processing' && '进行中'}
            {currentOrder?.status === 'completed' && '已完成'}
            {!currentOrder && '无订单'}
          </Text>
          <Text className="waiting-label">等待时间：</Text>
          <Text className="waiting-time">{TimeUtils.formatTime(timer)}</Text>
        </View>
        
        <View className="action-buttons">
          <Button 
            className={`action-button ${currentOrder?.status === 'processing' ? 'action-button--disabled' : 'action-button--primary'}`}
            disabled={!currentOrder || currentOrder.status !== 'pending' || isLoading}
            loading={isLoading}
            onClick={handleStartTimer}
          >
            <AtIcon value="clock" size="16" color={currentOrder?.status === 'processing' ? "#999" : "#fff"} />
            <Text className="action-button__text">
              {currentOrder?.status === 'processing' ? '计时中...' : '开始计时'}
            </Text>
          </Button>
          
          <Button 
            className={`action-button ${currentOrder?.status === 'processing' ? 'action-button--primary' : 'action-button--secondary'}`}
            disabled={!currentOrder || currentOrder.status === 'completed' || isLoading}
            loading={isLoading}
            onClick={handleCompleteOrder}
          >
            <AtIcon value="check" size="16" color={currentOrder?.status === 'processing' ? "#fff" : "#666"} />
            <Text className="action-button__text">完成订单</Text>
          </Button>
        </View>
        
        <View className="total-amount">
          <Text className="total-label">总计金额：</Text>
          <Text className="total-price">¥{totalAmount.toFixed(2)}</Text>
        </View>
      </View>
        </>
      )}
    </View>
  )
}

export default OrderPage
