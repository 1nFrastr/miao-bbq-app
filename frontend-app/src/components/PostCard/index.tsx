import { View, Text, Image } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import React from 'react'
import { Post } from '../../types'
import './index.scss'

interface PostCardProps {
  post: Post
  showDistance?: boolean
}

const PostCard: React.FC<PostCardProps> = ({ post, showDistance = false }) => {
  return (
    <View className="post-card">
      <View className="post-header">
        <View className="shop-info">
          <Text className="shop-name">{post.shop_name}</Text>
          <Text className="shop-location">
            <AtIcon value="map-pin" size="12" color="#999" />
            {post.location_address}
            {showDistance && post.distance && (
              <Text className="distance">距离 {(post.distance / 1000).toFixed(1)}km</Text>
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
        <Text className="post-time">{new Date(post.created_at).toLocaleDateString()}</Text>
      </View>
    </View>
  )
}

export default React.memo(PostCard)
