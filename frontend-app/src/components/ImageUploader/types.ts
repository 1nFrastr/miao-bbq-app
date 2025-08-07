export interface ImageUploaderProps {
  value?: string[]  // 已上传图片URL列表
  onChange?: (urls: string[]) => void  // 图片变化回调
  maxCount?: number  // 最大图片数量，默认3
  disabled?: boolean  // 是否禁用
}

export interface ImageItem {
  id: string
  url: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
}
