from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from users.models import User


class WechatAuthentication(BaseAuthentication):
    """微信小程序认证"""
    
    def authenticate(self, request):
        openid = request.META.get('HTTP_X_OPENID') or request.GET.get('openid')
        
        if not openid:
            return None
        
        try:
            user = User.objects.get(openid=openid, is_active=True)
            return (user, None)
        except User.DoesNotExist:
            return None
    
    def authenticate_header(self, request):
        return 'X-Openid'


class AdminAuthentication(BaseAuthentication):
    """管理员认证"""
    
    def authenticate(self, request):
        admin_id = request.META.get('HTTP_X_ADMIN_ID') or request.GET.get('admin_id')
        
        if not admin_id:
            return None
        
        try:
            from admin_panel.models import AdminUser
            admin_user = AdminUser.objects.get(id=admin_id, is_active=True)
            return (admin_user, None)
        except AdminUser.DoesNotExist:
            return None
    
    def authenticate_header(self, request):
        return 'X-Admin-Id'
