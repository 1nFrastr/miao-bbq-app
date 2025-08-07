"""
为指定用户添加测试帖子的管理命令
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from community.models import Post
import random


class Command(BaseCommand):
    help = '为指定用户添加测试帖子'

    def add_arguments(self, parser):
        parser.add_argument(
            '--openid',
            type=str,
            default='dev_openid_0j41Rd2',
            help='用户的openid'
        )
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='要创建的帖子数量'
        )

    def handle(self, *args, **options):
        openid = options['openid']
        count = options['count']
        
        self.stdout.write(f'开始为用户 {openid} 创建 {count} 条测试帖子...')
        
        # 获取或创建用户
        user, created = User.objects.get_or_create(
            openid=openid,
            defaults={
                'nickname': '测试用户',
                'gender': 1,
                'city': '深圳',
                'province': '广东',
                'country': '中国',
            }
        )
        
        if created:
            self.stdout.write(f'创建新用户: {user.nickname} ({user.openid})')
        else:
            self.stdout.write(f'找到用户: {user.nickname} ({user.openid})')
        
        # 创建测试帖子
        self.create_test_posts(user, count)
        
        self.stdout.write(self.style.SUCCESS(f'成功为用户 {openid} 创建了 {count} 条测试帖子!'))

    def create_test_posts(self, user, count):
        """创建测试分享"""
        
        # 烧烤店名称模板
        shop_names = [
            '老王烧烤摊', '麻辣烧烤屋', '深夜烧烤档', '新疆风味烧烤', '老北京烧烤',
            '重庆烧烤王', '成都烧烤店', '东北烧烤城', '海鲜烧烤吧', '韩式烧烤店',
            '炭火烧烤屋', '街边烧烤摊', '24小时烧烤', '大排档烧烤', '精品烧烤',
            '回民烧烤店', '蒙古烧烤', '广式烧烤', '湖南烧烤', '四川烧烤'
        ]
        
        # 地点模板
        locations = [
            '深圳市南山区科技园', '深圳市福田区华强北', '深圳市罗湖区东门',
            '深圳市宝安区西乡', '深圳市龙岗区布吉', '深圳市盐田区沙头角',
            '深圳市光明区公明', '深圳市坪山区坪山', '深圳市龙华区民治',
            '深圳市大鹏新区葵涌', '深圳市前海深港现代服务业合作区',
            '广州市天河区珠江新城', '广州市越秀区北京路', '广州市海珠区琶洲',
            '东莞市南城区', '佛山市南海区', '惠州市惠城区', '中山市石岐区',
            '珠海市香洲区', '江门市蓬江区'
        ]
        
        # 评论模板
        comments = [
            '这家烧烤店的羊肉串特别香，老板人也很好，强烈推荐！',
            '正宗的新疆烧烤，羊肉很新鲜，配菜也很棒，下次还会来',
            '宵夜首选，价格实惠，味道不错，就是环境一般般',
            '烤鸡翅超级棒！外焦里嫩，配上孜然粉绝了',
            '老板很实在，分量足，味道正宗，性价比很高',
            '深夜觅食的好去处，烤茄子和烤韭菜特别推荐',
            '朋友聚会的首选地，氛围好，烧烤也很棒',
            '这里的烤牛肉串是我吃过最好吃的，没有之一',
            '环境不错，服务态度好，烧烤味道也很棒',
            '价格有点贵，但是味道确实不错，偶尔来一次还行',
            '烤鱼做得特别好，外皮酥脆，鱼肉鲜嫩',
            '这家店的特色是烤羊排，香气扑鼻，肉质鲜美',
            '夜宵时间人很多，需要排队，但是等待是值得的',
            '烤蔬菜也很棒，素食主义者的福音',
            '老板娘人很好，还会免费送小菜',
            '这里的啤酒很冰，配烧烤绝配',
            '烤肉串的调料很香，有秘制配方的感觉',
            '地理位置很好找，就在地铁站附近',
            '卫生条件不错，餐具都很干净',
            '烤土豆片特别推荐，外焦内软很好吃'
        ]
        
        # 状态分布：60%已审核，25%待审核，15%已拒绝
        statuses = ['approved'] * 12 + ['pending'] * 5 + ['rejected'] * 3
        
        # 深圳地区经纬度范围
        lat_min, lat_max = 22.4, 22.8
        lng_min, lng_max = 113.8, 114.6
        
        created_count = 0
        for i in range(count):
            # 随机选择数据
            shop_name = random.choice(shop_names)
            location = random.choice(locations)
            comment = random.choice(comments)
            status = random.choice(statuses)
            
            # 随机价格 30-200
            price = random.randint(30, 200)
            
            # 随机经纬度（深圳地区）
            latitude = round(random.uniform(lat_min, lat_max), 6)
            longitude = round(random.uniform(lng_min, lng_max), 6)
            
            # 随机创建时间（最近30天内）
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            created_time = timezone.now() - timezone.timedelta(
                days=days_ago, 
                hours=hours_ago, 
                minutes=minutes_ago
            )
            
            post = Post.objects.create(
                user=user,
                shop_name=shop_name,
                shop_price=price,
                comment=comment,
                latitude=latitude,
                longitude=longitude,
                location_address=location,
                status=status,
                created_at=created_time,
                updated_at=created_time
            )
            
            # 随机添加一些点赞和浏览数
            post.likes_count = random.randint(0, 50)
            post.view_count = random.randint(post.likes_count, 200)
            post.save()
            
            created_count += 1
            self.stdout.write(f'创建帖子 {created_count}/{count}: {shop_name} - {status}')
        
        self.stdout.write(f'总共创建了 {created_count} 条帖子')
        
        # 统计不同状态的帖子数量
        user_posts = Post.objects.filter(user=user)
        approved_count = user_posts.filter(status='approved').count()
        pending_count = user_posts.filter(status='pending').count()
        rejected_count = user_posts.filter(status='rejected').count()
        
        self.stdout.write(f'用户 {user.openid} 的帖子统计:')
        self.stdout.write(f'  已审核: {approved_count} 条')
        self.stdout.write(f'  待审核: {pending_count} 条')
        self.stdout.write(f'  已拒绝: {rejected_count} 条')
        self.stdout.write(f'  总计: {user_posts.count()} 条')
