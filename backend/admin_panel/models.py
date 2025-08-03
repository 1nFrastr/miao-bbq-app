from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class AdminUser(models.Model):
    """管理员表"""
    username = models.CharField(max_length=50, unique=True, db_index=True, verbose_name='用户名')
    password = models.CharField(max_length=128, verbose_name='密码哈希')
    email = models.EmailField(max_length=100, blank=True, null=True, db_index=True, verbose_name='邮箱')
    real_name = models.CharField(max_length=50, blank=True, null=True, verbose_name='真实姓名')
    is_active = models.BooleanField(default=True, verbose_name='是否激活')
    is_superuser = models.BooleanField(default=False, verbose_name='是否超级管理员')
    last_login_at = models.DateTimeField(blank=True, null=True, db_index=True, verbose_name='最后登录时间')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'admin_users'
        verbose_name = '管理员'
        verbose_name_plural = '管理员'
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['last_login_at']),
        ]

    def __str__(self):
        return self.username

    def set_password(self, raw_password):
        """设置密码"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """验证密码"""
        return check_password(raw_password, self.password)


class AdminLog(models.Model):
    """管理操作日志表"""
    ACTION_CHOICES = [
        ('approve', '审核通过'),
        ('reject', '审核拒绝'),
        ('delete', '删除'),
        ('login', '登录'),
        ('logout', '登出'),
        ('create', '创建'),
        ('update', '更新'),
    ]
    
    TARGET_TYPE_CHOICES = [
        ('post', '分享'),
        ('user', '用户'),
        ('admin', '管理员'),
    ]
    
    admin = models.ForeignKey(AdminUser, on_delete=models.CASCADE, db_index=True, verbose_name='管理员')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, db_index=True, verbose_name='操作类型')
    target_type = models.CharField(max_length=20, choices=TARGET_TYPE_CHOICES, verbose_name='目标类型')
    target_id = models.IntegerField(verbose_name='目标ID')
    description = models.CharField(max_length=500, blank=True, null=True, verbose_name='操作描述')
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name='IP地址')
    user_agent = models.CharField(max_length=500, blank=True, null=True, verbose_name='用户代理')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name='创建时间')

    class Meta:
        db_table = 'admin_logs'
        verbose_name = '管理操作日志'
        verbose_name_plural = '管理操作日志'
        indexes = [
            models.Index(fields=['admin']),
            models.Index(fields=['action']),
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.admin.username} {self.get_action_display()} {self.get_target_type_display()}#{self.target_id}'
