---
applyTo: "**/*.ts,**/*.tsx"
---
# Taro框架编码规范

## 项目结构规范

- 页面组件放在 `src/pages/` 目录下，每个页面一个文件夹
- 通用组件放在 `src/components/` 目录下
- 工具函数放在 `src/utils/` 目录下
- 类型定义放在 `src/types/` 目录下
- 静态资源放在 `src/assets/` 目录下
- 配置文件放在 `config/` 目录下

## 文件命名规范

- 页面文件夹使用小写字母，多个单词用连字符分隔，如 `user-profile`
- React组件文件使用PascalCase命名，如 `UserProfile.tsx`
- 工具函数文件使用camelCase命名，如 `formatUtils.ts`
- 样式文件使用对应组件的名称，扩展名为 `.scss`

## 组件编写规范

### 页面组件
- 必须使用函数式组件 + Hooks
- 页面组件必须有对应的 `.config.ts` 配置文件
- 页面组件必须使用 `definePageConfig` 导出页面配置
- 使用 `Taro.useLoad` 代替 `componentDidMount`
- 使用 `Taro.useReady` 代替 `componentDidShow`
- 使用 `Taro.useDidShow` 和 `Taro.useDidHide` 处理页面显示隐藏

```tsx
// 正确示例
import { View } from '@tarojs/components'
import { definePageConfig } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'

const Index = () => {
  Taro.useLoad(() => {
    console.log('页面加载')
  })

  Taro.useReady(() => {
    console.log('页面初次渲染完成')
  })

  return (
    <View className="index">
      <Text>Hello World</Text>
    </View>
  )
}

export default Index

// index.config.ts
export default definePageConfig({
  navigationBarTitleText: '首页'
})
```

### 普通组件
- 必须使用TypeScript编写
- 组件props必须定义接口类型
- 组件必须有默认导出
- 使用React.memo优化性能（当需要时）

```tsx
// 正确示例
import { View, Text } from '@tarojs/components'
import React from 'react'
import './UserCard.scss'

interface UserCardProps {
  name: string
  avatar?: string
  onClick?: () => void
}

const UserCard: React.FC<UserCardProps> = ({ name, avatar, onClick }) => {
  return (
    <View className="user-card" onClick={onClick}>
      {avatar && <Image src={avatar} className="avatar" />}
      <Text className="name">{name}</Text>
    </View>
  )
}

export default React.memo(UserCard)
```

## 样式编写规范

- 必须使用Sass（.scss）作为样式预处理器
- 小程序样式统一使用rpx作为尺寸单位
- 样式类名使用kebab-case命名
- 使用BEM命名方法论组织样式类名
- 避免使用内联样式，优先使用className
- 合理使用Sass变量和混入

```scss
// 正确示例
.user-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;

  &__avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 24rpx;
  }

  &__name {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }

  &--active {
    border: 2rpx solid #007aff;
  }
}
```

## 状态管理规范

- 简单状态使用 `useState`
- 复杂状态使用 `useReducer`
- 全局状态推荐使用Context API或Zustand
- 避免过度使用全局状态

## API调用规范

- 统一使用 `Taro.request` 进行网络请求
- 封装统一的请求方法，包含错误处理
- API接口响应数据必须定义TypeScript类型
- 使用 `useSWR` 或自定义Hook管理异步状态

```tsx
// 正确示例
import Taro from '@tarojs/taro'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export const request = async <T>(url: string, options?: any): Promise<T> => {
  try {
    const response = await Taro.request({
      url: `${API_BASE_URL}${url}`,
      ...options,
    })
    
    const result = response.data as ApiResponse<T>
    
    if (result.code === 200) {
      return result.data
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    Taro.showToast({
      title: '网络请求失败',
      icon: 'error'
    })
    throw error
  }
}
```

## 路由导航规范

- 使用 `Taro.navigateTo` 进行页面跳转
- 使用 `Taro.redirectTo` 进行页面重定向
- 使用 `Taro.switchTab` 进行tabBar页面切换
- 传递参数时注意URL长度限制
- 复杂参数建议使用全局状态传递

```tsx
// 正确示例
import Taro from '@tarojs/taro'

// 简单参数传递
const navigateToDetail = (id: string) => {
  Taro.navigateTo({
    url: `/pages/detail/index?id=${id}`
  })
}

// 复杂参数传递
const navigateWithComplexData = (data: any) => {
  // 将数据存储到全局状态或缓存
  Taro.setStorageSync('tempData', data)
  Taro.navigateTo({
    url: '/pages/target/index'
  })
}
```

## 小程序特性使用规范

### 生命周期
- 使用Taro提供的Hook处理生命周期
- 避免在生命周期中进行重复的副作用操作
- 合理使用 `useEffect` 的依赖数组

### 事件处理
- 事件处理函数使用箭头函数或useCallback优化
- 避免在render中直接绑定匿名函数

### 存储
- 使用 `Taro.setStorageSync/getStorageSync` 进行同步存储
- 使用 `Taro.setStorage/getStorage` 进行异步存储
- 敏感数据不要存储在本地

## 性能优化规范

- 合理使用 `React.memo`、`useMemo`、`useCallback`
- 长列表使用虚拟滚动或分页加载
- 图片资源进行压缩和懒加载
- 避免频繁的setState操作
- 使用 `Taro.createIntersectionObserver` 实现元素可见性检测

## 代码质量规范

- 必须编写TypeScript类型定义
- 组件必须有合理的错误边界处理
- 使用ESLint和Prettier保证代码风格统一
- 关键业务逻辑必须有单元测试
- 复杂组件必须拆分为多个小组件

## 构建和部署规范

- 使用环境变量区分开发、测试、生产环境
- 构建前必须进行类型检查和代码质量检查
- 上传前必须进行小程序代码体积优化
- 合理配置分包加载策略
