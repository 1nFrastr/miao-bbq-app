import Taro from '@tarojs/taro'
import { UserAPI } from './api'
import { User } from '../types'
import { StorageService } from './index'

export class AuthService {
  private static readonly USER_KEY = 'current_user'
  private static readonly OPENID_KEY = 'user_openid'

  // 微信登录
  static async loginWithWechat(): Promise<User | null> {
    try {
      // 1. 获取微信登录凭证
      await Taro.login()
      
      // 2. 获取用户信息
      const userInfoRes = await Taro.getUserProfile({
        desc: '用于完善用户资料'
      })

      // 3. 这里应该调用后端接口验证code并获取openid
      // 为了演示，我们使用模拟的openid
      const mockOpenid = `mock_openid_${Date.now()}`
      
      const userInfo = userInfoRes.userInfo
      const userData = {
        openid: mockOpenid,
        nickname: userInfo.nickName,
        avatar_url: userInfo.avatarUrl,
        gender: userInfo.gender || 0,
        city: userInfo.city,
        province: userInfo.province,
        country: userInfo.country
      }

      // 4. 调用后端登录接口
      const response = await UserAPI.login(userData)
      
      // 5. 存储用户信息和openid
      StorageService.set(this.USER_KEY, response.user)
      StorageService.set(this.OPENID_KEY, userData.openid)

      Taro.showToast({
        title: response.is_new_user ? '注册成功' : '登录成功',
        icon: 'success'
      })

      return response.user
    } catch (error: any) {
      console.error('微信登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'error'
      })
      return null
    }
  }

  // 获取当前用户
  static getCurrentUser(): User | null {
    return StorageService.get<User | null>(this.USER_KEY, null)
  }

  // 获取用户openid
  static getUserOpenid(): string | null {
    return StorageService.get<string | null>(this.OPENID_KEY, null)
  }

  // 检查是否已登录
  static isLoggedIn(): boolean {
    const user = this.getCurrentUser()
    const openid = this.getUserOpenid()
    return !!(user && openid)
  }

  // 退出登录
  static logout(): void {
    StorageService.remove(this.USER_KEY)
    StorageService.remove(this.OPENID_KEY)
  }

  // 更新用户信息
  static updateUser(user: User): void {
    StorageService.set(this.USER_KEY, user)
  }

  // 检查登录状态，如果未登录则提示登录
  static async checkAuthOrLogin(): Promise<boolean> {
    if (this.isLoggedIn()) {
      return true
    }

    const confirmed = await Taro.showModal({
      title: '请先登录',
      content: '需要登录后才能使用此功能，是否立即登录？',
      confirmText: '立即登录',
      cancelText: '取消'
    })

    if (confirmed.confirm) {
      const user = await this.loginWithWechat()
      return !!user
    }

    return false
  }
}
