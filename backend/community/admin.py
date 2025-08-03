from django.contrib import admin
from .models import Post, PostImage, PostLike


class PostImageInline(admin.TabularInline):
    model = PostImage
    extra = 0


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'shop_name', 'user', 'status', 'likes_count', 'view_count', 'created_at']
    list_filter = ['status', 'created_at', 'shop_price']
    search_fields = ['shop_name', 'shop_location', 'user__nickname', 'comment']
    readonly_fields = ['likes_count', 'view_count', 'created_at', 'updated_at']
    inlines = [PostImageInline]
    ordering = ['-created_at']


@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'sort_order', 'created_at']
    list_filter = ['created_at']
    ordering = ['post', 'sort_order']


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['post__shop_name', 'user__nickname']
    ordering = ['-created_at']
