// 环境配置
interface EnvConfig {
  API_BASE_URL: string
  DEBUG_MODE: boolean
}

// 从 Taro 配置中获取环境变量
declare const API_BASE_URL: string
declare const DEBUG_MODE: boolean

// 环境配置对象
const ENV_CONFIG: EnvConfig = {
  API_BASE_URL: API_BASE_URL || 'http://localhost:8000/api',
  DEBUG_MODE: DEBUG_MODE || false
}

export { ENV_CONFIG }
export default ENV_CONFIG
