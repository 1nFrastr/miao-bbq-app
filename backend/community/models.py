from django.db import models
from django.core.validators import MaxValueValidator
from users.models import User


class Post(models.Model):
    """社区分享表"""
    STATUS_CHOICES = [
        ('pending', '待审核'),
        ('approved', '已展示'),
        ('rejected', '已拒绝'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True, verbose_name='用户')
    shop_name = models.CharField(max_length=100, verbose_name='店铺名称')
    shop_price = models.IntegerField(verbose_name='人均消费')
    comment = models.TextField(verbose_name='推荐理由')
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True, verbose_name='纬度')
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True, verbose_name='经度')
    location_address = models.CharField(max_length=300, blank=True, null=True, verbose_name='位置地址')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True, verbose_name='审核状态')
    likes_count = models.IntegerField(default=0, db_index=True, verbose_name='点赞数')
    view_count = models.IntegerField(default=0, verbose_name='查看数')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'posts'
        verbose_name = '社区分享'
        verbose_name_plural = '社区分享'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['likes_count']),
            models.Index(fields=['latitude', 'longitude']),
        ]

    def __str__(self):
        return f'{self.shop_name} - {self.user.nickname}'

    def increment_view_count(self):
        """增加查看数"""
        self.view_count += 1
        self.save(update_fields=['view_count'])


class PostImage(models.Model):
    """分享图片表"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images', db_index=True, verbose_name='分享')
    image_url = models.URLField(max_length=500, verbose_name='图片地址')
    sort_order = models.IntegerField(default=0, db_index=True, verbose_name='排序顺序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'post_images'
        verbose_name = '分享图片'
        verbose_name_plural = '分享图片'
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['sort_order']),
        ]
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.post.shop_name} - 图片{self.sort_order}'


class PostLike(models.Model):
    """点赞表"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, db_index=True, verbose_name='分享')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True, verbose_name='用户')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name='创建时间')

    class Meta:
        db_table = 'post_likes'
        verbose_name = '分享点赞'
        verbose_name_plural = '分享点赞'
        unique_together = [['post', 'user']]  # 联合唯一约束
        indexes = [
            models.Index(fields=['post', 'user']),
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.user.nickname} 点赞 {self.post.shop_name}'

    def save(self, *args, **kwargs):
        """保存时更新分享的点赞数"""
        super().save(*args, **kwargs)
        # 更新分享的点赞数
        self.post.likes_count = PostLike.objects.filter(post=self.post).count()
        self.post.save(update_fields=['likes_count'])

    def delete(self, *args, **kwargs):
        """删除时更新分享的点赞数"""
        post = self.post
        super().delete(*args, **kwargs)
        # 更新分享的点赞数
        post.likes_count = PostLike.objects.filter(post=post).count()
        post.save(update_fields=['likes_count'])
