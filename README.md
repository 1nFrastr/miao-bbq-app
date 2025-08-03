# 喵烧烤小程序全栈项目

## 项目结构

```
miao-bbq-app/
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
