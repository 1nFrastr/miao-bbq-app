/**
 * 应用配置常量
 */

export const CONFIG = {
  // API配置
  API_BASE_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000/api'
    : 'https://your-production-api.com/api',

  // 腾讯地图配置
  TENCENT_MAP: {
    KEY: 'UKWBZ-MM2CW-YLZRC-OYZNJ-M24W3-XZBBZ', // 需要替换为实际的腾讯地图API密钥
    BASE_URL: 'https://apis.map.qq.com/ws'
  },

  // 存储键名
  STORAGE_KEYS: {
    USER_TOKEN: 'user_token',
    USER_INFO: 'user_info',
    LOCATION_PERMISSION: 'location_permission'
  },

  // 默认配置
  DEFAULT: {
    PAGE_SIZE: 10,
    LOCATION_TIMEOUT: 10000,
    REQUEST_TIMEOUT: 30000
  }
}
