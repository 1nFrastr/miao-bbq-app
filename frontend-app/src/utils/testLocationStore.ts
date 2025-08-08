import { useLocationStore } from '../store/locationStore'

// 简单测试函数，验证store是否能正常工作
export const testLocationStore = () => {
  const store = useLocationStore.getState()
  
  console.log('Store 当前状态:', {
    userLocation: store.userLocation,
    isLoading: store.isLoading,
    error: store.error,
    isInitialized: store.isInitialized
  })
  
  // 测试设置错误
  store.setError('测试错误')
  console.log('设置错误后:', useLocationStore.getState().error)
  
  // 清除错误
  store.setError(null)
  console.log('清除错误后:', useLocationStore.getState().error)
  
  return true
}

// 测试初始化位置功能
export const testInitializeLocation = async () => {
  const store = useLocationStore.getState()
  
  console.log('开始测试位置初始化...')
  await store.initializeLocation()
  
  const finalState = useLocationStore.getState()
  console.log('初始化完成后的状态:', {
    userLocation: finalState.userLocation,
    isLoading: finalState.isLoading,
    error: finalState.error,
    isInitialized: finalState.isInitialized
  })
  
  return finalState.isInitialized
}
