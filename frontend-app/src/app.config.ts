export default {
  pages: [
    'pages/order/index',
    'pages/community/index',
    'pages/test/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTitleText: '烧烤点单记录',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#FF6B35',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/order/index',
        text: '我的订单',
        iconPath: 'assets/images/order.png',
        selectedIconPath: 'assets/images/order-active.png'
      },
      {
        pagePath: 'pages/community/index',
        text: '社区推荐',
        iconPath: 'assets/images/community.png',
        selectedIconPath: 'assets/images/community-active.png'
      },
      {
        pagePath: 'pages/test/index',
        text: 'API测试',
        iconPath: 'assets/images/order.png',
        selectedIconPath: 'assets/images/order-active.png'
      }
    ]
  }
}
