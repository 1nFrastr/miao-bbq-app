from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """用户序列化器"""
    
    class Meta:
        model = User
        fields = [
            'id', 'openid', 'unionid', 'nickname', 'avatar_url', 
            'gender', 'city', 'province', 'country', 'is_active',
            'last_login_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """用户创建序列化器"""
    
    class Meta:
        model = User
        fields = [
            'openid', 'unionid', 'nickname', 'avatar_url',
            'gender', 'city', 'province', 'country'
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    """用户更新序列化器"""
    
    class Meta:
        model = User
        fields = [
            'nickname', 'avatar_url', 'gender', 
            'city', 'province', 'country'
        ]
