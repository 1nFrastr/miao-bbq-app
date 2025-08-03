#!/bin/bash

# 宝塔部署脚本 - 在服务器上执行

echo "开始部署 Django 项目..."

# 检查Python环境
echo "检查Python环境..."
python3 --version

# 创建必要的目录
echo "创建必要的目录..."
mkdir -p logs
mkdir -p staticfiles  
mkdir -p media

# 设置目录权限
chmod 755 logs staticfiles media

# 安装依赖
echo "安装Python依赖..."
pip3 install -r requirements.txt

# 收集静态文件 (使用生产环境配置)
echo "收集静态文件..."
export DJANGO_SETTINGS_MODULE=core.prod_settings
python3 manage.py collectstatic --noinput

# 执行数据库迁移
echo "执行数据库迁移..."
python3 manage.py migrate

# 创建超级用户（首次部署时需要）
echo "如需创建超级用户，请手动运行: python3 manage.py createsuperuser"

# 重启应用（如果是更新部署）
echo "重启应用服务..."
if [ -f "gunicorn.pid" ]; then
    kill -HUP $(cat gunicorn.pid)
    echo "Gunicorn已重启"
fi

echo "部署完成！"
echo "项目路径: $(pwd)"
echo "请在宝塔面板中启动Python项目"
