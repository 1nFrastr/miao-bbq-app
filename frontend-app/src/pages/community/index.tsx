import { View, Text, Input, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const Community = () => {
  Taro.useLoad(() => {
    console.log('社区推荐页面加载')
  })

  return (
    <View className="community-page">
      {/* 推荐发布表单 */}
      <View className="recommend-form">
        <View className="form-section">
          <Text className="section-title">分享烧烤店推荐</Text>
          
          <View className="form-item">
            <Text className="form-label">店铺名称</Text>
            <Input className="form-input" placeholder="例如：老王烧烤店" />
          </View>

          <View className="form-item">
            <Text className="form-label">地址位置</Text>
            <Input className="form-input" placeholder="例如：XX路XX号" />
          </View>

          <View className="form-item">
            <Text className="form-label">当前位置</Text>
            <View className="location-input">
              <Text className="location-placeholder">未获取位置信息</Text>
            </View>
          </View>

          <View className="form-item">
            <Text className="form-label">人均消费 (元)</Text>
            <Input className="form-input" placeholder="例如：50" type="number" />
          </View>

          <View className="location-tip">
            <Text className="tip-icon">�</Text>
            <Text className="tip-text">将使用您当前位置标记店铺位置</Text>
          </View>

          <View className="form-item">
            <Text className="form-label">上传图片 (最多3张，非必填)</Text>
            <View className="image-upload">
              <View className="upload-placeholder">
                <Text className="upload-icon">📷</Text>
              </View>
            </View>
          </View>

          <View className="form-item">
            <Text className="form-label">推荐理由</Text>
            <Textarea 
              className="form-textarea" 
              placeholder="推荐特色菜品、价格优势或服务体验等..." 
              maxlength={500}
            />
          </View>

          <Button className="publish-btn">
            <Text className="btn-icon">🚀</Text>
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
      </View>
    </View>
  )
}

export default Community
