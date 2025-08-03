# 烧烤点单记录与社区推荐后端项目总结

## 项目概述

本项目是一个基于Django + Django REST Framework开发的后端API服务，为微信小程序提供烧烤点单记录和社区推荐功能。

## 技术栈

- **后端框架**: Django 5.2.4
- **API框架**: Django REST Framework 3.16.0
- **数据库**: MySQL (生产环境), SQLite (开发环境)
- **数据库驱动**: mysqlclient 2.2.4
- **跨域处理**: django-cors-headers
- **其他依赖**: requests, Pillow, python-dotenv

## 项目结构

```
backend/
├── core/                   # Django主配置
│   ├── settings.py        # 项目设置
│   ├── urls.py           # 主URL配置
│   └── ...
├── users/                 # 用户管理应用
│   ├── models.py         # 用户模型
│   ├── views.py          # 用户视图
│   ├── serializers.py    # 用户序列化器
│   └── urls.py           # 用户URL
├── orders/                # 订单管理应用
│   ├── models.py         # 订单模型 
│   ├── views.py          # 订单视图
│   ├── serializers.py    # 订单序列化器
│   └── urls.py           # 订单URL
├── community/             # 社区分享应用
│   ├── models.py         # 社区模型
│   ├── views.py          # 社区视图
│   ├── serializers.py    # 社区序列化器
│   └── urls.py           # 社区URL
├── admin_panel/           # 管理后台应用
│   ├── models.py         # 管理员模型
│   ├── views.py          # 管理员视图
│   ├── serializers.py    # 管理员序列化器
│   └── urls.py           # 管理员URL
├── api/                   # API配置
│   ├── authentication.py # 自定义认证
│   ├── permissions.py     # 自定义权限
│   └── urls.py           # API主URL
├── manage.py              # Django管理脚本
├── requirements.txt       # 依赖列表
├── API.md                # API文档
└── test_api.py           # API测试脚本
```

## 数据模型

### 1. 用户表 (users)
- 微信小程序用户信息
- 支持openid、unionid认证
- 包含用户基本信息和活跃状态

### 2. 订单表 (orders) + 订单明细表 (order_items)
- 订单主表记录订单状态、时间、金额等
- 订单明细表记录具体菜品信息
- 支持订单计时功能

### 3. 社区分享表 (posts) + 图片表 (post_images) + 点赞表 (post_likes)
- 分享表记录店铺推荐信息和位置
- 图片表支持每个分享最多3张图片
- 点赞表记录用户点赞行为

### 4. 管理员表 (admin_users) + 操作日志表 (admin_logs)
- 管理员用户和权限管理
- 完整的操作日志记录

## 核心功能

### 用户功能
- ✅ 微信小程序登录/注册
- ✅ 用户信息管理
- ✅ 基于openid的身份认证

### 订单功能
- ✅ 创建订单和添加菜品
- ✅ 订单状态管理（待开始/处理中/已完成）
- ✅ 订单计时功能
- ✅ 订单统计功能
- ✅ 动态添加/删除菜品

### 社区功能  
- ✅ 发布烧烤店推荐
- ✅ 上传图片（最多3张）
- ✅ 位置信息存储和距离计算
- ✅ 点赞功能
- ✅ 内容搜索和排序
- ✅ 附近店铺查询

### 管理后台功能
- ✅ 管理员登录认证
- ✅ 仪表盘数据统计
- ✅ 内容审核（待审核/已通过/已拒绝）
- ✅ 用户活跃度分析
- ✅ 操作日志记录

## API接口

### 基础信息
- 基础URL: `http://localhost:8000/api/`
- 认证方式: Header中传入 `X-Openid: {openid}`

### 主要接口分类
1. **用户接口** (`/api/users/`)
   - 登录注册、用户信息管理
   
2. **订单接口** (`/api/orders/`)
   - 订单CRUD、计时、统计功能
   
3. **社区接口** (`/api/community/`)
   - 分享CRUD、点赞、搜索功能
   
4. **管理接口** (`/api/admin/`)
   - 管理员认证、内容审核、数据统计

## 部署说明

### 开发环境启动
```bash
# 1. 激活虚拟环境
source ./backend/venv/Scripts/activate

# 2. 配置数据库
# 创建MySQL数据库（如果使用MySQL）
mysql -u root -p < ./backend/init_mysql.sql

# 配置环境变量
cp ./backend/.env.example ./backend/.env
# 编辑 .env 文件，设置正确的数据库连接信息

# 3. 安装依赖
pip install -r ./backend/requirements.txt

# 4. 运行数据库迁移
python ./backend/manage.py migrate

# 5. 创建测试数据
python ./backend/manage.py init_test_data

# 6. 启动服务
python ./backend/manage.py runserver
```

### 数据库配置

#### MySQL配置 (推荐生产环境)
1. 安装MySQL服务器
2. 运行初始化脚本创建数据库:
   ```bash
   mysql -u root -p < ./backend/init_mysql.sql
   ```
3. 在`.env`文件中配置数据库连接:
   ```
   DB_ENGINE=django.db.backends.mysql
   DB_NAME=miao_bbq_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   ```

#### SQLite配置 (开发环境)
如果要使用SQLite，在`.env`文件中配置:
```
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
```

### 数据库管理

项目提供了便捷的数据库管理脚本 `db_manager.sh`：

```bash
# 切换到SQLite（开发环境）
./db_manager.sh sqlite

# 切换到MySQL（生产环境）
./db_manager.sh mysql

# 运行数据库迁移
./db_manager.sh migrate

# 初始化MySQL数据库
./db_manager.sh init_mysql

# 重置数据库
./db_manager.sh reset
```

### 环境配置文件说明

- `.env` - 当前使用的环境配置
- `.env.example` - 配置模板文件
- `.env.mysql` - MySQL生产环境配置模板

### 测试数据
运行初始化脚本后，系统会创建：
- 3个测试用户
- 1个管理员账户 (admin/admin123)
- 若干测试订单和分享数据

### API测试
```bash
python test_api.py
```

## 主要特性

1. **完整的RESTful API设计**
   - 标准的HTTP方法和状态码
   - 统一的响应格式
   - 完善的错误处理

2. **微信小程序适配**
   - 基于openid的用户认证
   - 支持微信用户信息同步
   - CORS跨域支持

3. **灵活的权限控制**
   - 自定义认证中间件
   - 基于角色的权限管理
   - 匿名访问控制

4. **完善的数据模型**
   - 符合业务需求的数据库设计
   - 合理的索引优化
   - 数据完整性约束

5. **丰富的业务功能**
   - 订单计时和状态管理
   - 地理位置和距离计算
   - 内容审核工作流
   - 数据统计和分析

## 后续优化建议

1. **性能优化**
   - 添加Redis缓存
   - 数据库查询优化
   - 异步任务处理

2. **功能增强**
   - 图片上传和存储
   - 消息推送功能
   - 更精确的地理位置服务

3. **运维监控**
   - 日志系统完善
   - 性能监控
   - 自动化部署

## 项目状态

✅ **已完成**: 核心功能开发和测试
🔄 **进行中**: 前端小程序对接
📋 **待完成**: 生产环境部署配置

---

项目已成功实现了烧烤点单记录与社区推荐的所有核心功能，API接口经过测试验证，可以为微信小程序前端提供稳定的后端服务支持。
