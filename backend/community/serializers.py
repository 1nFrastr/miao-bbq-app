from rest_framework import serializers
from .models import Post, PostImage, PostLike
from users.serializers import UserSerializer


class PostImageSerializer(serializers.ModelSerializer):
    """分享图片序列化器"""
    
    class Meta:
        model = PostImage
        fields = ['id', 'image_url', 'sort_order', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostLikeSerializer(serializers.ModelSerializer):
    """点赞序列化器"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PostLike
        fields = ['id', 'user', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    """社区分享序列化器"""
    user = UserSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'user', 'shop_name', 'shop_price',
            'comment', 'latitude', 'longitude', 'location_address',
            'status', 'likes_count', 'view_count', 'created_at',
            'updated_at', 'images', 'is_liked', 'distance'
        ]
        read_only_fields = [
            'id', 'likes_count', 'view_count', 'created_at', 'updated_at'
        ]
    
    def get_is_liked(self, obj):
        """获取当前用户是否点赞"""
        request = self.context.get('request')
        if request:
            openid = request.META.get('HTTP_X_OPENID')
            if openid:
                try:
                    from users.models import User
                    user = User.objects.get(openid=openid)
                    return PostLike.objects.filter(post=obj, user=user).exists()
                except User.DoesNotExist:
                    pass
        return False
    
    def get_distance(self, obj):
        """计算距离（需要前端传入当前位置）"""
        request = self.context.get('request')
        if request and obj.latitude and obj.longitude:
            user_lat = request.query_params.get('lat')
            user_lng = request.query_params.get('lng')
            if user_lat and user_lng:
                # 简单的距离计算，实际项目中可以使用更精确的算法
                import math
                try:
                    lat1, lng1 = float(user_lat), float(user_lng)
                    lat2, lng2 = float(obj.latitude), float(obj.longitude)
                    
                    # 使用半正矢公式计算距离
                    R = 6371  # 地球半径，单位：公里
                    dlat = math.radians(lat2 - lat1)
                    dlng = math.radians(lng2 - lng1)
                    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2) * math.sin(dlng/2)
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                    distance = R * c
                    return round(distance, 2)
                except:
                    pass
        return None


class PostCreateSerializer(serializers.ModelSerializer):
    """社区分享创建序列化器"""
    images = PostImageSerializer(many=True, required=False)
    
    class Meta:
        model = Post
        fields = [
            'shop_name', 'shop_price', 'comment',
            'latitude', 'longitude', 'location_address', 'images'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        # 手动设置新发布的帖子为已审核通过状态
        validated_data['status'] = 'approved'
        post = Post.objects.create(**validated_data)
        
        # 创建图片记录
        for i, image_data in enumerate(images_data[:3]):  # 最多3张图片
            PostImage.objects.create(
                post=post,
                sort_order=i,
                **image_data
            )
        
        return post


class PostUpdateSerializer(serializers.ModelSerializer):
    """社区分享更新序列化器"""
    
    class Meta:
        model = Post
        fields = [
            'shop_name', 'shop_price', 'comment',
            'latitude', 'longitude', 'location_address'
        ]


class PostListSerializer(serializers.ModelSerializer):
    """社区分享列表序列化器（简化版）"""
    user = UserSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'user', 'shop_name', 'shop_price',
            'comment', 'latitude', 'longitude', 'location_address',
            'status', 'likes_count', 'view_count', 'created_at',
            'images', 'is_liked', 'distance'
        ]
    
    def get_is_liked(self, obj):
        """获取当前用户是否点赞"""
        request = self.context.get('request')
        if request:
            openid = request.META.get('HTTP_X_OPENID')
            if openid:
                try:
                    from users.models import User
                    user = User.objects.get(openid=openid)
                    return PostLike.objects.filter(post=obj, user=user).exists()
                except User.DoesNotExist:
                    pass
        return False
    
    def get_distance(self, obj):
        """计算距离"""
        request = self.context.get('request')
        if request and obj.latitude and obj.longitude:
            user_lat = request.query_params.get('lat')
            user_lng = request.query_params.get('lng')
            if user_lat and user_lng:
                import math
                try:
                    lat1, lng1 = float(user_lat), float(user_lng)
                    lat2, lng2 = float(obj.latitude), float(obj.longitude)
                    
                    R = 6371
                    dlat = math.radians(lat2 - lat1)
                    dlng = math.radians(lng2 - lng1)
                    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2) * math.sin(dlng/2)
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                    distance = R * c
                    return round(distance, 2)
                except:
                    pass
        return None
