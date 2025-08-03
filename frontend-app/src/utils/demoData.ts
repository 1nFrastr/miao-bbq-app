import { Post } from '../types'

// 演示数据 - 社区推荐
export const DEMO_POSTS: Post[] = [
  {
    id: 1,
    shopName: '老王烧烤店',
    shopLocation: '中山路123号',
    shopPrice: 45,
    shopComment: '这家店的羊肉串特别香，老板人很好，价格实惠。推荐他们家的烤羊腿和烤茄子，口感一绝！服务态度也很不错。',
    images: [],
    publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
    userLocation: {
      lat: 39.9042,
      lng: 116.4074
    }
  },
  {
    id: 2,
    shopName: '胖哥烧烤',
    shopLocation: '建设大街456号',
    shopPrice: 35,
    shopComment: '性价比超高的烧烤店！份量足，味道正宗。特别推荐烤鸡翅和烤玉米，还有他们家的蒜蓉生蚝，简直太好吃了！',
    images: [],
    publishTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5小时前
    userLocation: {
      lat: 39.9100,
      lng: 116.4100
    }
  },
  {
    id: 3,
    shopName: '夜市烧烤摊',
    shopLocation: '美食街88号',
    shopPrice: 25,
    shopComment: '深夜食堂的感觉，虽然环境一般，但是味道很棒！烤鱿鱼和烤豆腐干是必点，价格便宜量又足。',
    images: [],
    publishTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1天前
    userLocation: {
      lat: 39.8950,
      lng: 116.4000
    }
  },
  {
    id: 4,
    shopName: '大学城烧烤',
    shopLocation: '学院路999号',
    shopPrice: 30,
    shopComment: '学生党的最爱！便宜又好吃，烤肉串和烤面筋都很不错。老板经常给学生打折，很有人情味。',
    images: [],
    publishTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天前
    userLocation: {
      lat: 39.9200,
      lng: 116.3900
    }
  }
]

// 演示数据 - 订单历史
export const DEMO_ORDER_HISTORY = [
  {
    id: Date.now() - 1000,
    items: [
      { id: 1, dishName: '烤羊肉串', price: 3, quantity: 10, total: 30 },
      { id: 2, dishName: '烤鸡翅', price: 5, quantity: 4, total: 20 },
      { id: 3, dishName: '烤茄子', price: 8, quantity: 2, total: 16 }
    ],
    totalAmount: 66,
    waitingTime: 1260, // 21分钟
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'completed' as const
  }
]
