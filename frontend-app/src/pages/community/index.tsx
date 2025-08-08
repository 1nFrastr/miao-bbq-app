import { View, Text, Input, Textarea } from '@tarojs/components'
import { AtIcon, AtTabs, AtTabsPane } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { Post, PostFormData, LocationData, SortType } from '../../types'
import { CommunityAPI } from '../../utils/api'
import { AuthService } from '../../utils/auth'
import { ValidationUtils, MessageUtils, LocationUtils } from '../../utils'
import { useUserLocation } from '../../hooks/useUserLocation'
import LocationPicker from '../../components/LocationPicker'
import ImageUploader from '../../components/ImageUploader'
import PostCard from '../../components/PostCard'
import './index.scss'

const Community = () => {
  // 用户位置管理
  const { userLocation, isLoading: isLocationLoading, calculateDistance, refreshLocation, hasValidLocation } = useUserLocation()
  
  // 表单状态
  const [formData, setFormData] = useState<PostFormData>({
    shop_name: '',
    shop_price: '',
    comment: ''
  })
  
  // 位置状态 - 现在从全局位置状态中获取
  const [locationData, setLocationData] = useState<LocationData | undefined>()
  
  // 图片状态
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  
  // 社区状态
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  
  // 排序状态
  const [currentSort, setCurrentSort] = useState<SortType>('distance')
  const [tabList] = useState([
    { title: '距离最近' },
    { title: '最新' },
    { title: '最热门' }
  ])
  const [currentTab, setCurrentTab] = useState(0)

  // 同步全局位置状态到表单位置状态
  useEffect(() => {
    if (hasValidLocation && userLocation) {
      setLocationData({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address,
        isLocationEnabled: true
      })
    }
  }, [hasValidLocation, userLocation])

  Taro.useLoad(() => {
    console.log('社区推荐页面加载')
    checkLoginStatus()
  })

  // 检查登录状态
  const checkLoginStatus = useCallback(async () => {
    const loggedIn = AuthService.isLoggedIn()
    setIsLoggedIn(loggedIn)
    await loadPosts(currentSort)
  }, [currentSort])

  // 加载帖子列表
  const loadPosts = useCallback(async (sortType: SortType = 'distance', page: number = 1, isRefresh: boolean = true) => {
    try {
      setIsLoading(true)
      
      let ordering = '-created_at' // 默认按创建时间倒序
      let params: any = {
        page_size: 5, // 修改为5条每页
        page: page
      }
      
      // 根据排序类型设置参数
      switch (sortType) {
        case 'distance':
          // 如果有用户位置，使用用户位置按距离排序
          if (hasValidLocation && userLocation?.latitude && userLocation?.longitude) {
            params.lat = LocationUtils.formatLatitude(userLocation.latitude)
            params.lng = LocationUtils.formatLongitude(userLocation.longitude)
            params.ordering = 'distance'
          } else {
            // 没有位置信息时，按创建时间排序
            ordering = '-created_at'
          }
          break
        case 'latest':
          ordering = '-created_at'
          break
        case 'popular':
          ordering = '-likes_count,-view_count'
          break
      }
      
      if (!params.ordering) {
        params.ordering = ordering
      }
      
      const response = await CommunityAPI.getPosts(params)
      
      if (response.results) {
        // 为每个帖子计算距离（只有在有有效用户位置时）
        const postsWithDistance = response.results.map(post => {
          if (hasValidLocation && userLocation && post.latitude && post.longitude) {
            const distance = calculateDistance(post.latitude, post.longitude)
            return {
              ...post,
              distance: distance ? Math.round(distance * 1000) : undefined // 转换为米，计算失败时为undefined
            }
          }
          return post
        })
        
        if (isRefresh || page === 1) {
          // 如果是刷新或第一页，直接设置新数据
          setPosts(postsWithDistance)
        } else {
          // 如果是加载更多，追加到现有数据
          setPosts(prev => [...prev, ...postsWithDistance])
        }
        
        // 更新分页状态
        setHasMore(!!response.next)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('加载帖子失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [hasValidLocation, userLocation, calculateDistance])

  // 检查登录状态并加载帖子
  const checkLoginAndLoadPosts = useCallback(async () => {
    const loggedIn = AuthService.isLoggedIn()
    setIsLoggedIn(loggedIn)
    await loadPosts(currentSort, 1, true)
  }, [loadPosts, currentSort])

  // 加载更多数据
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || isLoading) return
    
    await loadPosts(currentSort, currentPage + 1, false)
  }, [hasMore, isLoading, currentSort, currentPage, loadPosts])

  Taro.useDidShow(() => {
    checkLoginAndLoadPosts()
  })

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
    
    if (!locationData?.isLocationEnabled) {
      MessageUtils.showError('请获取店铺位置')
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
  }, [formData, locationData])

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

  // 处理重新定位
  const handleRefreshLocation = useCallback(async () => {
    await refreshLocation()
    // 重新定位后，刷新帖子列表
    await loadPosts(currentSort, 1, true)
  }, [refreshLocation, loadPosts, currentSort])

  // 处理tab切换
  const handleTabChange = useCallback(async (value: number) => {
    setCurrentTab(value)
    let sortType: SortType = 'distance'
    
    switch (value) {
      case 0:
        sortType = 'distance'
        break
      case 1:
        sortType = 'latest'
        break
      case 2:
        sortType = 'popular'
        break
    }
    
    setCurrentSort(sortType)
    setCurrentPage(1)
    setHasMore(true)
    await loadPosts(sortType, 1, true)
  }, [loadPosts])

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
      
      // 构建图片数组（如果有图片的话）
      const images = selectedImages.length > 0 
        ? selectedImages.map(url => ({ image_url: url }))
        : []
      
      const postData = {
        shop_name: formData.shop_name.trim(),
        shop_price: parseFloat(formData.shop_price),
        comment: formData.comment.trim(),
        // 添加位置信息，限制经纬度精度避免后端报错
        ...(locationData?.isLocationEnabled && {
          latitude: LocationUtils.formatLatitude(locationData.latitude), // 安全处理纬度精度
          longitude: LocationUtils.formatLongitude(locationData.longitude), // 安全处理经度精度
          location_address: locationData.address
        }),
        // 添加图片信息
        ...(images.length > 0 && { images })
      }

      await CommunityAPI.createPost(postData)
      MessageUtils.showSuccess('发布成功')
      
      // 清空表单并重新加载列表
      setFormData({
        shop_name: '',
        shop_price: '',
        comment: ''
      })
      setLocationData(undefined)
      setSelectedImages([])
      setCurrentPage(1)
      setHasMore(true)
      await loadPosts(currentSort, 1, true)
      
    } catch (error) {
      console.error('发布失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [formData, locationData, selectedImages, isLoggedIn, validateForm, handleLogin, loadPosts, currentSort])

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
              className="form-textarea form-textarea--compact" 
              placeholder="推荐特色菜品、价格优势或服务体验等..." 
              maxlength={300}
              value={formData.comment}
              onInput={(e) => handleInputChange('comment', e.detail.value)}
            />
          </View>

          {/* 图片上传组件 */}
          <View className="form-item">
            <Text className="form-label">店铺图片 (最多3张)</Text>
            <ImageUploader
              value={selectedImages}
              onChange={setSelectedImages}
              maxCount={3}
              disabled={isLoading}
            />
          </View>

          <View 
            className="publish-btn"
            onClick={handlePublish}
          >
            <AtIcon value="add-circle" size="20" color="#fff" />
            <Text className="btn-text">发布推荐</Text>
          </View>
        </View>
      </View>

      {/* 社区推荐列表 */}
      <View className="community-section">
        <View className="section-header">
          <View className="header-left">
            <Text className="section-title">社区推荐</Text>
            {hasValidLocation && userLocation && (
              <Text className="location-info">
                <AtIcon value="map-pin" size="12" color="#666" />
                {userLocation.address}
              </Text>
            )}
            {isLocationLoading && (
              <Text className="location-info">
                <AtIcon value="loading-3" size="12" color="#ff6b35" />
                正在获取位置...
              </Text>
            )}
            {!hasValidLocation && !isLocationLoading && (
              <Text className="location-info location-info--error">
                <AtIcon value="alert-circle" size="12" color="#ff6b35" />
                位置获取失败，无法显示距离
              </Text>
            )}
          </View>
          <View className="header-right">
            <View 
              className={`refresh-location-btn ${isLocationLoading ? 'refresh-location-btn--loading' : ''}`}
              onClick={isLocationLoading ? undefined : handleRefreshLocation}
            >
              <AtIcon value={isLocationLoading ? "loading-3" : "reload"} size="14" color="#007aff" />
              <Text className="btn-text">{isLocationLoading ? '定位中...' : '重新定位'}</Text>
            </View>
          </View>
        </View>
        
        <AtTabs
          current={currentTab}
          tabList={tabList}
          onClick={handleTabChange}
        >
          <AtTabsPane current={currentTab} index={0}>
            <View className="posts-list">
              {posts && posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} showDistance={true} />
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
                </>
              ) : (
                <View className="empty-posts">
                  <AtIcon value="message" size="32" color="#ccc" />
                  <Text className="empty-text">暂无推荐，快来分享你的发现吧~</Text>
                </View>
              )}
            </View>
          </AtTabsPane>
          
          <AtTabsPane current={currentTab} index={1}>
            <View className="posts-list">
              {posts && posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} showDistance={false} />
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
                </>
              ) : (
                <View className="empty-posts">
                  <AtIcon value="message" size="32" color="#ccc" />
                  <Text className="empty-text">暂无推荐，快来分享你的发现吧~</Text>
                </View>
              )}
            </View>
          </AtTabsPane>
          
          <AtTabsPane current={currentTab} index={2}>
            <View className="posts-list">
              {posts && posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} showDistance={false} />
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
                </>
              ) : (
                <View className="empty-posts">
                  <AtIcon value="message" size="32" color="#ccc" />
                  <Text className="empty-text">暂无推荐，快来分享你的发现吧~</Text>
                </View>
              )}
            </View>
          </AtTabsPane>
        </AtTabs>
      </View>
    </View>
  )
}

export default Community
