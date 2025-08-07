#!/usr/bin/env python
"""
数据库配置测试脚本
用于验证当前环境的数据库配置是否正确
"""

import os
import sys
import django
from pathlib import Path

# 添加项目路径
sys.path.append(str(Path(__file__).parent))

# 设置Django配置
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.db import connections

def test_database_config():
    """测试数据库配置"""
    print("=== 数据库配置测试 ===")
    
    # 获取环境信息
    environment = os.getenv('ENVIRONMENT', 'development')
    print(f"当前环境: {environment}")
    
    # 获取数据库配置
    db_config = settings.DATABASES['default']
    print(f"数据库引擎: {db_config['ENGINE']}")
    
    if 'sqlite' in db_config['ENGINE']:
        print(f"SQLite 数据库文件: {db_config['NAME']}")
        print(f"文件是否存在: {os.path.exists(db_config['NAME'])}")
    else:
        print(f"数据库名称: {db_config['NAME']}")
        print(f"数据库主机: {db_config['HOST']}")
        print(f"数据库端口: {db_config['PORT']}")
        print(f"数据库用户: {db_config['USER']}")
    
    # 测试数据库连接
    try:
        db_conn = connections['default']
        cursor = db_conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print(f"数据库连接测试: 成功 (结果: {result})")
        cursor.close()
    except Exception as e:
        print(f"数据库连接测试: 失败 ({e})")
    
    print("=== 测试完成 ===")

if __name__ == '__main__':
    test_database_config()
