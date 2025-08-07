import { View, Text, Input, Textarea, Button } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { Post, PostFormData, LocationData } from '../../types'
import { CommunityAPI } from '../../utils/api'
import { AuthService } from '../../utils/auth'
import { ValidationUtils, MessageUtils } from '../../utils'
import LocationPicker from '../../components/LocationPicker'
import './index.scss'

const Community = () => {
  // 表单状态
  const [formData, setFormData] = useState<PostFormData>({
    shop_name: '',
    shop_location: '',
    shop_price: '',
    comment: ''
  })
  
  // 位置状态
  const [locationData, setLocationData] = useState<LocationData | undefined>()
  
  // 社区状态
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  Taro.useLoad(() => {
    console.log('社区推荐页面加载')
    checkLoginAndLoadPosts()
  })

  // 检查登录状态并加载帖子
  const checkLoginAndLoadPosts = useCallback(async () => {
    const loggedIn = AuthService.isLoggedIn()
    setIsLoggedIn(loggedIn)
    await loadPosts()
  }, [])

  Taro.useDidShow(() => {
    checkLoginAndLoadPosts()
  })

  // 加载帖子列表
  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await CommunityAPI.getPosts({
        ordering: '-created_at',
        page_size: 10
      })
      
      if (response.results) {
        setPosts(response.results)
      }
    } catch (error) {
      console.error('加载帖子失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 处理表单输入
  const handleInputChange = useCallback((field: keyof PostFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // 表单验证
  const validateForm = useCallback((): boolean => {
    if (!ValidationUtils.isNotEmpty(formData.shop_name)) {
      MessageUtils.showError('请输入店铺名称')
      return false
    }
    
    if (!ValidationUtils.isNotEmpty(formData.shop_location)) {
      MessageUtils.showError('请输入地址位置')
      return false
    }
    
    if (!ValidationUtils.isValidPrice(formData.shop_price)) {
      MessageUtils.showError('请输入有效的人均消费')
      return false
    }
    
    if (!ValidationUtils.isNotEmpty(formData.comment)) {
      MessageUtils.showError('请输入推荐理由')
      return false
    }
    
    return true
  }, [formData])

  // 处理登录
  const handleLogin = useCallback(async () => {
    Taro.navigateTo({
      url: '/pages/login/index'
    })
  }, [])

  // 处理位置变化
  const handleLocationChange = useCallback((location: LocationData) => {
    setLocationData(location)
  }, [])

  // 发布推荐
  const handlePublish = useCallback(async () => {
    if (!isLoggedIn) {
      await handleLogin()
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      
      const postData = {
        shop_name: formData.shop_name.trim(),
        shop_location: formData.shop_location.trim(),
        shop_price: parseFloat(formData.shop_price),
        comment: formData.comment.trim(),
        // 添加位置信息
        ...(locationData?.isLocationEnabled && {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          location_address: locationData.address
        })
      }

      await CommunityAPI.createPost(postData)
      MessageUtils.showSuccess('发布成功')
      
      // 清空表单并重新加载列表
      setFormData({
        shop_name: '',
        shop_location: '',
        shop_price: '',
        comment: ''
      })
      setLocationData(undefined)
      await loadPosts()
      
    } catch (error) {
      console.error('发布失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [formData, locationData, isLoggedIn, validateForm, handleLogin, loadPosts])

  return (
    <View className="community-page">
      {/* 推荐发布表单 */}
      <View className="recommend-form">
        <View className="form-section">
          <Text className="section-title">分享烧烤店推荐</Text>
          
          <View className="form-item">
            <Text className="form-label">店铺名称</Text>
            <Input 
              className="form-input" 
              placeholder="例如：老王烧烤店"
              value={formData.shop_name}
              onInput={(e) => handleInputChange('shop_name', e.detail.value)}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">地址位置</Text>
            <Input 
              className="form-input" 
              placeholder="例如：XX路XX号"
              value={formData.shop_location}
              onInput={(e) => handleInputChange('shop_location', e.detail.value)}
            />
          </View>

          {/* 位置选择器 */}
          <LocationPicker
            value={locationData}
            onChange={handleLocationChange}
            placeholder="获取当前位置"
          />

          <View className="form-item">
            <Text className="form-label">人均消费 (元)</Text>
            <Input 
              className="form-input" 
              placeholder="例如：50" 
              type="digit"
              value={formData.shop_price}
              onInput={(e) => handleInputChange('shop_price', e.detail.value)}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">推荐理由</Text>
            <Textarea 
              className="form-textarea" 
              placeholder="推荐特色菜品、价格优势或服务体验等..." 
              maxlength={500}
              value={formData.comment}
              onInput={(e) => handleInputChange('comment', e.detail.value)}
            />
          </View>

          <Button 
            className="publish-btn"
            loading={isLoading}
            disabled={isLoading}
            onClick={handlePublish}
          >
            <AtIcon value="send" size="16" color="#fff" />
            <Text className="btn-text">发布推荐</Text>
          </Button>
        </View>
      </View>

      {/* 社区推荐列表 */}
      <View className="community-section">
        <View className="section-header">
          <Text className="section-title">社区推荐</Text>
          <View className="filter-tabs">
            <Text className="tab-item tab-item--active">距离最近</Text>
            <Text className="tab-item">最新</Text>
            <Text className="tab-item">最热门</Text>
          </View>
        </View>

        <View className="posts-list">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <View key={post.id} className="post-item">
                <View className="post-header">
                  <Text className="shop-name">{post.shop_name}</Text>
                  <Text className="shop-price">¥{post.shop_price}/人</Text>
                </View>
                <Text className="shop-location">{post.shop_location}</Text>
                <Text className="post-comment">{post.comment}</Text>
                <View className="post-stats">
                  <View className="stat-item">
                    <AtIcon value="heart" size="14" color="#ff4757" />
                    <Text className="stat-text">{post.likes_count}</Text>
                  </View>
                  <View className="stat-item">
                    <AtIcon value="eye" size="14" color="#666" />
                    <Text className="stat-text">{post.view_count}</Text>
                  </View>
                  <Text className="post-time">{new Date(post.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            ))
          ) : (
            <View className="empty-posts">
              <AtIcon value="message" size="32" color="#ccc" />
              <Text className="empty-text">暂无推荐，快来分享你的发现吧~</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default Community
