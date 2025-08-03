from rest_framework.permissions import BasePermission


class IsWechatUser(BasePermission):
    """微信用户权限"""
    
    def has_permission(self, request, view):
        from users.models import User
        return isinstance(request.user, User) and request.user.is_active


class IsAdminUser(BasePermission):
    """管理员权限"""
    
    def has_permission(self, request, view):
        from admin_panel.models import AdminUser
        return isinstance(request.user, AdminUser) and request.user.is_active


class IsSuperAdmin(BasePermission):
    """超级管理员权限"""
    
    def has_permission(self, request, view):
        from admin_panel.models import AdminUser
        return (isinstance(request.user, AdminUser) and 
                request.user.is_active and 
                request.user.is_superuser)


class IsOwnerOrReadOnly(BasePermission):
    """对象所有者或只读权限"""
    
    def has_object_permission(self, request, view, obj):
        # 读权限允许任何请求
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # 写权限只给对象所有者
        return obj.user == request.user
