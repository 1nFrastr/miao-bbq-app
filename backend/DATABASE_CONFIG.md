# 数据库环境配置说明

本项目支持在不同环境中使用不同的数据库：
- **本地开发环境**：使用 SQLite 数据库（无需额外配置）
- **生产环境**：使用 MySQL 数据库

## 环境配置

### 本地开发环境（默认）

默认使用 SQLite 数据库，配置文件：`.env` （基于 `.env.development`）

```bash
# 环境标识
ENVIRONMENT=development

# Django配置
SECRET_KEY=django-insecure-dev-key-only-for-development
DEBUG=True

# 注意：开发环境自动使用SQLite，无需配置数据库参数
```

### 生产环境

使用 MySQL 数据库，需要将 `.env.mysql` 复制为 `.env` 并修改相关配置：

```bash
# 切换到生产环境MySQL配置
cp .env.mysql .env
```

然后编辑 `.env` 文件，设置实际的数据库连接信息。

## 快速切换命令

项目提供了 VS Code 任务来快速切换数据库配置：

### 切换到开发环境（SQLite）
```bash
# 使用VS Code任务
Tasks: Run Task -> 切换到SQLite数据库

# 或手动执行
cd backend && cp .env.development .env
```

### 切换到生产环境（MySQL）
```bash
# 使用VS Code任务
Tasks: Run Task -> 切换到MySQL数据库

# 或手动执行
cd backend && cp .env.mysql .env
```

## 数据库迁移

切换数据库后，需要运行数据库迁移：

```bash
# 使用VS Code任务
Tasks: Run Task -> 运行数据库迁移

# 或手动执行
source ./backend/venv/Scripts/activate && python ./backend/manage.py migrate
```

## MySQL 数据库初始化

如果是第一次使用 MySQL，需要先创建数据库：

```bash
# 使用VS Code任务
Tasks: Run Task -> 初始化MySQL数据库

# 或手动执行
mysql -u root -p < ./backend/init_mysql.sql
```

## 注意事项

1. **开发环境**：默认使用 SQLite，数据存储在 `backend/db.sqlite3` 文件中
2. **生产环境**：使用 MySQL，需要确保 MySQL 服务正在运行，并且数据库已创建
3. **环境变量**：通过 `ENVIRONMENT` 变量控制使用哪种数据库
4. **数据备份**：切换数据库前建议备份现有数据
