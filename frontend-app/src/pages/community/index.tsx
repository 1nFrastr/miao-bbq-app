import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const Community = () => {
  Taro.useLoad(() => {
    console.log('社区推荐页面加载')
  })

  return (
    <View className="community-page">
      <View className="coming-soon">
        <Text className="coming-soon__icon">🔥</Text>
        <Text className="coming-soon__title">社区推荐</Text>
        <Text className="coming-soon__desc">敬请期待</Text>
      </View>
    </View>
  )
}

export default Community
