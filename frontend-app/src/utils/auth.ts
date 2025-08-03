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
      const loginRes = await Taro.login()
      
      if (!loginRes.code) {
        throw new Error('获取微信登录凭证失败')
      }

      // 2. 调用后端接口验证code并获取用户信息
      const userData = {
        code: loginRes.code
      }

      // 3. 调用后端登录接口
      const response = await UserAPI.login(userData)
      
      // 4. 存储用户信息和openid
      StorageService.set(this.USER_KEY, response.user)
      StorageService.set(this.OPENID_KEY, response.user.openid)

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
      content: '需要登录后才能使用此功能，是否前往登录页面？',
      confirmText: '前往登录',
      cancelText: '取消'
    })

    if (confirmed.confirm) {
      // 跳转到登录页面，而不是直接调用登录接口
      Taro.navigateTo({
        url: '/pages/login/index'
      })
    }

    return false
  }

  // 检查登录状态，如果未登录则静默返回false（不弹框）
  static checkAuthSilent(): boolean {
    return this.isLoggedIn()
  }

  // 获取微信用户信息（可选，用于完善用户资料）
  static async getWechatUserInfo(): Promise<any | null> {
    try {
      const userInfoRes = await Taro.getUserProfile({
        desc: '用于完善用户资料'
      })
      return userInfoRes.userInfo
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      Taro.showToast({
        title: '获取用户信息失败',
        icon: 'error'
      })
      return null
    }
  }

  // 更新用户资料
  static async updateUserProfile(userInfo: {
    nickname?: string
    avatar_url?: string
    gender?: number
    city?: string
    province?: string
    country?: string
  }): Promise<User | null> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) {
        throw new Error('用户未登录')
      }

      // 调用后端API更新用户信息
      const response = await UserAPI.updateProfile(currentUser.id, userInfo)
      
      // 更新本地存储的用户信息
      this.updateUser(response)
      
      Taro.showToast({
        title: '资料更新成功',
        icon: 'success'
      })

      return response
    } catch (error: any) {
      console.error('更新用户资料失败:', error)
      Taro.showToast({
        title: error.message || '更新失败',
        icon: 'error'
      })
      return null
    }
  }
}
