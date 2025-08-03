from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Count, Q
from datetime import datetime, timedelta
from .models import AdminUser, AdminLog
from .serializers import (
    AdminUserSerializer, AdminUserCreateSerializer, AdminUserUpdateSerializer,
    AdminLoginSerializer, AdminLogSerializer, AdminLogCreateSerializer
)
from users.models import User
from community.models import Post


class AdminUserViewSet(viewsets.ModelViewSet):
    """管理员视图集"""
    queryset = AdminUser.objects.all()
    serializer_class = AdminUserSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminUserUpdateSerializer
        return AdminUserSerializer
    
    def get_permissions(self):
        """登录和仪表盘接口允许匿名访问"""
        if self.action in ['login', 'dashboard']:
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """管理员登录"""
        serializer = AdminLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                admin_user = AdminUser.objects.get(username=username, is_active=True)
                if admin_user.check_password(password):
                    # 更新最后登录时间
                    admin_user.last_login_at = timezone.now()
                    admin_user.save(update_fields=['last_login_at'])
                    
                    # 记录登录日志
                    self._create_log(admin_user, 'login', 'admin', admin_user.id, '管理员登录', request)
                    
                    return Response({
                        'admin': AdminUserSerializer(admin_user).data,
                        'success': True
                    })
                else:
                    return Response({'error': '用户名或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)
            except AdminUser.DoesNotExist:
                return Response({'error': '用户名或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """管理后台仪表盘数据"""
        # 基础统计
        total_users = User.objects.count()
        total_posts = Post.objects.count()
        pending_posts = Post.objects.filter(status='pending').count()
        
        # 今日活跃用户（今日有登录的用户）
        today = timezone.now().date()
        today_active_users = User.objects.filter(
            last_login_at__date=today
        ).count()
        
        # 最近7天用户活跃度趋势
        activity_trend = []
        for i in range(7):
            date = today - timedelta(days=i)
            active_count = User.objects.filter(
                last_login_at__date=date
            ).count()
            activity_trend.append({
                'date': date.strftime('%Y-%m-%d'),
                'active_users': active_count
            })
        
        # 内容状态分布
        content_stats = Post.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # 最新待审核内容
        recent_pending = Post.objects.filter(
            status='pending'
        ).select_related('user').order_by('-created_at')[:5]
        
        from community.serializers import PostListSerializer
        
        return Response({
            'summary': {
                'total_users': total_users,
                'total_posts': total_posts,
                'pending_posts': pending_posts,
                'today_active_users': today_active_users,
            },
            'activity_trend': list(reversed(activity_trend)),
            'content_stats': list(content_stats),
            'recent_pending': PostListSerializer(recent_pending, many=True).data
        })
    
    def _create_log(self, admin_user, action, target_type, target_id, description, request):
        """创建操作日志"""
        AdminLog.objects.create(
            admin=admin_user,
            action=action,
            target_type=target_type,
            target_id=target_id,
            description=description,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
    
    def _get_client_ip(self, request):
        """获取客户端IP"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class AdminLogViewSet(viewsets.ReadOnlyModelViewSet):
    """管理操作日志视图集"""
    queryset = AdminLog.objects.all().select_related('admin').order_by('-created_at')
    serializer_class = AdminLogSerializer


class ContentModerationViewSet(viewsets.ViewSet):
    """内容审核视图集"""
    
    def list(self, request):
        """获取待审核内容列表"""
        status_filter = request.query_params.get('status', 'pending')
        ordering = request.query_params.get('ordering', '-created_at')
        
        queryset = Post.objects.filter(status=status_filter).select_related('user')
        
        # 搜索
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(shop_name__icontains=search) |
                Q(shop_location__icontains=search) |
                Q(user__nickname__icontains=search)
            )
        
        # 排序
        if ordering in ['created_at', '-created_at', 'likes_count', '-likes_count']:
            queryset = queryset.order_by(ordering)
        
        from community.serializers import PostListSerializer
        serializer = PostListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """审核通过"""
        try:
            post = Post.objects.get(id=pk)
            post.status = 'approved'
            post.save(update_fields=['status'])
            
            # 记录操作日志
            admin_user = request.user  # 需要实现管理员认证中间件
            self._create_log(admin_user, 'approve', 'post', post.id, f'审核通过分享：{post.shop_name}', request)
            
            return Response({'success': True})
        except Post.DoesNotExist:
            return Response({'error': '内容不存在'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """审核拒绝"""
        try:
            post = Post.objects.get(id=pk)
            post.status = 'rejected'
            post.save(update_fields=['status'])
            
            # 记录操作日志
            admin_user = request.user
            reason = request.data.get('reason', '不符合社区规范')
            self._create_log(admin_user, 'reject', 'post', post.id, f'审核拒绝分享：{post.shop_name}，原因：{reason}', request)
            
            return Response({'success': True})
        except Post.DoesNotExist:
            return Response({'error': '内容不存在'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['delete'])
    def delete_post(self, request, pk=None):
        """删除内容"""
        try:
            post = Post.objects.get(id=pk)
            shop_name = post.shop_name
            post.delete()
            
            # 记录操作日志
            admin_user = request.user
            reason = request.data.get('reason', '违规内容')
            self._create_log(admin_user, 'delete', 'post', pk, f'删除分享：{shop_name}，原因：{reason}', request)
            
            return Response({'success': True})
        except Post.DoesNotExist:
            return Response({'error': '内容不存在'}, status=status.HTTP_404_NOT_FOUND)
    
    def _create_log(self, admin_user, action, target_type, target_id, description, request):
        """创建操作日志"""
        AdminLog.objects.create(
            admin=admin_user,
            action=action,
            target_type=target_type,
            target_id=target_id,
            description=description,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
    
    def _get_client_ip(self, request):
        """获取客户端IP"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
