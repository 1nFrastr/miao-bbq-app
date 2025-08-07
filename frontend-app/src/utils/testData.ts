// 测试用数据
export const mockUserData = {
  openid: 'test_openid_123',
  nickname: '测试用户',
  avatar_url: 'https://via.placeholder.com/100x100',
  gender: 1,
  city: '北京市',
  province: '北京',
  country: '中国'
}

export const mockOrderData = {
  status: 'pending' as const,
  items: [
    {
      dish_name: '烤羊肉串',
      unit_price: 3.00,
      quantity: 10
    },
    {
      dish_name: '烤鸡翅',
      unit_price: 8.00,
      quantity: 2
    }
  ]
}

export const mockPostData = {
  shop_name: '老北京烧烤店',
  shop_price: 80,
  comment: '味道不错，价格实惠，推荐羊肉串和鸡翅！',
  latitude: 39.9042,
  longitude: 116.4074,
  location_address: '北京市朝阳区三里屯路12号',
  images: [
    {
      image_url: 'https://via.placeholder.com/300x200'
    }
  ]
}
