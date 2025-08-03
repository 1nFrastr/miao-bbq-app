# 喵烧烤小程序全栈项目

## 项目结构

```
# 烧烤点单记录与社区小程序

这是一款基于 Taro + React + TypeScript 开发的微信小程序，旨在帮助用户记录烧烤点单、计时等餐，并分享烧烤店推荐给其他用户。

## 项目结构

```
miao-bbq-app/
├── backend/                    # Python Django 后端服务
├── frontend-admin/             # React 管理端界面
├── frontend-app/               # Taro 小程序前端
│   ├── src/
│   │   ├── pages/             # 页面文件
│   │   │   ├── order/         # 订单记录页面
│   │   │   └── community/     # 社区推荐页面
│   │   ├── utils/             # 工具类
│   │   ├── types/             # TypeScript 类型定义
│   │   └── assets/            # 静态资源
│   └── project.config.json    # 小程序配置
└── README.md
```

## 核心功能

### 1. 点单记录功能
- ✅ 添加菜品到订单（菜名、单价、数量）
- ✅ 实时计算总金额
- ✅ 订单状态管理（未开始/进行中/已完成）
- ✅ 等餐计时功能
- ✅ 订单历史记录本地存储
- ✅ 表单验证和错误提示
- ✅ 动态按钮状态管理

### 2. 社区推荐功能
- ✅ 发布烧烤店推荐
- ✅ 上传店铺图片（最多3张）
- ✅ 地理位置获取和权限管理
- ✅ 多种排序方式（距离最近、最新发布、最热门）
- ✅ 推荐内容浏览
- ✅ 距离计算和显示

### 3. 位置服务
- ✅ 智能权限请求弹窗
- ✅ 优雅降级处理（拒绝权限仍可正常使用其他功能）
- ✅ 距离计算和显示
- ✅ 本地存储权限状态

## 技术栈

### 前端 (小程序)
- **框架**: Taro 4.1.5 + React 18
- **UI 库**: Taro UI 3.3.0
- **语言**: TypeScript
- **样式**: Sass/SCSS
- **构建工具**: Vite + Babel

### 后端 (预留)
- **框架**: Django + Python
- **数据库**: SQLite (开发) / PostgreSQL (生产)

### 管理端 (预留)
- **框架**: React + TypeScript
- **构建工具**: Vite

## 开发环境设置

### 前置要求
- Node.js >= 16
- pnpm (推荐) 或 npm
- 微信开发者工具

### 安装和运行

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd miao-bbq-app
   ```

2. **安装小程序依赖**
   ```bash
   cd frontend-app
   pnpm install
   ```

3. **启动小程序开发服务**
   ```bash
   pnpm run dev:weapp
   ```

4. **在微信开发者工具中导入项目**
   - 打开微信开发者工具
   - 选择"导入项目"
   - 项目目录选择 `frontend-app/dist`
   - AppID 填写测试号或正式 AppID

### 可用脚本

在 `frontend-app` 目录下：

```bash
# 开发环境构建并监听
pnpm run dev:weapp      # 微信小程序
pnpm run dev:h5         # H5 版本

# 生产环境构建
pnpm run build:weapp    # 微信小程序
pnpm run build:h5       # H5 版本
```

## 设计规范

### UI/UX 设计
- **主题色**: #FF6B35 (烧烤橙色)
- **设计风格**: 简洁现代，小程序原生风格
- **字体**: 系统默认字体栈
- **布局**: 卡片式布局，圆角阴影

### 页面结构
- **顶部导航**: 固定标题栏，橙色背景
- **底部导航**: 双标签页切换（我的订单 / 社区推荐）
- **内容区域**: 卡片式布局，圆角阴影

### 交互规范
- **反馈提示**: Toast 消息提示
- **加载状态**: 按钮 loading 状态
- **表单验证**: 实时验证和错误提示
- **图片上传**: 支持多选，预览和删除

## 功能特性

### 数据管理
- 使用 Taro 本地存储 API
- 支持数据的增删改查
- 状态管理统一化
- 数据持久化存储

### 位置服务
- 集成微信位置 API
- 处理位置权限拒绝场景
- 距离计算算法实现
- 智能权限请求流程

### 图片处理
- 支持相册选择和拍照
- 多图预览功能
- 最多 3 张图片限制

### 性能优化
- 组件化开发，复用性强
- 数据缓存策略
- 合理的状态管理

## 工具类

### StorageService
本地存储服务，封装 Taro 存储 API

### LocationService
位置服务，包含位置获取和距离计算

### TimeUtils
时间工具类，格式化时间显示

### ValidationUtils
数据验证工具类

### MessageUtils
消息提示工具类

## 类型定义

项目使用 TypeScript，在 `src/types/` 目录下定义了完整的类型系统：

- `OrderItem`: 订单项目类型
- `OrderHistory`: 订单历史类型
- `Post`: 社区帖子类型
- `UserLocation`: 用户位置类型

## 开发优先级

### P0 (已实现)
- ✅ 基础点单记录功能
- ✅ 订单列表和金额计算
- ✅ 计时功能
- ✅ 底部导航切换

### P1 (已实现)
- ✅ 社区推荐发布
- ✅ 图片上传功能
- ✅ 基础的排序功能
- ✅ 位置服务集成

### P2 (待优化)
- 📋 高级排序算法
- 📋 数据统计展示
- 📋 分享功能
- 📋 用户反馈收集

## 验收标准

1. ✅ 功能完整性：所有核心功能正常工作
2. ✅ 性能表现：页面响应迅速
3. ✅ 兼容性：支持主流微信版本
4. ✅ 用户体验：操作流畅，反馈及时
5. ✅ 数据准确：计算结果正确，状态同步

## 未来扩展

- 📋 多人共享订单功能
- 📋 店铺评分系统
- 📋 个人消费统计
- 📋 社交分享功能
- 📋 店铺详情页面
- 📋 后端 API 集成
- 📋 用户账号系统

## 开发注意事项

1. **小程序限制**: 注意小程序平台的 API 限制和特性
2. **性能优化**: 合理使用组件，避免过度渲染
3. **用户体验**: 重视加载状态和错误处理
4. **数据安全**: 本地存储数据要考虑数据丢失保护

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。

---

**Happy Coding! 🔥🍖**
├── backend/              # Django后端
│   ├── core/            # Django项目核心配置
│   ├── venv/            # Python虚拟环境
│   ├── manage.py        # Django管理命令
│   └── requirements.txt # Python依赖
├── frontend-app/        # Taro小程序前端
│   ├── src/            # 源代码
│   ├── config/         # 构建配置
│   └── package.json    # 项目配置
├── frontend-admin/      # 管理端前端
│   ├── src/            # 源代码
│   ├── public/         # 静态资源
│   └── package.json    # 项目配置
└── .vscode/            # VS Code配置
```

## 技术栈

### 后端
- Python
- Django 5.2.4
- Django REST Framework
- SQLite数据库

### 前端
- 小程序：Taro 4.x + React + TypeScript + Sass
- 管理端：Vite + React + TypeScript + Sass
- 包管理：pnpm

## 开发环境启动

### 后端服务
```bash
cd backend
source ./venv/Scripts/activate  # Windows Git Bash
python manage.py runserver
```

### 小程序开发
```bash
cd frontend-app
pnpm run dev:weapp
```

### 管理端开发
```bash
cd frontend-admin
pnpm run dev
```

## VS Code任务

项目已配置了VS Code任务，可以通过 `Ctrl+Shift+P` 打开命令面板，搜索"Tasks: Run Task"来运行：

- 启动后端服务
- 启动小程序开发
- 启动管理端开发
- 安装后端依赖
- 运行数据库迁移
