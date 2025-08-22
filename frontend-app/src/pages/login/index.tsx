import { View, Button, Text, CheckboxGroup, Checkbox } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { AuthService } from '../../utils/auth'
import './index.scss'

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)

  // 处理协议勾选
  const handleAgreementChange = (e) => {
    console.log('协议勾选状态:', e.detail.value)
    setIsAgreed(e.detail.value.includes('agree'))
  }

  // 微信登录
  const handleWechatLogin = async () => {
    if (isLoading) return

    // 检查是否同意协议
    if (!isAgreed) {
      Taro.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none',
        duration: 2000
      })
      return
    }

    try {
      setIsLoading(true)
      const user = await AuthService.loginWithWechat()
      
      if (user) {
        // 登录成功，返回上一页或首页
        const pages = Taro.getCurrentPages()
        if (pages.length > 1) {
          Taro.navigateBack()
        } else {
          Taro.switchTab({
            url: '/pages/order/index'
          })
        }
      }
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  Taro.useLoad(() => {
    console.log('登录页面加载')
  })

  return (
    <View className="login">
      <View className="login__header">
        <View className="login__logo-wrapper">
          <AtIcon value="user" size="48" color="#FF6B35" />
        </View>
        <Text className="login__title">烧烤点单记录</Text>
        <Text className="login__subtitle">记录美好的烧烤时光</Text>
      </View>

      <View className="login__content">
        <View className="login__tips">
          <Text className="login__tips-text">请使用微信登录以享受完整功能</Text>
        </View>

        <Button 
          className={`login__btn ${!isAgreed ? 'login__btn--disabled' : ''}`}
          type="primary"
          loading={isLoading}
          disabled={isLoading || !isAgreed}
          onClick={handleWechatLogin}
        >
          {isLoading ? '登录中...' : '微信登录'}
        </Button>

        <View className="login__agreement">
          <CheckboxGroup onChange={handleAgreementChange}>
            <Checkbox
              className="login__agreement-checkbox"
              value="agree"
              checked={isAgreed}
            />
          </CheckboxGroup>
          <Text className="login__agreement-text">
            我已阅读并同意
            <Text className="login__agreement-link">《隐私政策》</Text>
            和
            <Text className="login__agreement-link">《用户协议》</Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

export default Login
