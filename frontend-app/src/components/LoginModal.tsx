import { View, Text, Button } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import React from 'react'
import { AuthService } from '../utils/auth'
import './LoginModal.scss'

interface LoginModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose, onSuccess }) => {
  const handleLogin = async () => {
    const user = await AuthService.loginWithWechat()
    if (user) {
      onSuccess()
      onClose()
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!visible) return null

  return (
    <View className="login-modal">
      <View className="login-modal__overlay" onClick={handleClose} />
      <View className="login-modal__content">
        <View className="login-header">
          <AtIcon value="user" size="48" color="#FF6B35" />
          <Text className="login-title">登录提示</Text>
          <Text className="login-desc">需要登录后才能使用订单功能</Text>
        </View>
        
        <View className="login-actions">
          <Button className="login-button" onClick={handleLogin}>
            <AtIcon value="user" size="16" color="#fff" />
            <Text className="login-button__text">微信登录</Text>
          </Button>
          
          <Button className="cancel-button" onClick={handleClose}>
            取消
          </Button>
        </View>
      </View>
    </View>
  )
}

export default LoginModal
