from rest_framework import serializers
from .models import AdminUser, AdminLog


class AdminUserSerializer(serializers.ModelSerializer):
    """管理员序列化器"""
    
    class Meta:
        model = AdminUser
        fields = [
            'id', 'username', 'email', 'real_name', 'is_active',
            'is_superuser', 'last_login_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_login_at', 'created_at', 'updated_at']


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """管理员创建序列化器"""
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = AdminUser
        fields = [
            'username', 'password', 'email', 'real_name',
            'is_active', 'is_superuser'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        admin_user = AdminUser.objects.create(**validated_data)
        admin_user.set_password(password)
        admin_user.save()
        return admin_user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """管理员更新序列化器"""
    password = serializers.CharField(write_only=True, min_length=6, required=False)
    
    class Meta:
        model = AdminUser
        fields = [
            'email', 'real_name', 'is_active', 'is_superuser', 'password'
        ]

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance


class AdminLoginSerializer(serializers.Serializer):
    """管理员登录序列化器"""
    username = serializers.CharField()
    password = serializers.CharField()


class AdminLogSerializer(serializers.ModelSerializer):
    """管理操作日志序列化器"""
    admin = AdminUserSerializer(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    target_type_display = serializers.CharField(source='get_target_type_display', read_only=True)
    
    class Meta:
        model = AdminLog
        fields = [
            'id', 'admin', 'action', 'action_display', 'target_type',
            'target_type_display', 'target_id', 'description',
            'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AdminLogCreateSerializer(serializers.ModelSerializer):
    """管理操作日志创建序列化器"""
    
    class Meta:
        model = AdminLog
        fields = [
            'action', 'target_type', 'target_id', 'description',
            'ip_address', 'user_agent'
        ]
