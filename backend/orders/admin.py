from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_amount', 'item_count', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__nickname', 'user__openid']
    readonly_fields = ['created_at', 'updated_at', 'total_amount', 'item_count']
    inlines = [OrderItemInline]
    ordering = ['-created_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'dish_name', 'unit_price', 'quantity', 'subtotal']
    list_filter = ['dish_name']
    search_fields = ['dish_name', 'order__user__nickname']
    readonly_fields = ['subtotal']
