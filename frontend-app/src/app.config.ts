export default {
  pages: [
    'pages/order/index',
    'pages/community/index',
    'pages/my/index',
    'pages/login/index',
    'pages/order-detail/index',
    'pages/order-list/index'
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
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'assets/images/user.png',
        selectedIconPath: 'assets/images/user-active.png'
      }
    ]
  },
  permission: {
    "scope.userLocation": {
      desc: "您的位置信息将用于为您推荐附近的烧烤店"
    }
  },
  requiredPrivateInfos: [
    "getLocation"
  ]
}
