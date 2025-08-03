from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer


class UserViewSet(viewsets.ModelViewSet):
    """用户视图集"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        """登录相关接口允许匿名访问"""
        if self.action in ['create', 'login']:
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """微信小程序登录"""
        openid = request.data.get('openid')
        if not openid:
            return Response({'error': '缺少openid参数'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 查找或创建用户
        user, created = User.objects.get_or_create(
            openid=openid,
            defaults={
                'unionid': request.data.get('unionid'),
                'nickname': request.data.get('nickname'),
                'avatar_url': request.data.get('avatar_url'),
                'gender': request.data.get('gender', 0),
                'city': request.data.get('city'),
                'province': request.data.get('province'),
                'country': request.data.get('country'),
            }
        )
        
        # 更新最后登录时间
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])
        
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'is_new_user': created
        })
    
    @action(detail=True, methods=['post'])
    def update_profile(self, request, pk=None):
        """更新用户资料"""
        user = self.get_object()
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
