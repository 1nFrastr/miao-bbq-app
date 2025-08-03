from django.db import models
from django.utils import timezone
from users.models import User


class Order(models.Model):
    """订单表"""
    STATUS_CHOICES = [
        ('pending', '待开始'),
        ('processing', '处理中'),
        ('completed', '已完成'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True, verbose_name='用户')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, db_index=True, verbose_name='订单状态')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name='总金额')
    item_count = models.IntegerField(default=0, verbose_name='菜品数量')
    start_time = models.DateTimeField(blank=True, null=True, verbose_name='开始计时时间')
    complete_time = models.DateTimeField(blank=True, null=True, verbose_name='完成时间')
    waiting_seconds = models.IntegerField(default=0, verbose_name='等待秒数')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'orders'
        verbose_name = '订单'
        verbose_name_plural = '订单'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'订单#{self.id} - {self.user.nickname}'

    def calculate_total(self):
        """计算订单总金额"""
        total = sum(item.subtotal for item in self.orderitem_set.all())
        self.total_amount = total
        self.save()
        return total


class OrderItem(models.Model):
    """订单明细表"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_index=True, verbose_name='订单')
    dish_name = models.CharField(max_length=100, db_index=True, verbose_name='菜品名称')
    unit_price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name='单价')
    quantity = models.IntegerField(verbose_name='数量')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='小计')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'order_items'
        verbose_name = '订单明细'
        verbose_name_plural = '订单明细'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['dish_name']),
        ]

    def save(self, *args, **kwargs):
        """保存时自动计算小计"""
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.dish_name} x {self.quantity}'
