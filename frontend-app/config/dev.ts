import type { UserConfigExport } from "@tarojs/cli"

export default {
  defineConstants: {
    // 从环境变量中读取 API 地址
    API_BASE_URL: JSON.stringify(process.env.TARO_APP_API_URL || 'http://localhost:8000/api'),
    DEBUG_MODE: JSON.stringify(process.env.TARO_APP_DEBUG === 'true'),
    // 虚拟定位开关，默认关闭
    USE_MOCK_LOCATION: JSON.stringify(process.env.TARO_APP_USE_MOCK_LOCATION === 'true')
  },
  mini: {},
  h5: {}
} satisfies UserConfigExport<'vite'>
