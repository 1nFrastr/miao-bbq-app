/**
 * 定位组件相关类型定义
 */

export interface LocationData {
  latitude: number      // 纬度
  longitude: number     // 经度
  address: string       // 详细地址
  isLocationEnabled: boolean  // 是否已获取位置
}

export interface LocationPickerProps {
  value?: LocationData
  onChange?: (location: LocationData | undefined) => void
  placeholder?: string
  disabled?: boolean
}
