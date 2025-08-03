from rest_framework import serializers
from .models import Order, OrderItem
from users.serializers import UserSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """订单明细序列化器"""
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'dish_name', 'unit_price', 'quantity', 
            'subtotal', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'subtotal', 'created_at', 'updated_at']


class OrderItemCreateSerializer(serializers.ModelSerializer):
    """订单明细创建序列化器"""
    
    class Meta:
        model = OrderItem
        fields = ['dish_name', 'unit_price', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    """订单序列化器"""
    user = UserSerializer(read_only=True)
    items = OrderItemSerializer(source='orderitem_set', many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'status', 'total_amount', 'item_count',
            'start_time', 'complete_time', 'waiting_seconds',
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'total_amount', 'item_count', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """订单创建序列化器"""
    items = OrderItemCreateSerializer(many=True)
    
    class Meta:
        model = Order
        fields = ['status', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        # 计算订单总金额和菜品数量
        order.item_count = len(items_data)
        order.calculate_total()
        
        return order
    
    def to_representation(self, instance):
        """使用OrderSerializer来序列化返回的数据"""
        return OrderSerializer(instance, context=self.context).data


class OrderUpdateSerializer(serializers.ModelSerializer):
    """订单更新序列化器"""
    
    class Meta:
        model = Order
        fields = ['status', 'start_time', 'complete_time', 'waiting_seconds']
