import type { UserConfigExport } from "@tarojs/cli"

export default {
  defineConstants: {
    // 从环境变量中读取 API 地址
    API_BASE_URL: JSON.stringify(process.env.TARO_APP_API_URL || 'http://localhost:8000/api'),
    DEBUG_MODE: JSON.stringify(process.env.TARO_APP_DEBUG === 'true'),
    // 虚拟定位开关，默认关闭
    USE_MOCK_LOCATION: JSON.stringify(process.env.TARO_APP_USE_MOCK_LOCATION === 'true')
  },
  mini: {
    // 解决 Zustand 5.0+ 版本在开发模式下的兼容性问题
    // 参考: https://github.com/NervJS/taro/issues/17350
    debugReact: true
  },
  h5: {}
} satisfies UserConfigExport<'vite'>
