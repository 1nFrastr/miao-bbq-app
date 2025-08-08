#!/usr/bin/env python
"""
删除没有完整经纬度信息的帖子脚本

使用方法:
1. Django管理命令方式 (推荐):
   python manage.py delete_posts_without_location --dry-run
   python manage.py delete_posts_without_location

2. 直接运行此脚本:
   python delete_incomplete_location_posts.py
"""

import os
import sys
import django
from decimal import Decimal

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import transaction
from community.models import Post, PostImage, PostLike


def find_posts_without_complete_location():
    """查找没有完整经纬度信息的帖子"""
    # 使用Q对象来查找latitude或longitude为空的帖子
    from django.db.models import Q
    
    posts_without_location = Post.objects.filter(
        Q(latitude__isnull=True) | Q(longitude__isnull=True)
    ).order_by('id')
    
    return posts_without_location


def display_posts_info(posts):
    """显示帖子信息"""
    print(f"\n找到 {posts.count()} 个缺少经纬度信息的帖子:")
    print("-" * 80)
    
    for post in posts:
        location_issues = []
        if post.latitude is None:
            location_issues.append("纬度缺失")
        if post.longitude is None:
            location_issues.append("经度缺失")
        
        print(f"ID: {post.id:4d} | 店铺: {post.shop_name:20s} | "
              f"状态: {post.get_status_display():6s} | "
              f"问题: {', '.join(location_issues):12s} | "
              f"创建时间: {post.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
    
    print("-" * 80)


def delete_posts_without_location(posts, dry_run=True):
    """删除没有完整经纬度信息的帖子"""
    if posts.count() == 0:
        print("没有找到需要删除的帖子")
        return
    
    if dry_run:
        print("\n[预览模式] 以下帖子将被删除:")
        display_posts_info(posts)
        print("\n这是预览模式，没有实际删除任何数据")
        return
    
    try:
        with transaction.atomic():
            # 统计相关数据
            related_images_count = PostImage.objects.filter(post__in=posts).count()
            related_likes_count = PostLike.objects.filter(post__in=posts).count()
            
            print(f"\n准备删除:")
            print(f"- 帖子: {posts.count()} 个")
            print(f"- 相关图片: {related_images_count} 个")
            print(f"- 相关点赞: {related_likes_count} 个")
            
            # 删除帖子（级联删除相关图片和点赞）
            deleted_count, deleted_details = posts.delete()
            
            print(f"\n✅ 删除成功:")
            print(f"- 帖子: {deleted_details.get('community.Post', 0)} 个")
            print(f"- 相关图片: {deleted_details.get('community.PostImage', 0)} 个")
            print(f"- 相关点赞: {deleted_details.get('community.PostLike', 0)} 个")
            
    except Exception as e:
        print(f"\n❌ 删除操作失败: {str(e)}")


def main():
    """主函数"""
    print("🔍 正在查找没有完整经纬度信息的帖子...")
    
    # 查找问题帖子
    posts_without_location = find_posts_without_complete_location()
    
    if posts_without_location.count() == 0:
        print("✅ 没有找到缺少经纬度信息的帖子")
        return
    
    # 显示预览
    display_posts_info(posts_without_location)
    
    # 询问是否执行删除
    print(f"\n⚠️  警告: 即将删除 {posts_without_location.count()} 个帖子及其相关数据")
    choice = input("确定要执行删除操作吗？输入 'yes' 确认，其他任意键取消: ").strip().lower()
    
    if choice == 'yes':
        delete_posts_without_location(posts_without_location, dry_run=False)
    else:
        print("操作已取消")


if __name__ == "__main__":
    main()
