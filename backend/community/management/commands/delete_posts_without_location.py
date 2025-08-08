from django.core.management.base import BaseCommand
from django.db import transaction
from community.models import Post, PostImage, PostLike


class Command(BaseCommand):
    help = '删除没有完整经纬度信息的帖子'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='仅显示将被删除的帖子，不实际删除',
        )
        parser.add_argument(
            '--status',
            type=str,
            choices=['pending', 'approved', 'rejected', 'all'],
            default='all',
            help='指定要检查的帖子状态 (默认: all)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        status_filter = options['status']
        
        # 构建查询条件：latitude 或 longitude 为空的帖子
        from django.db.models import Q
        
        location_filter = Q(latitude__isnull=True) | Q(longitude__isnull=True)
        
        # 如果指定了状态，添加状态过滤
        if status_filter != 'all':
            location_filter = location_filter & Q(status=status_filter)

        # 查找没有完整经纬度信息的帖子
        posts_without_location = Post.objects.filter(location_filter).order_by('id')

        if not posts_without_location.exists():
            self.stdout.write(
                self.style.SUCCESS('没有找到缺少经纬度信息的帖子')
            )
            return

        # 统计信息
        total_count = posts_without_location.count()
        
        self.stdout.write(
            self.style.WARNING(f'找到 {total_count} 个缺少经纬度信息的帖子:')
        )
        
        # 显示将要删除的帖子信息
        for post in posts_without_location:
            location_info = []
            if post.latitude is None:
                location_info.append('纬度缺失')
            if post.longitude is None:
                location_info.append('经度缺失')
            
            self.stdout.write(
                f'- ID: {post.id}, 店铺: {post.shop_name}, '
                f'状态: {post.get_status_display()}, '
                f'问题: {", ".join(location_info)}, '
                f'创建时间: {post.created_at.strftime("%Y-%m-%d %H:%M:%S")}'
            )

        if dry_run:
            self.stdout.write(
                self.style.WARNING('这是预览模式，没有实际删除任何数据')
            )
            return

        # 确认删除
        confirm = input(f'\n确定要删除这 {total_count} 个帖子吗？(输入 "yes" 确认): ')
        if confirm.lower() != 'yes':
            self.stdout.write(
                self.style.SUCCESS('操作已取消')
            )
            return

        # 执行删除操作
        try:
            with transaction.atomic():
                # 统计相关数据
                related_images_count = PostImage.objects.filter(post__in=posts_without_location).count()
                related_likes_count = PostLike.objects.filter(post__in=posts_without_location).count()
                
                # 删除帖子（级联删除相关图片和点赞）
                deleted_count, deleted_details = posts_without_location.delete()
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'成功删除:\n'
                        f'- 帖子: {deleted_details.get("community.Post", 0)} 个\n'
                        f'- 相关图片: {deleted_details.get("community.PostImage", 0)} 个\n'
                        f'- 相关点赞: {deleted_details.get("community.PostLike", 0)} 个'
                    )
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'删除操作失败: {str(e)}')
            )
