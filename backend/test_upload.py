#!/usr/bin/env python3
"""
测试图片上传API
"""

import requests
import os

# API配置
API_BASE_URL = "http://127.0.0.1:8000"
UPLOAD_URL = f"{API_BASE_URL}/api/uploads/images/"

def test_image_upload():
    """测试图片上传功能"""
    
    # 创建一个简单的测试图片（如果不存在的话）
    test_image_path = "test_image.jpg"
    
    if not os.path.exists(test_image_path):
        print("测试图片不存在，请准备一个测试图片文件 test_image.jpg")
        return
    
    print(f"开始测试图片上传: {UPLOAD_URL}")
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'image': f}
            headers = {
                'X-Openid': 'test_user_openid'  # 测试用的openid
            }
            
            response = requests.post(UPLOAD_URL, files=files, headers=headers)
            
            print(f"响应状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ 上传成功!")
                print(f"图片URL: {data.get('image_url')}")
                print(f"文件大小: {data.get('file_size')} bytes")
            else:
                print("❌ 上传失败")
                
    except Exception as e:
        print(f"❌ 测试失败: {e}")

if __name__ == "__main__":
    test_image_upload()
