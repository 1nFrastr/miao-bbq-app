from django.contrib import admin
from .models import Post, PostImage, PostLike
from django.utils.html import format_html


class PostImageInline(admin.TabularInline):
    model = PostImage
    extra = 0
    readonly_fields = ['image_tag']
    fields = ['image_url', 'sort_order', 'image_tag']

    def image_tag(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" style="max-width:120px; max-height:120px;" />', obj.image_url)
        return ""
    image_tag.short_description = '图片预览'


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
    list_display = ['id', 'post', 'sort_order', 'created_at', 'image_tag']
    list_filter = ['created_at']
    ordering = ['post', 'sort_order']
    readonly_fields = ['image_tag']

    def image_tag(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" style="max-width:120px; max-height:120px;" />', obj.image_url)
        return ""
    image_tag.short_description = '图片预览'


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['post__shop_name', 'user__nickname']
    ordering = ['-created_at']
