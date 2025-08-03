from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'nickname', 'openid', 'gender', 'city', 'is_active', 'last_login_at', 'created_at']
    list_filter = ['gender', 'is_active', 'city', 'province', 'created_at']
    search_fields = ['nickname', 'openid', 'city']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
