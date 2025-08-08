from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
import math
from .models import Post, PostImage, PostLike
from .serializers import (
    PostSerializer, PostCreateSerializer, PostUpdateSerializer,
    PostListSerializer, PostLikeSerializer
)


class PostPagination(PageNumberPagination):
    """社区帖子分页器"""
    page_size = 5  # 默认每页5条
    page_size_query_param = 'page_size'
    max_page_size = 20


class PostViewSet(viewsets.ModelViewSet):
    """社区分享视图集"""
    serializer_class = PostSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'likes_count', 'view_count']
    ordering = ['-created_at']
    pagination_class = PostPagination
    
    def get_queryset(self):
        """获取已审核通过的分享"""
        queryset = Post.objects.filter(status='approved')
        
        # 搜索功能
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(shop_name__icontains=search) |
                Q(shop_location__icontains=search) |
                Q(comment__icontains=search)
            )
        
        # 距离筛选（需要前端传入当前位置）
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius')  # 半径（公里）
        
        if lat and lng and radius:
            # 简单的边界筛选，实际项目中可以使用 PostGIS 进行精确的地理位置查询
            try:
                lat_f, lng_f, radius_f = float(lat), float(lng), float(radius)
                # 粗略计算经纬度范围
                lat_range = radius_f / 111  # 1度纬度约111公里
                lng_range = radius_f / (111 * abs(lat_f) * 0.017453)  # 经度随纬度变化
                
                queryset = queryset.filter(
                    latitude__range=[lat_f - lat_range, lat_f + lat_range],
                    longitude__range=[lng_f - lng_range, lng_f + lng_range]
                )
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def calculate_distance(self, lat1, lng1, lat2, lng2):
        """计算两点之间的距离（公里）"""
        if not all([lat1, lng1, lat2, lng2]):
            return float('inf')  # 如果位置信息不完整，返回无穷大
        
        R = 6371  # 地球半径（公里）
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = (math.sin(dlat/2) * math.sin(dlat/2) + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlng/2) * math.sin(dlng/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        return round(distance, 2)
    
    def list(self, request, *args, **kwargs):
        """重写list方法，支持距离排序"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 检查是否需要按距离排序
        ordering = request.query_params.get('ordering', '')
        user_lat = request.query_params.get('lat')
        user_lng = request.query_params.get('lng')
        
        if ordering == 'distance' and user_lat and user_lng:
            try:
                user_lat_f = float(user_lat)
                user_lng_f = float(user_lng)
                
                # 使用数据库层面的距离计算和排序
                # Haversine公式的SQL实现
                queryset = queryset.extra(
                    select={
                        'distance': '''
                            6371 * 2 * ASIN(SQRT(
                                POWER(SIN((RADIANS(latitude) - RADIANS(%s)) / 2), 2) +
                                COS(RADIANS(%s)) * COS(RADIANS(latitude)) *
                                POWER(SIN((RADIANS(longitude) - RADIANS(%s)) / 2), 2)
                            ))
                        '''
                    },
                    select_params=[user_lat_f, user_lat_f, user_lng_f]
                ).order_by('distance')
                
            except (ValueError, TypeError):
                # 如果位置参数有问题，回退到普通查询
                pass
        
        # 普通查询或距离排序后的查询都使用相同的分页逻辑
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        elif self.action == 'create':
            return PostCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PostUpdateSerializer
        return PostSerializer
    
    def get_permissions(self):
        """列表和详情允许匿名访问"""
        return [AllowAny()]
    
    def perform_create(self, serializer):
        """创建分享时设置用户"""
        openid = self.request.META.get('HTTP_X_OPENID')
        if openid:
            try:
                from users.models import User
                user = User.objects.get(openid=openid)
                serializer.save(user=user)
                return
            except User.DoesNotExist:
                pass
        # 如果没有找到用户，使用第一个用户作为默认值（测试用）
        from users.models import User
        user = User.objects.first()
        serializer.save(user=user)
    
    def retrieve(self, request, *args, **kwargs):
        """获取详情时增加查看数"""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """点赞/取消点赞"""
        post = self.get_object()
        openid = request.META.get('HTTP_X_OPENID')
        
        if openid:
            try:
                from users.models import User
                user = User.objects.get(openid=openid)
            except User.DoesNotExist:
                user = User.objects.first()  # 测试用默认用户
        else:
            user = User.objects.first()  # 测试用默认用户
        
        like_obj, created = PostLike.objects.get_or_create(
            post=post,
            user=user
        )
        
        if not created:
            # 如果已经点赞，则取消点赞
            like_obj.delete()
            is_liked = False
        else:
            is_liked = True
        
        # 重新获取点赞数
        post.refresh_from_db()
        
        return Response({
            'is_liked': is_liked,
            'likes_count': post.likes_count
        })
    
    @action(detail=True, methods=['get'])
    def likes(self, request, pk=None):
        """获取点赞列表"""
        post = self.get_object()
        likes = PostLike.objects.filter(post=post).select_related('user').order_by('-created_at')
        
        page = self.paginate_queryset(likes)
        if page is not None:
            serializer = PostLikeSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = PostLikeSerializer(likes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """获取我的分享"""
        openid = request.META.get('HTTP_X_OPENID')
        
        if openid:
            try:
                from users.models import User
                user = User.objects.get(openid=openid)
            except User.DoesNotExist:
                user = User.objects.first()  # 测试用默认用户
        else:
            user = User.objects.first()  # 测试用默认用户
        
        # 获取用户的所有帖子，不过滤状态
        queryset = Post.objects.filter(user=user).order_by('-created_at')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PostListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PostListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """获取附近的分享"""
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        
        if not lat or not lng:
            return Response({'error': '缺少位置参数'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 默认10公里范围
        radius = float(request.query_params.get('radius', '10'))
        
        try:
            lat_f, lng_f = float(lat), float(lng)
            lat_range = radius / 111
            lng_range = radius / (111 * abs(lat_f) * 0.017453)
            
            queryset = Post.objects.filter(
                status='approved',
                latitude__range=[lat_f - lat_range, lat_f + lat_range],
                longitude__range=[lng_f - lng_range, lng_f + lng_range]
            ).order_by('-created_at')
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = PostListSerializer(page, many=True, context={'request': request})
                return self.get_paginated_response(serializer.data)
            
            serializer = PostListSerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
            
        except (ValueError, TypeError):
            return Response({'error': '位置参数格式错误'}, status=status.HTTP_400_BAD_REQUEST)
