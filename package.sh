#!/bin/bash

# 本地打包脚本 - 在开发环境执行

echo "开始打包Django项目..."

# 项目名称和版本
PROJECT_NAME="miao-bbq-backend"
VERSION=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="${PROJECT_NAME}_${VERSION}.tar.gz"

# 创建临时目录
TEMP_DIR="./dist"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

echo "复制项目文件..."

# 复制需要的文件和目录
cp -r ./backend/* $TEMP_DIR/

# 删除不需要的文件
cd $TEMP_DIR
rm -rf __pycache__
rm -rf */__pycache__
rm -rf */*/__pycache__
rm -rf */*/*/__pycache__
rm -rf .git
rm -rf venv
rm -rf env
rm -rf db.sqlite3
rm -rf *.pyc
rm -rf */*.pyc
rm -rf */*/*.pyc
rm -rf logs/*
rm -rf staticfiles/*
rm -rf media/*

# 创建空的日志和静态文件目录
mkdir -p logs
mkdir -p staticfiles
mkdir -p media

# 返回上级目录进行打包
cd ..

echo "创建压缩包..."
tar -czf $PACKAGE_NAME -C $TEMP_DIR .

echo "清理临时文件..."
rm -rf $TEMP_DIR

echo "打包完成！"
echo "包文件: $PACKAGE_NAME"
echo "文件大小: $(du -h $PACKAGE_NAME | cut -f1)"
echo ""
echo "上传步骤:"
echo "1. 将 $PACKAGE_NAME 上传到服务器"
echo "2. 在服务器解压到 /www/wwwroot/miao-bbq-backend/"
echo "3. 运行部署脚本: bash deploy.sh"
echo "4. 在宝塔面板配置Python项目"
