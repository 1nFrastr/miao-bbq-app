# 可交互位置选择器 - 功能说明

## 目标
创建一个简单的位置选择器页面，类似微信"分享位置"功能。

## 基本功能
- 展示地图，支持拖动选择位置
- 显示附近地点列表
- 点击地点可快速定位
- 确认选择后返回位置信息

## 技术要求
- 基于 Taro v4 + React + TypeScript
- 使用 Taro UI 组件库
- 样式使用 Sass
- 使用腾讯位置服务获取POI数据
- 代码放在 `frontend-app/src/pages/location-picker/` 目录

## 页面结构
```
┌─────────────────────────┐
│       选择位置           │  ← 导航栏
├─────────────────────────┤
│                         │
│        地图区域          │  ← 可拖动地图 + 中心锚点
│                         │
├─────────────────────────┤
│  ○ 当前位置             │
│  ○ 附近餐厅             │  ← POI列表
│  ○ 附近商店             │
├─────────────────────────┤
│      [确定]             │  ← 确认按钮
└─────────────────────────┘
```

## 组件分解
1. **LocationPickerPage** - 主页面
2. **MapView** - 地图组件
3. **POIList** - 地点列表
4. **ConfirmBar** - 确认栏

## 基本交互流程
1. 进入页面 → 自动定位到当前位置
2. 拖动地图 → 更新中心锚点位置
3. 停止拖动 → 刷新附近地点列表
4. 点击地点 → 地图移动到该位置
5. 点击确定 → 返回选中位置信息

## 数据结构
```typescript
interface Location {
  latitude: number
  longitude: number
  address: string
  name?: string
}

interface POIItem {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}
```

## 目录结构
```
frontend-app/src/pages/location-picker/
├── index.tsx         # 主页面
├── index.config.ts   # 页面配置
├── index.scss        # 样式文件
└── components/       # 子组件
    ├── MapView.tsx
    ├── POIList.tsx
    └── ConfirmBar.tsx
```

## API服务
使用腾讯位置服务（微信小程序官方推荐）：

### 1. 地点搜索API
```
https://apis.map.qq.com/ws/place/v1/search
```
用于获取附近POI数据

### 2. 逆地址解析API
```
https://apis.map.qq.com/ws/geocoder/v1/
```
用于将坐标转换为详细地址

### 3. 配置要求
- 需要申请腾讯地图API密钥
- 配置小程序域名白名单：`apis.map.qq.com`
