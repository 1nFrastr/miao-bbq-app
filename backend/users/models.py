from django.db import models
from django.utils import timezone


class User(models.Model):
    """用户表"""
    GENDER_CHOICES = [
        (0, '未知'),
        (1, '男'),
        (2, '女'),
    ]
    
    openid = models.CharField(max_length=128, unique=True, verbose_name='微信openid')
    unionid = models.CharField(max_length=128, blank=True, null=True, db_index=True, verbose_name='微信unionid')
    nickname = models.CharField(max_length=100, blank=True, null=True, verbose_name='用户昵称')
    avatar_url = models.URLField(max_length=500, blank=True, null=True, verbose_name='头像地址')
    gender = models.IntegerField(choices=GENDER_CHOICES, default=0, verbose_name='性别')
    city = models.CharField(max_length=50, blank=True, null=True, verbose_name='城市')
    province = models.CharField(max_length=50, blank=True, null=True, verbose_name='省份')
    country = models.CharField(max_length=50, blank=True, null=True, verbose_name='国家')
    is_active = models.BooleanField(default=True, verbose_name='是否活跃')
    last_login_at = models.DateTimeField(blank=True, null=True, db_index=True, verbose_name='最后登录时间')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = '用户'
        indexes = [
            models.Index(fields=['openid']),
            models.Index(fields=['unionid']),
            models.Index(fields=['created_at']),
            models.Index(fields=['last_login_at']),
        ]

    def __str__(self):
        return self.nickname or self.openid
