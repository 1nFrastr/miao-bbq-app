import { View, Text, Image } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import React from 'react'
import { Post } from '../../types'
import { TimeUtils, LocationUtils } from '../../utils'
import './index.scss'
import Taro from '@tarojs/taro'

interface PostCardProps {
  post: Post
  showDistance?: boolean
}

const PostCard: React.FC<PostCardProps> = ({ post, showDistance = false }) => {
  const isBlurred = post.status !== 'approved'
  
  // 解析地址信息
  const addressInfo = LocationUtils.parseAddress(post.location_address || '')
  
  // 地址点击事件，打开系统导航
  const handleLocationClick = (e: any) => {
    e.stopPropagation && e.stopPropagation();
    if (post.latitude && post.longitude) {
      Taro.openLocation({
        latitude: Number(post.latitude),
        longitude: Number(post.longitude),
        name: addressInfo.simpleName || post.shop_name, // 主标题：简略地址，如果没有则用店铺名
        address: addressInfo.detailAddress, // 副标题：详细地址
        scale: 16
      })
    } else {
      Taro.showToast({ title: '未提供位置信息', icon: 'none' })
    }
  }
  
  return (
    <View className={`post-card ${isBlurred ? 'post-card--blurred' : ''}`}>
      <View className="post-header">
        <View className="shop-info">
          <Text className="shop-name">{post.shop_name}</Text>
          <Text
            className="shop-location"
            onClick={handleLocationClick}
            style={{ cursor: 'pointer', color: '#007aff' }}
          >
            <AtIcon value="map-pin" size="12" color="#007aff" />
            {addressInfo.displayAddress}
            {showDistance && typeof post.distance === 'number' && (
              <Text className="distance">
                距离 {post.distance < 1000 
                  ? `${post.distance}m` 
                  : `${(post.distance / 1000).toFixed(1)}km`
                }
              </Text>
            )}
          </Text>
        </View>
        <View className="shop-price">
          <Text className="price-text">¥{post.shop_price}</Text>
          <Text className="price-unit">/人</Text>
        </View>
      </View>
      
      {/* 图片展示 */}
      {post.images && post.images.length > 0 && (
        <View className="post-images">
          {post.images.slice(0, 3).map((img) => (
            <View key={img.id} className="image-item">
              <Image 
                className="post-image" 
                src={img.image_url} 
                mode="aspectFill"
                onError={() => console.log('图片加载失败:', img.image_url)}
                onLoad={() => console.log('图片加载成功:', img.image_url)}
              />
            </View>
          ))}
          {post.images.length > 3 && (
            <View className="more-images">
              <Text className="more-text">+{post.images.length - 3}</Text>
            </View>
          )}
        </View>
      )}
      
      <Text className="post-comment">{post.comment}</Text>
      
      <View className="post-footer">
        <View className="post-stats">
          <View className="stat-item">
            <AtIcon value={post.is_liked ? "heart-2" : "heart"} size="14" color={post.is_liked ? "#ff4757" : "#999"} />
            <Text className="stat-text">{post.likes_count}</Text>
          </View>
          <View className="stat-item">
            <AtIcon value="eye" size="14" color="#999" />
            <Text className="stat-text">{post.view_count}</Text>
          </View>
        </View>
        <Text className="post-time">{TimeUtils.formatDate(post.created_at)}</Text>
      </View>
      
      {/* 模糊遮罩层 */}
      {isBlurred && (
        <View className="blur-overlay">
        </View>
      )}
    </View>
  )
}

export default React.memo(PostCard)
