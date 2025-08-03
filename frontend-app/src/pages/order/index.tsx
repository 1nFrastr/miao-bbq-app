import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const Order = () => {
  Taro.useLoad(() => {
    console.log('订单页面加载')
  })

  return (
    <View className="order-page">
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
              />
            </View>
            
            <View className="form-item form-item--half">
              <Text className="form-label">数量</Text>
              <Input 
                className="form-input" 
                placeholder="1"
                placeholderClass="form-placeholder"
                type="number"
              />
            </View>
          </View>
          
          <Button className="add-button">
            <Text className="add-button__text">➕ 添加到订单</Text>
          </Button>
        </View>
      </View>

      {/* 我的订单列表 */}
      <View className="order-section">
        <View className="order-header">
          <Text className="order-title">我的订单</Text>
          <Text className="order-count">2 个菜品</Text>
        </View>
        
        <View className="order-list">
          {/* 示例订单项 - 后续会用动态数据替换 */}
          <View className="order-item">
            <View className="order-item__info">
              <Text className="order-item__name">烤羊肉串</Text>
              <Text className="order-item__price">¥3.00 × 5</Text>
            </View>
            <Text className="order-item__total">¥15.00</Text>
          </View>
          
          <View className="order-item">
            <View className="order-item__info">
              <Text className="order-item__name">烤鸡翅</Text>
              <Text className="order-item__price">¥8.00 × 2</Text>
            </View>
            <Text className="order-item__total">¥16.00</Text>
          </View>
          
          {/* 空状态 - 当没有订单时显示 */}
          {/* <View className="empty-order">
            <View className="empty-icon">📄</View>
            <Text className="empty-text">暂无订单，请添加菜品</Text>
          </View> */}
        </View>
      </View>

      {/* 底部操作区域 */}
      <View className="bottom-section">
        <View className="order-status">
          <Text className="status-label">订单状态：</Text>
          <Text className="status-value status-value--pending">未开始</Text>
          <Text className="waiting-label">等待时间：</Text>
          <Text className="waiting-time">00:00</Text>
        </View>
        
        <View className="action-buttons">
          <Button className="action-button action-button--primary">
            <Text className="action-button__icon">⏱</Text>
            <Text className="action-button__text">开始计时</Text>
          </Button>
          
          <Button className="action-button action-button--secondary">
            <Text className="action-button__icon">✅</Text>
            <Text className="action-button__text">完成订单</Text>
          </Button>
        </View>
        
        <View className="total-amount">
          <Text className="total-label">总计金额：</Text>
          <Text className="total-price">¥31.00</Text>
        </View>
      </View>
    </View>
  )
}

export default Order
