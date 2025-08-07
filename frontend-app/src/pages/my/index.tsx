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
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  Taro.useLoad(() => {
    console.log('我的页面加载')
    checkLoginAndLoadData()
  })

  Taro.useDidShow(() => {
    checkLoginAndLoadData()
  })

  // 加载我的推荐
  const loadMyPosts = useCallback(async (page: number = 1, isRefresh: boolean = true) => {
    try {
      setIsLoading(true)
      const response = await CommunityAPI.getMyPosts({
        page_size: 5,
        page: page
      })
      
      if (response.results) {
        if (isRefresh || page === 1) {
          // 如果是刷新或第一页，直接设置新数据
          setPosts(response.results)
        } else {
          // 如果是加载更多，追加到现有数据
          setPosts(prev => [...prev, ...response.results])
        }
        
        // 更新分页状态
        setHasMore(!!response.next)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('加载我的推荐失败:', error)
      MessageUtils.showError('加载失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 检查登录状态并加载数据
  const checkLoginAndLoadData = useCallback(async () => {
    const loggedIn = AuthService.isLoggedIn()
    setIsLoggedIn(loggedIn)
    
    if (loggedIn) {
      const user = AuthService.getCurrentUser()
      setUserInfo(user)
      await loadMyPosts(1, true)
    }
  }, [loadMyPosts])

  // 加载更多数据
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || isLoading) return
    
    try {
      await loadMyPosts(currentPage + 1, false)
    } catch (error) {
      console.error('加载更多失败:', error)
    }
  }, [hasMore, isLoading, currentPage, loadMyPosts])

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

  // 处理退出登录
  const handleLogout = useCallback(async () => {
    try {
      const confirmed = await MessageUtils.showConfirm(
        '退出登录',
        '确定要退出当前账号吗？'
      )
      
      if (confirmed) {
        // 执行退出登录操作
        AuthService.logout()
        
        // 清除页面状态
        setIsLoggedIn(false)
        setUserInfo(null)
        setPosts([])
        setCurrentPage(1)
        setHasMore(true)
        
        MessageUtils.showSuccess('已退出登录')
        
        // 延迟一点显示登录界面，让用户看到成功提示
        setTimeout(() => {
          checkLoginAndLoadData()
        }, 1000)
      }
    } catch (error) {
      console.error('退出登录失败:', error)
      MessageUtils.showError('退出登录失败')
    }
  }, [checkLoginAndLoadData])

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
          <AtListItem
            title="退出登录"
            arrow="right"
            iconInfo={{ value: 'close', color: '#ff3b30', size: 18 }}
            onClick={handleLogout}
          />
        </AtList>
      </View>

      {/* 我的推荐 */}
      <View className="my-posts">
        <View className="section-header">
          <Text className="section-title">我的推荐</Text>
        </View>

        {isLoading && posts.length === 0 ? (
          <View className="loading">
            <Text>加载中...</Text>
          </View>
        ) : posts.length > 0 ? (
          <View className="post-list">
            {posts.map((post) => (
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
            {hasMore && (
              <View 
                className="load-more-btn"
                onClick={loadMorePosts}
              >
                <Text className="load-more-text">
                  {isLoading ? '加载中...' : '加载更多'}
                </Text>
              </View>
            )}
            {!hasMore && posts.length > 0 && (
              <View className="no-more-text">
                <Text>已加载全部内容</Text>
              </View>
            )}
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
