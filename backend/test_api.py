"""
API测试脚本
运行: python test_api.py
"""
import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_user_login():
    """测试用户登录"""
    print("=== 测试用户登录 ===")
    url = f'{BASE_URL}/users/users/login/'
    data = {
        'openid': 'test_user_001',
        'nickname': '测试用户',
        'gender': 1,
        'city': '北京'
    }
    
    response = requests.post(url, json=data)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    
    if response.status_code == 200:
        return response.json()['user']
    return None

def test_create_order(openid):
    """测试创建订单"""
    print("\n=== 测试创建订单 ===")
    url = f'{BASE_URL}/orders/orders/'
    headers = {'X-Openid': openid}
    data = {
        'status': 'pending',
        'items': [
            {
                'dish_name': '烤羊肉串',
                'unit_price': 3.00,
                'quantity': 10
            },
            {
                'dish_name': '烤鸡翅',
                'unit_price': 8.00,
                'quantity': 5
            }
        ]
    }
    
    response = requests.post(url, json=data, headers=headers)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    
    if response.status_code == 201:
        return response.json()['id']
    return None

def test_get_orders(openid):
    """测试获取订单列表"""
    print("\n=== 测试获取订单列表 ===")
    url = f'{BASE_URL}/orders/orders/'
    headers = {'X-Openid': openid}
    
    response = requests.get(url, headers=headers)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")

def test_create_post(openid):
    """测试创建社区分享"""
    print("\n=== 测试创建社区分享 ===")
    url = f'{BASE_URL}/community/posts/'
    headers = {'X-Openid': openid}
    data = {
        'shop_name': 'API测试烧烤店',
        'shop_location': '测试地址',
        'shop_price': 88,
        'comment': '这是通过API创建的测试分享',
        'latitude': 39.9042,
        'longitude': 116.4074
    }
    
    response = requests.post(url, json=data, headers=headers)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")

def test_get_posts():
    """测试获取分享列表"""
    print("\n=== 测试获取分享列表 ===")
    url = f'{BASE_URL}/community/posts/'
    
    response = requests.get(url)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")

def test_admin_login():
    """测试管理员登录"""
    print("\n=== 测试管理员登录 ===")
    url = f'{BASE_URL}/admin/admin-users/login/'
    data = {
        'username': 'admin',
        'password': 'admin123'
    }
    
    response = requests.post(url, json=data)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    
    if response.status_code == 200:
        return response.json()['admin']['id']
    return None

def test_admin_dashboard(admin_id):
    """测试管理后台仪表盘"""
    print("\n=== 测试管理后台仪表盘 ===")
    url = f'{BASE_URL}/admin/admin-users/dashboard/'
    headers = {'X-Admin-Id': str(admin_id)}
    
    response = requests.get(url, headers=headers)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")

if __name__ == '__main__':
    print("开始API测试...")
    
    # 测试用户相关功能
    user = test_user_login()
    if user:
        openid = user['openid']
        
        # 测试订单功能
        order_id = test_create_order(openid)
        test_get_orders(openid)
        
        # 测试社区功能
        test_create_post(openid)
    
    test_get_posts()
    
    # 测试管理员功能
    admin_id = test_admin_login()
    if admin_id:
        test_admin_dashboard(admin_id)
    
    print("\nAPI测试完成！")
