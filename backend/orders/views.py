from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer,
    OrderItemSerializer, OrderItemCreateSerializer
)
from users.models import User


class OrderViewSet(viewsets.ModelViewSet):
    """订单视图集"""
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        """只返回当前用户的订单"""
        # 临时处理：通过openid获取用户
        openid = self.request.META.get('HTTP_X_OPENID')
        if openid:
            try:
                user = User.objects.get(openid=openid)
                return Order.objects.filter(user=user).order_by('-created_at')
            except User.DoesNotExist:
                pass
        return Order.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        return OrderSerializer
    
    def get_permissions(self):
        """临时允许所有访问"""
        return [AllowAny()]
    
    def perform_create(self, serializer):
        """创建订单时设置用户"""
        openid = self.request.META.get('HTTP_X_OPENID')
        if openid:
            try:
                user = User.objects.get(openid=openid)
                serializer.save(user=user)
                return
            except User.DoesNotExist:
                pass
        # 如果没有找到用户，使用第一个用户作为默认值（测试用）
        user = User.objects.first()
        serializer.save(user=user)
    
    @action(detail=True, methods=['post'])
    def start_timer(self, request, pk=None):
        """开始计时"""
        order = self.get_object()
        if order.status != 'pending':
            return Response({'error': '订单状态不允许开始计时'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'processing'
        order.start_time = timezone.now()
        order.save(update_fields=['status', 'start_time'])
        
        return Response(OrderSerializer(order).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """完成订单"""
        order = self.get_object()
        if order.status != 'processing':
            return Response({'error': '订单状态不允许完成'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'completed'
        order.complete_time = timezone.now()
        
        # 计算等待时间
        if order.start_time:
            waiting_time = (order.complete_time - order.start_time).total_seconds()
            order.waiting_seconds = int(waiting_time)
        
        order.save(update_fields=['status', 'complete_time', 'waiting_seconds'])
        
        return Response(OrderSerializer(order).data)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """添加菜品"""
        order = self.get_object()
        if order.status == 'completed':
            return Response({'error': '已完成的订单不能添加菜品'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OrderItemCreateSerializer(data=request.data)
        if serializer.is_valid():
            order_item = serializer.save(order=order)
            
            # 更新订单统计
            order.item_count = order.orderitem_set.count()
            order.calculate_total()
            
            return Response(OrderItemSerializer(order_item).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        """删除菜品"""
        order = self.get_object()
        item_id = request.query_params.get('item_id')
        
        if not item_id:
            return Response({'error': '缺少item_id参数'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            order_item = order.orderitem_set.get(id=item_id)
            order_item.delete()
            
            # 更新订单统计
            order.item_count = order.orderitem_set.count()
            order.calculate_total()
            
            return Response({'success': True})
        except OrderItem.DoesNotExist:
            return Response({'error': '菜品不存在'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """订单统计"""
        user_orders = self.get_queryset()
        
        stats = {
            'total_orders': user_orders.count(),
            'pending_orders': user_orders.filter(status='pending').count(),
            'processing_orders': user_orders.filter(status='processing').count(),
            'completed_orders': user_orders.filter(status='completed').count(),
            'total_amount': sum(order.total_amount for order in user_orders),
            'average_amount': 0,
        }
        
        if stats['total_orders'] > 0:
            stats['average_amount'] = round(stats['total_amount'] / stats['total_orders'], 2)
        
        return Response(stats)
