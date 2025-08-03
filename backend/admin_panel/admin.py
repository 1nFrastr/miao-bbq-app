from django.contrib import admin
from .models import AdminUser, AdminLog


@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'real_name', 'is_active', 'is_superuser', 'last_login_at', 'created_at']
    list_filter = ['is_active', 'is_superuser', 'created_at']
    search_fields = ['username', 'real_name', 'email']
    readonly_fields = ['created_at', 'updated_at', 'last_login_at']
    ordering = ['-created_at']


@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'admin', 'action', 'target_type', 'target_id', 'created_at']
    list_filter = ['action', 'target_type', 'created_at']
    search_fields = ['admin__username', 'description']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
