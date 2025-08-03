# API接口文档

## 基础信息

- 基础URL: `http://localhost:8000/api/`
- 认证方式: 
  - 小程序用户: Header中传入 `X-Openid: {openid}`
  - 管理员: Header中传入 `X-Admin-Id: {admin_id}`

## 用户相关接口

### 1. 用户登录/注册 (POST /api/users/users/login/)
```json
{
    "openid": "user_openid",
    "unionid": "user_unionid",  // 可选
    "nickname": "用户昵称",
    "avatar_url": "头像URL",
    "gender": 1,  // 0未知 1男 2女
    "city": "城市",
    "province": "省份",
    "country": "国家"
}
```

响应:
```json
{
    "user": {
        "id": 1,
        "openid": "user_openid",
        "nickname": "用户昵称",
        // ... 其他用户信息
    },
    "is_new_user": true  // 是否为新用户
}
```

### 2. 获取用户列表 (GET /api/users/users/)
### 3. 获取用户详情 (GET /api/users/users/{id}/)
### 4. 更新用户资料 (POST /api/users/users/{id}/update_profile/)

## 订单相关接口

### 1. 创建订单 (POST /api/orders/orders/)
```json
{
    "status": "pending",
    "items": [
        {
            "dish_name": "烤羊肉串",
            "unit_price": 3.00,
            "quantity": 10
        }
    ]
}
```

### 2. 获取订单列表 (GET /api/orders/orders/)
### 3. 获取订单详情 (GET /api/orders/orders/{id}/)
### 4. 开始计时 (POST /api/orders/orders/{id}/start_timer/)
### 5. 完成订单 (POST /api/orders/orders/{id}/complete/)
### 6. 添加菜品 (POST /api/orders/orders/{id}/add_item/)
### 7. 删除菜品 (DELETE /api/orders/orders/{id}/remove_item/?item_id={item_id})
### 8. 订单统计 (GET /api/orders/orders/statistics/)

## 社区相关接口

### 1. 创建分享 (POST /api/community/posts/)
```json
{
    "shop_name": "店铺名称",
    "shop_location": "店铺地址", 
    "shop_price": 80,
    "comment": "推荐理由",
    "latitude": 39.9042,  // 可选
    "longitude": 116.4074,  // 可选
    "location_address": "详细地址",  // 可选
    "images": [  // 可选，最多3张
        {
            "image_url": "图片URL"
        }
    ]
}
```

### 2. 获取分享列表 (GET /api/community/posts/)
参数:
- `search`: 搜索关键词
- `lat`, `lng`: 当前位置
- `radius`: 搜索半径(公里)
- `ordering`: 排序(-created_at, -likes_count, -view_count)

### 3. 获取分享详情 (GET /api/community/posts/{id}/)
### 4. 点赞/取消点赞 (POST /api/community/posts/{id}/like/)
### 5. 获取点赞列表 (GET /api/community/posts/{id}/likes/)
### 6. 获取我的分享 (GET /api/community/posts/my_posts/)
### 7. 获取附近分享 (GET /api/community/posts/nearby/?lat={lat}&lng={lng}&radius={radius})

## 管理后台接口

### 1. 管理员登录 (POST /api/admin/admin-users/login/)
```json
{
    "username": "admin",
    "password": "admin123"
}
```

### 2. 仪表盘数据 (GET /api/admin/admin-users/dashboard/)
### 3. 内容审核列表 (GET /api/admin/moderation/)
参数:
- `status`: pending(待审核), approved(已通过), rejected(已拒绝)
- `search`: 搜索关键词
- `ordering`: 排序方式

### 4. 审核通过 (POST /api/admin/moderation/{id}/approve/)
### 5. 审核拒绝 (POST /api/admin/moderation/{id}/reject/)
```json
{
    "reason": "拒绝原因"
}
```

### 6. 删除内容 (DELETE /api/admin/moderation/{id}/delete_post/)
### 7. 操作日志 (GET /api/admin/admin-logs/)

## 响应格式

成功响应:
```json
{
    "data": {},  // 数据内容
    "message": "操作成功"  // 可选
}
```

错误响应:
```json
{
    "error": "错误信息",
    "details": {}  // 详细错误信息，可选
}
```

分页响应:
```json
{
    "count": 100,
    "next": "http://localhost:8000/api/posts/?page=2",
    "previous": null,
    "results": []
}
```

## 状态码

- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误
