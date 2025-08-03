import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image, Textarea } from '@tarojs/components'
import { AtCard, AtForm, AtInput, AtButton, AtImagePicker, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import { 
  StorageService, 
  STORAGE_KEYS, 
  LocationService, 
  TimeUtils, 
  ValidationUtils, 
  MessageUtils 
} from '../../utils'
import { Post, SortType, UserLocation, ImageFile } from '../../types'
import './index.scss'

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [sortType, setSortType] = useState<SortType>('distance')
  
  // 表单数据
  const [shopName, setShopName] = useState('')
  const [shopLocation, setShopLocation] = useState('')
  const [shopPrice, setShopPrice] = useState('')
  const [shopComment, setShopComment] = useState('')
  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([])
  
  // 位置相关
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [currentAddress, setCurrentAddress] = useState('')
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)

  useEffect(() => {
    loadPosts()
    checkLocationPermission()
  }, [])

  useEffect(() => {
    sortPosts()
  }, [sortType, posts])

  // 检查位置权限
  const checkLocationPermission = () => {
    const permission = StorageService.get(STORAGE_KEYS.LOCATION_PERMISSION, null)
    if (permission === 'granted') {
      setLocationPermissionGranted(true)
      getUserLocation()
    } else if (permission === 'denied') {
      setLocationPermissionGranted(false)
    } else {
      // 首次访问，显示权限请求
      setShowLocationModal(true)
    }
  }

  // 获取用户位置
  const getUserLocation = async () => {
    const location = await LocationService.getUserLocation()
    if (location) {
      setUserLocation(location)
      setCurrentAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
      MessageUtils.showSuccess('位置获取成功')
    } else {
      MessageUtils.showError('位置获取失败')
    }
  }

  // 允许位置权限
  const allowLocation = () => {
    setLocationPermissionGranted(true)
    StorageService.set(STORAGE_KEYS.LOCATION_PERMISSION, 'granted')
    setShowLocationModal(false)
    getUserLocation()
  }

  // 拒绝位置权限
  const denyLocation = () => {
    setLocationPermissionGranted(false)
    StorageService.set(STORAGE_KEYS.LOCATION_PERMISSION, 'denied')
    setShowLocationModal(false)
    MessageUtils.showInfo('已拒绝位置权限，将无法显示距离信息')
  }

  // 加载帖子数据
  const loadPosts = () => {
    const savedPosts = StorageService.get<Post[]>(STORAGE_KEYS.COMMUNITY_POSTS, [])
    setPosts(savedPosts)
  }

  // 保存帖子数据
  const savePosts = (newPosts: Post[]) => {
    StorageService.set(STORAGE_KEYS.COMMUNITY_POSTS, newPosts)
    setPosts(newPosts)
  }

  // 排序帖子
  const sortPosts = () => {
    const sortedPosts = [...posts].sort((a, b) => {
      switch (sortType) {
        case 'distance':
          if (!userLocation || !a.userLocation || !b.userLocation) return 0
          const distanceA = LocationService.calculateDistance(
            userLocation.lat, userLocation.lng, 
            a.userLocation.lat, a.userLocation.lng
          )
          const distanceB = LocationService.calculateDistance(
            userLocation.lat, userLocation.lng, 
            b.userLocation.lat, b.userLocation.lng
          )
          return distanceA - distanceB
        case 'latest':
          return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
        case 'popular':
          // 简化版本，可以根据点赞数等因素排序
          return b.id - a.id
        default:
          return 0
      }
    })
    setPosts(sortedPosts)
  }

  // 图片上传
  const handleImageChange = (files: any[]) => {
    const imageFiles = files.slice(0, 3).map(file => ({ url: file.url }))
    setUploadedImages(imageFiles)
  }

  // 发布推荐
  const publishPost = () => {
    if (!ValidationUtils.isNotEmpty(shopName)) {
      MessageUtils.showError('请输入店铺名称')
      return
    }

    if (!ValidationUtils.isNotEmpty(shopLocation)) {
      MessageUtils.showError('请输入店铺地址')
      return
    }

    const price = parseFloat(shopPrice)
    if (!ValidationUtils.isValidPrice(price)) {
      MessageUtils.showError('请输入有效的人均消费')
      return
    }

    if (!ValidationUtils.isNotEmpty(shopComment)) {
      MessageUtils.showError('请输入推荐理由')
      return
    }

    const newPost: Post = {
      id: Date.now(),
      shopName: shopName.trim(),
      shopLocation: shopLocation.trim(),
      shopPrice: price,
      shopComment: shopComment.trim(),
      images: uploadedImages.map(img => img.url),
      publishTime: new Date().toISOString(),
      userLocation: userLocation || undefined
    }

    const updatedPosts = [newPost, ...posts]
    savePosts(updatedPosts)

    // 清空表单
    setShopName('')
    setShopLocation('')
    setShopPrice('')
    setShopComment('')
    setUploadedImages([])

    MessageUtils.showSuccess('发布成功')
  }

  // 格式化距离
  const formatDistance = (post: Post) => {
    if (!userLocation || !post.userLocation) return ''
    const distance = LocationService.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      post.userLocation.lat,
      post.userLocation.lng
    )
    return LocationService.formatDistance(distance)
  }

  return (
    <View className='community-page'>
      {/* 位置权限弹窗 */}
      <AtModal isOpened={showLocationModal} closeOnClickOverlay={false}>
        <AtModalHeader>启用位置服务</AtModalHeader>
        <AtModalContent>
          <View className='permission-content'>
            <Text>为了显示烧烤店距离，需要获取您的位置信息</Text>
            <Text className='permission-note'>您可以选择不允许，仍可正常使用其他功能</Text>
          </View>
        </AtModalContent>
        <AtModalAction>
          <AtButton onClick={denyLocation}>不允许</AtButton>
          <AtButton onClick={allowLocation}>允许</AtButton>
        </AtModalAction>
      </AtModal>

      {/* 发布推荐表单 */}
      <AtCard title='分享烧烤店推荐' className='publish-card'>
        <AtForm>
          <AtInput
            name='shopName'
            title='店铺名称'
            type='text'
            placeholder='例如：老王烧烤店'
            value={shopName}
            onChange={(value) => setShopName(value as string)}
            required
          />
          <AtInput
            name='shopLocation'
            title='地址位置'
            type='text'
            placeholder='例如：XX路XX号'
            value={shopLocation}
            onChange={(value) => setShopLocation(value as string)}
            required
          />
          {currentAddress && (
            <AtInput
              name='currentLocation'
              title='当前位置'
              type='text'
              value={currentAddress}
              disabled
            />
          )}
          <AtInput
            name='shopPrice'
            title='人均消费(元)'
            type='number'
            placeholder='例如：50'
            value={shopPrice}
            onChange={(value) => setShopPrice(value as string)}
            required
          />
          
          {/* 图片上传 */}
          <View className='image-upload-section'>
            <Text className='upload-label'>上传图片 (最多3张，非必填)</Text>
            <AtImagePicker
              files={uploadedImages}
              onChange={handleImageChange}
              multiple
              count={3}
              showAddBtn={uploadedImages.length < 3}
            />
          </View>
          
          {/* 推荐理由 */}
          <View className='comment-section'>
            <Text className='comment-label'>推荐理由</Text>
            <Textarea
              className='comment-textarea'
              placeholder='推荐特色菜品、价格优势或服务体验等...'
              value={shopComment}
              onInput={(e) => setShopComment(e.detail.value)}
              maxlength={200}
            />
          </View>
          
          <AtButton 
            type='primary' 
            className='publish-button'
            onClick={publishPost}
          >
            发布推荐
          </AtButton>
        </AtForm>
      </AtCard>

      {/* 排序选项 */}
      <AtCard title='社区推荐' className='posts-card'>
        <View className='sort-buttons'>
          <AtButton
            size='small'
            type={sortType === 'distance' ? 'primary' : 'secondary'}
            onClick={() => setSortType('distance')}
          >
            距离最近
          </AtButton>
          <AtButton
            size='small'
            type={sortType === 'latest' ? 'primary' : 'secondary'}
            onClick={() => setSortType('latest')}
          >
            最新发布
          </AtButton>
          <AtButton
            size='small'
            type={sortType === 'popular' ? 'primary' : 'secondary'}
            onClick={() => setSortType('popular')}
          >
            最热门
          </AtButton>
        </View>

        {/* 帖子列表 */}
        <ScrollView scrollY className='posts-scroll'>
          {posts.length === 0 ? (
            <View className='empty-posts'>
              <Text className='empty-text'>暂无推荐内容，快来发布第一条推荐吧！</Text>
            </View>
          ) : (
            <View className='posts-list'>
              {posts.map((post) => (
                <View key={post.id} className='post-item'>
                  <View className='post-header'>
                    <Text className='shop-name'>{post.shopName}</Text>
                    <View className='post-meta'>
                      <Text className='post-time'>{TimeUtils.formatRelativeTime(post.publishTime)}</Text>
                      {locationPermissionGranted && (
                        <Text className='post-distance'>{formatDistance(post)}</Text>
                      )}
                    </View>
                  </View>
                  
                  <View className='post-info'>
                    <Text className='shop-address'>📍 {post.shopLocation}</Text>
                    <Text className='shop-price'>💰 人均 ¥{post.shopPrice}</Text>
                  </View>
                  
                  {post.images.length > 0 && (
                    <View className='post-images'>
                      {post.images.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          className='post-image'
                          mode='aspectFill'
                        />
                      ))}
                    </View>
                  )}
                  
                  <View className='post-comment'>
                    <Text>{post.shopComment}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </AtCard>
    </View>
  )
}
