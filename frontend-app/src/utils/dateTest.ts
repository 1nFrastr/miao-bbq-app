// 测试日期解析修复
import { TimeUtils } from './index'

// 测试函数
export const testDateParsing = () => {
  console.log('=== 日期解析测试 ===')
  
  // 测试问题格式："2025-08-07 22:42:57"
  const testTimeString = "2025-08-07 22:42:57"
  
  try {
    // 使用修复后的 parseDate 方法
    const parsedDate = TimeUtils.parseDate(testTimeString)
    console.log('✅ parseDate 成功:', parsedDate.toString())
    
    // 测试 formatDate 方法
    const formattedDate = TimeUtils.formatDate(testTimeString)
    console.log('✅ formatDate 成功:', formattedDate)
    
    // 测试 formatRelativeTime 方法
    const relativeTime = TimeUtils.formatRelativeTime(testTimeString)
    console.log('✅ formatRelativeTime 成功:', relativeTime)
    
    return true
  } catch (error) {
    console.error('❌ 日期解析失败:', error)
    return false
  }
}

// 对比测试：展示修复前后的差异
export const compareOldVsNew = () => {
  console.log('=== 修复前后对比测试 ===')
  
  const testTimeString = "2025-08-07 22:42:57"
  
  try {
    // 修复前的方式（会在iOS上失败）
    console.log('修复前（直接使用）:')
    const oldWay = new Date(testTimeString)
    console.log('- 结果:', oldWay.toString())
    console.log('- 是否有效:', !isNaN(oldWay.getTime()))
    
    // 修复后的方式
    console.log('修复后（使用parseDate）:')
    const newWay = TimeUtils.parseDate(testTimeString)
    console.log('- 结果:', newWay.toString())
    console.log('- 是否有效:', !isNaN(newWay.getTime()))
    
  } catch (error) {
    console.error('对比测试失败:', error)
  }
}
