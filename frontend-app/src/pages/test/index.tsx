import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { OrderAPI, UserAPI, CommunityAPI } from '../../utils/api'
import { mockUserData, mockOrderData, mockPostData } from '../../utils/testData'
import './index.scss'

const TestPage = () => {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const testUserAPI = async () => {
    setIsLoading(true)
    try {
      addResult('开始测试用户API...')
      
      // 测试用户登录
      const loginResult = await UserAPI.login(mockUserData)
      addResult(`✅ 用户登录成功: ${loginResult.user.nickname}`)
      
      // 存储用户openid用于后续API调用
      Taro.setStorageSync('user_openid', mockUserData.openid)
      
      // 测试获取用户列表
      const usersResult = await UserAPI.getUsers({ page: 1, page_size: 10 })
      addResult(`✅ 获取用户列表成功: ${usersResult.count} 个用户`)
      
    } catch (error: any) {
      addResult(`❌ 用户API测试失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testOrderAPI = async () => {
    setIsLoading(true)
    try {
      addResult('开始测试订单API...')
      
      // 测试创建订单
      const createResult = await OrderAPI.createOrder(mockOrderData)
      addResult(`✅ 创建订单成功: ID ${createResult.id}`)
      
      const orderId = createResult.id
      
      // 测试获取订单列表
      const ordersResult = await OrderAPI.getOrders({ page: 1, page_size: 10 })
      addResult(`✅ 获取订单列表成功: ${ordersResult.count} 个订单`)
      
      // 测试开始计时
      await OrderAPI.startTimer(orderId)
      addResult(`✅ 开始计时成功`)
      
      // 测试添加菜品
      await OrderAPI.addItem(orderId, {
        dish_name: '烤蘑菇',
        unit_price: 5.00,
        quantity: 3
      })
      addResult(`✅ 添加菜品成功`)
      
      // 延迟后完成订单
      setTimeout(async () => {
        try {
          await OrderAPI.completeOrder(orderId)
          addResult(`✅ 完成订单成功`)
        } catch (error: any) {
          addResult(`❌ 完成订单失败: ${error.message}`)
        }
      }, 2000)
      
    } catch (error: any) {
      addResult(`❌ 订单API测试失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testCommunityAPI = async () => {
    setIsLoading(true)
    try {
      addResult('开始测试社区API...')
      
      // 测试创建分享
      const createResult = await CommunityAPI.createPost(mockPostData)
      addResult(`✅ 创建分享成功: ID ${createResult.id}`)
      
      const postId = createResult.id
      
      // 测试获取分享列表
      const postsResult = await CommunityAPI.getPosts({ page: 1, page_size: 10 })
      addResult(`✅ 获取分享列表成功: ${postsResult.count} 个分享`)
      
      // 测试点赞
      await CommunityAPI.likePost(postId)
      addResult(`✅ 点赞成功`)
      
    } catch (error: any) {
      addResult(`❌ 社区API测试失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const runAllTests = async () => {
    clearResults()
    addResult('开始运行所有API测试...')
    
    await testUserAPI()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testOrderAPI()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testCommunityAPI()
    
    addResult('🎉 所有测试完成!')
  }

  return (
    <View className="test-page">
      <View className="test-header">
        <Text className="test-title">API 集成测试</Text>
        <Text className="test-desc">测试小程序与后端API的集成是否正常</Text>
      </View>

      <View className="test-buttons">
        <Button 
          className="test-btn test-btn--primary" 
          loading={isLoading}
          onClick={runAllTests}
        >
          运行所有测试
        </Button>
        
        <View className="test-btn-row">
          <Button 
            className="test-btn test-btn--secondary" 
            loading={isLoading}
            onClick={testUserAPI}
          >
            测试用户API
          </Button>
          
          <Button 
            className="test-btn test-btn--secondary" 
            loading={isLoading}
            onClick={testOrderAPI}
          >
            测试订单API
          </Button>
          
          <Button 
            className="test-btn test-btn--secondary" 
            loading={isLoading}
            onClick={testCommunityAPI}
          >
            测试社区API
          </Button>
        </View>
        
        <Button 
          className="test-btn test-btn--clear" 
          onClick={clearResults}
        >
          清空结果
        </Button>
      </View>

      <View className="test-results">
        <Text className="results-title">测试结果:</Text>
        <View className="results-list">
          {testResults.length === 0 ? (
            <Text className="results-empty">暂无测试结果</Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} className="results-item">
                {result}
              </Text>
            ))
          )}
        </View>
      </View>
    </View>
  )
}

export default TestPage
