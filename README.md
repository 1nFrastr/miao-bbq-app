# 喵烧烤 - 烧烤点单与社区推荐全栈项目

**中文文档** | [English](README_EN.md)

一款基于 Taro + Django 开发的微信小程序，为用户提供烧烤点单记录和社区推荐分享功能。

## 🍖 核心功能

### 📝 点单记录功能
- 记录烧烤点单明细（菜名、单价、数量）
- 实时计算订单总金额
- 等餐计时功能，记录用餐时间
- 订单状态管理（未开始/进行中/已完成）
- 本地存储订单历史记录
- 表单验证和错误提示

### 🌍 社区推荐功能  
- 发布烧烤店推荐分享
- 上传店铺图片（最多3张）
- 基于地理位置的附近店铺推荐
- 多种排序方式（距离最近、最新发布、最热门）
- 店铺点赞和浏览统计
- 推荐内容搜索和过滤

### 📍 地理位置服务
- 智能位置权限申请
- GPS定位和地址解析
- 基于位置的附近店铺查询
- 距离计算和显示
- 位置权限拒绝时的优雅降级

### 🛠 管理后台功能
- 管理员登录认证
- 内容审核工作流
- 用户数据统计
- 操作日志记录
- 仪表盘数据展示

## 🛠 技术栈

### 前端技术
- **小程序**: Taro 4.1.5 + React 18 + TypeScript + Sass
- **管理端**: Vite + React 19 + TypeScript + Sass
- **UI组件**: Taro UI 3.3.0
- **状态管理**: Zustand
- **包管理**: pnpm

### 后端技术  
- **框架**: Django 5.2.4 + Django REST Framework
- **数据库**: SQLite (开发) / MySQL (生产)
- **认证**: 基于微信小程序 openid
- **跨域**: django-cors-headers

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- Python 3.10+
- pnpm
- 微信开发者工具

### 后端启动

1. **激活虚拟环境并安装依赖**
   ```bash
   # Windows Git Bash
   source ./backend/venv/Scripts/activate
   pip install -r ./backend/requirements.txt
   ```

2. **初始化数据库**
   ```bash
   python ./backend/manage.py migrate
   ```

3. **启动后端服务**
   ```bash
   python ./backend/manage.py runserver
   ```

### 小程序启动

1. **安装依赖**
   ```bash
   cd frontend-app
   pnpm install
   ```

2. **启动开发服务**
   ```bash
   pnpm run dev:weapp
   ```

3. **导入微信开发者工具**
   - 打开微信开发者工具
   - 导入项目目录：`frontend-app/dist`
   - 配置小程序 AppID

### 管理端启动

```bash
cd frontend-admin
pnpm install
pnpm run dev
```
