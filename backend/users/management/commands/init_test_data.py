"""
初始化测试数据的管理命令
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from orders.models import Order, OrderItem
from community.models import Post, PostImage
from admin_panel.models import AdminUser


class Command(BaseCommand):
    help = '创建测试数据'

    def handle(self, *args, **options):
        self.stdout.write('开始创建测试数据...')
        
        # 创建测试用户
        self.create_test_users()
        
        # 创建管理员
        self.create_admin_users()
        
        # 创建测试订单
        self.create_test_orders()
        
        # 创建测试分享
        self.create_test_posts()
        
        self.stdout.write(self.style.SUCCESS('测试数据创建完成!'))

    def create_test_users(self):
        """创建测试用户"""
        users_data = [
            {
                'openid': 'test_openid_001',
                'nickname': '张三',
                'gender': 1,
                'city': '北京',
                'province': '北京',
                'country': '中国',
            },
            {
                'openid': 'test_openid_002', 
                'nickname': '李四',
                'gender': 2,
                'city': '上海',
                'province': '上海',
                'country': '中国',
            },
            {
                'openid': 'test_openid_003',
                'nickname': '王五',
                'gender': 1,
                'city': '广州',
                'province': '广东',
                'country': '中国',
            }
        ]
        
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                openid=user_data['openid'],
                defaults=user_data
            )
            if created:
                self.stdout.write(f'创建用户: {user.nickname}')

    def create_admin_users(self):
        """创建管理员用户"""
        admin_data = {
            'username': 'admin',
            'email': 'admin@example.com',
            'real_name': '系统管理员',
            'is_superuser': True,
        }
        
        admin_user, created = AdminUser.objects.get_or_create(
            username=admin_data['username'],
            defaults=admin_data
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'创建管理员: {admin_user.username}，密码: admin123')

    def create_test_orders(self):
        """创建测试订单"""
        user = User.objects.first()
        if not user:
            return
        
        # 创建一个待开始的订单
        order1 = Order.objects.create(
            user=user,
            status='pending'
        )
        
        OrderItem.objects.create(
            order=order1,
            dish_name='烤羊肉串',
            unit_price=3.00,
            quantity=10
        )
        
        OrderItem.objects.create(
            order=order1,
            dish_name='烤鸡翅',
            unit_price=8.00,
            quantity=5
        )
        
        order1.item_count = 2
        order1.calculate_total()
        
        # 创建一个已完成的订单
        order2 = Order.objects.create(
            user=user,
            status='completed',
            start_time=timezone.now() - timezone.timedelta(hours=2),
            complete_time=timezone.now() - timezone.timedelta(hours=1),
            waiting_seconds=3600
        )
        
        OrderItem.objects.create(
            order=order2,
            dish_name='烤牛肉',
            unit_price=12.00,
            quantity=3
        )
        
        order2.item_count = 1
        order2.calculate_total()
        
        self.stdout.write(f'创建订单: {Order.objects.count()}个')

    def create_test_posts(self):
        """创建测试分享"""
        users = User.objects.all()
        if not users:
            return
        
        posts_data = [
            {
                'shop_name': '老北京烧烤',
                'shop_location': '北京市朝阳区三里屯',
                'shop_price': 80,
                'comment': '这家烧烤店的羊肉串特别香，老板人也很好，强烈推荐！',
                'latitude': 39.9042,
                'longitude': 116.4074,
                'status': 'approved'
            },
            {
                'shop_name': '新疆风味烧烤',
                'shop_location': '上海市徐汇区',
                'shop_price': 120,
                'comment': '正宗的新疆烧烤，羊肉很新鲜，配菜也很棒',
                'latitude': 31.2304,
                'longitude': 121.4737,
                'status': 'pending'
            },
            {
                'shop_name': '深夜烧烤档',
                'shop_location': '广州市天河区',
                'shop_price': 60,
                'comment': '宵夜首选，价格实惠，味道不错，就是环境一般',
                'latitude': 23.1291,
                'longitude': 113.2644,
                'status': 'approved'
            }
        ]
        
        for i, post_data in enumerate(posts_data):
            user = users[i % len(users)]
            post = Post.objects.create(
                user=user,
                **post_data
            )
            self.stdout.write(f'创建分享: {post.shop_name}')
