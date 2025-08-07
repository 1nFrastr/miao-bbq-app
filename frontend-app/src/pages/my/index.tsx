import { View, Text, Image } from '@tarojs/components'
import { AtIcon, AtList, AtListItem } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { Post } from '../../types'
import { CommunityAPI } from '../../utils/api'
import { AuthService } from '../../utils/auth'
import { MessageUtils } from '../../utils'
import PostCard from '../../components/PostCard'
import './index.scss'

const My = () => {
  const [posts, setPosts] = useState<Post[]>([])
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
      await loadMyPosts()
    }
  }, [])

  // 加载我的推荐
  const loadMyPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await CommunityAPI.getMyPosts({
        page_size: 20
      })
      
      if (response.results) {
        setPosts(response.results)
      }
    } catch (error) {
      console.error('加载我的推荐失败:', error)
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

  // 进入订单列表页面
  const handleOrderList = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/order-list/index'
    })
  }, [])

  // 获取审核状态文本
  const getApprovalStatusText = (status: string) => {
    const statusMap = {
      'pending': '待审核',
      'approved': '已审核',
      'rejected': '已拒绝'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  // 获取审核状态颜色
  const getApprovalStatusColor = (status: string) => {
    const colorMap = {
      'pending': '#ff9500',
      'approved': '#34c759',
      'rejected': '#ff3b30'
    }
    return colorMap[status as keyof typeof colorMap] || '#666'
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
      </View>

      {/* 功能菜单 */}
      <View className="menu-section">
        <AtList>
          <AtListItem
            title="我的订单"
            arrow="right"
            iconInfo={{ value: 'list', color: '#FF6B35', size: 18 }}
            onClick={handleOrderList}
          />
        </AtList>
      </View>

      {/* 我的推荐 */}
      <View className="my-posts">
        <View className="section-header">
          <Text className="section-title">我的推荐</Text>
        </View>

        {isLoading ? (
          <View className="loading">
            <Text>加载中...</Text>
          </View>
        ) : posts.length > 0 ? (
          <View className="post-list">
            {posts.slice(0, 3).map((post) => (
              <View key={post.id} className="post-wrapper">
                <PostCard post={post} />
                <View className="approval-status-overlay">
                  <Text 
                    className="approval-status"
                    data-status={post.status}
                    style={{ color: getApprovalStatusColor(post.status) }}
                  >
                    {getApprovalStatusText(post.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="empty-posts">
            <AtIcon value="heart" size="32" color="#ccc" />
            <Text className="empty-text">暂无推荐记录</Text>
            <Text className="empty-tip">快去分享你的美食体验吧~</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default My
