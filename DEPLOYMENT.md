# Django项目宝塔部署指南

## 打包项目

### 方法一：使用脚本打包（推荐 - Linux/Mac/Git Bash）
1. 在项目根目录执行打包脚本：
```bash
bash package.sh
```
2. 会生成类似 `miao-bbq-backend_20250803_143022.tar.gz` 的压缩包

### 方法二：手动打包（Windows）
1. 进入 `backend` 目录
2. 选择所有文件和文件夹
3. 使用7zip/WinRAR创建压缩包，排除以下内容：
   - `__pycache__` 文件夹及其子文件夹
   - `venv` 或 `env` 虚拟环境文件夹
   - `db.sqlite3` 数据库文件
   - `logs` 文件夹内容
   - `staticfiles` 文件夹内容
   - `media` 文件夹内容
   - `.git` 文件夹
   - 所有 `.pyc` 文件

## 上传到宝塔

### 1. 上传文件
- 通过宝塔面板文件管理器上传压缩包到 `/www/wwwroot/`
- 或使用FTP/SFTP工具上传

### 2. 解压文件
在宝塔面板文件管理器中：
1. 创建目录 `/www/wwwroot/miao-bbq-backend/`
2. 将压缩包解压到该目录
3. 确保所有文件都在正确位置

### 3. 设置权限
在宝塔终端中执行：
```bash
cd /www/wwwroot/miao-bbq-backend
chmod +x deploy.sh
chown -R www:www .
```

### 4. 运行部署脚本
```bash
cd /www/wwwroot/miao-bbq-backend
bash deploy.sh
```

## 宝塔面板配置

### 1. 创建Python项目
在宝塔面板 > Python项目管理 > 添加Python项目：

**基础设置：**
- 项目名称: `miao-bbq-backend`
- 项目路径: `/www/wwwroot/miao-bbq-backend`
- Python版本: 3.8+ (建议3.11)
- 端口: 8000

**启动设置：**
- 启动方式: `gunicorn`
- 应用名称: `core.wsgi:application`
- 通讯协议: `wsgi`
- 启动用户: `www`

### 2. 环境变量配置
在项目设置中添加环境变量：
```
DJANGO_SECRET_KEY=你的密钥
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=你的域名,你的IP
WECHAT_APP_ID=微信小程序AppID
WECHAT_APP_SECRET=微信小程序AppSecret
```

### 3. 安装依赖
宝塔会自动安装 `requirements.txt` 中的依赖

### 4. 启动项目
点击启动按钮，项目将通过Gunicorn运行

## 配置反向代理

### 1. 创建网站
在宝塔面板创建新网站（选择静态网站）

### 2. 配置反向代理
在网站设置 > 反向代理 中添加：
- 代理名称: `django-api`
- 目标URL: `http://127.0.0.1:8000`
- 发送域名: `$host`

### 3. Nginx配置示例
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /admin/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /static/ {
    alias /www/wwwroot/miao-bbq-backend/staticfiles/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location /media/ {
    alias /www/wwwroot/miao-bbq-backend/media/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## 更新部署

后续更新时：
1. 重新打包项目
2. 上传并解压到原目录（覆盖）
3. 运行 `bash deploy.sh`
4. 在宝塔面板重启Python项目

## 常见问题

### 1. 依赖安装失败
- 检查Python版本
- 手动安装有问题的包：`pip3 install 包名`

### 2. 静态文件404
- 确保运行了 `python manage.py collectstatic`
- 检查Nginx静态文件配置

### 3. 数据库连接错误  
- 检查数据库文件权限
- 确保运行了数据库迁移

### 4. 端口被占用
- 在宝塔面板更改项目端口
- 更新反向代理配置中的端口
