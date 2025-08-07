import { View, Image } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import React, { useCallback, useState, useRef, useEffect } from 'react'
import { ImageUploaderProps, ImageItem } from './types'
import { UploadAPI } from '../../utils/api'
import { MessageUtils } from '../../utils'
import './index.scss'

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxCount = 3,
  disabled = false
}) => {
  const [uploadingImages, setUploadingImages] = useState<ImageItem[]>([])
  const currentUrlsRef = useRef<string[]>(value)

  // 同步外部 value 到 ref
  useEffect(() => {
    currentUrlsRef.current = value
  }, [value])

  // 选择图片
  const handleChooseImage = useCallback(async () => {
    if (disabled) return
    
    const remainingCount = maxCount - value.length - uploadingImages.length
    if (remainingCount <= 0) {
      MessageUtils.showError(`最多只能上传${maxCount}张图片`)
      return
    }

    try {
      const res = await Taro.chooseImage({
        count: remainingCount,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera']
      })

      // 串行上传选中的图片，一张张上传
      for (const tempFilePath of res.tempFilePaths) {
        await uploadImage(tempFilePath)
      }
    } catch (error) {
      if (error.errMsg !== 'chooseImage:fail cancel') {
        MessageUtils.showError('选择图片失败')
      }
    }
  }, [disabled, maxCount, value.length, uploadingImages.length])

  // 上传单张图片
  const uploadImage = useCallback(async (filePath: string) => {
    const imageId = `temp_${Date.now()}_${Math.random()}`
    const newImage: ImageItem = {
      id: imageId,
      url: filePath,
      status: 'uploading',
      progress: 0
    }

    // 添加到上传列表
    setUploadingImages(prev => [...prev, newImage])

    try {
      const result = await UploadAPI.uploadImage(filePath)
      
      // 上传成功，移除uploading状态，添加到value中
      setUploadingImages(prev => prev.filter(img => img.id !== imageId))
      
      // 使用 ref 获取最新的 URL 列表，避免竞态条件
      const newUrls = [...currentUrlsRef.current, result.image_url]
      currentUrlsRef.current = newUrls
      onChange?.(newUrls)
      
      MessageUtils.showSuccess('上传成功')
    } catch (error) {
      // 上传失败，更新状态
      setUploadingImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, status: 'error' as const }
            : img
        )
      )
      MessageUtils.showError('上传失败，请重试')
    }
  }, [onChange])

  // 删除图片
  const handleDeleteImage = useCallback((index: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          const newUrls = value.filter((_, i) => i !== index)
          onChange?.(newUrls)
        }
      }
    })
  }, [value, onChange])

  // 重试上传
  const handleRetryUpload = useCallback((imageId: string, filePath: string) => {
    setUploadingImages(prev =>
      prev.map(img =>
        img.id === imageId
          ? { ...img, status: 'uploading' as const, progress: 0 }
          : img
      )
    )
    uploadImage(filePath)
  }, [uploadImage])

  // 删除上传中的图片
  const handleDeleteUploading = useCallback((imageId: string) => {
    setUploadingImages(prev => prev.filter(img => img.id !== imageId))
  }, [])

  const canAddMore = value.length + uploadingImages.length < maxCount && !disabled

  return (
    <View className="image-uploader">
      <View className="image-list">
        {/* 已上传的图片 */}
        {value.map((url, index) => (
          <View key={index} className="image-item">
            <Image 
              className="image-preview" 
              src={url} 
              mode="aspectFill"
            />
            {!disabled && (
              <View 
                className="delete-btn"
                onClick={() => handleDeleteImage(index)}
              >
                <AtIcon value="close" size="12" color="#fff" />
              </View>
            )}
          </View>
        ))}

        {/* 上传中的图片 */}
        {uploadingImages.map((image) => (
          <View key={image.id} className="image-item">
            <Image 
              className="image-preview" 
              src={image.url} 
              mode="aspectFill"
            />
            <View className="upload-status">
              {image.status === 'uploading' && (
                <View className="uploading">
                  <AtIcon value="loading-3" size="16" color="#fff" />
                </View>
              )}
              {image.status === 'error' && (
                <View className="error-actions">
                  <View 
                    className="retry-btn"
                    onClick={() => handleRetryUpload(image.id, image.url)}
                  >
                    <AtIcon value="reload" size="12" color="#fff" />
                  </View>
                  <View 
                    className="delete-btn"
                    onClick={() => handleDeleteUploading(image.id)}
                  >
                    <AtIcon value="close" size="12" color="#fff" />
                  </View>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* 添加按钮 */}
        {canAddMore && (
          <View 
            className="add-btn"
            onClick={handleChooseImage}
          >
            <AtIcon value="camera" size="24" color="#FF6B35" />
            <View className="add-text">添加图片</View>
          </View>
        )}
      </View>
    </View>
  )
}

export default React.memo(ImageUploader)
