# 数据模型定义

## 项目背景
这是一个基于Taro框架+Django框架开发的微信小程序全栈项目，主要功能是烧烤点单记录与社区推荐。参考refer文件夹下面的app.html和admin.html，分别是用户端原型图和后台原型图，请根据这两个原型图设计完整的数据库模型。

## 功能概述
根据原型图分析，系统主要包含以下功能：

### 用户端功能（app.html）
1. **订单记录功能**：
   - 添加菜品（菜名、单价、数量）
   - 订单管理（增删改查）
   - 订单状态管理（未开始、处理中、已完成）
   - 订单计时功能
   - 总金额计算

2. **社区推荐功能**：
   - 发布烧烤店推荐（店名、地址、人均消费、推荐理由）
   - 上传图片（最多3张）
   - 位置信息获取和存储
   - 内容按距离、时间、热度排序
   - 点赞功能

### 管理端功能（admin.html）
1. **数据统计**：
   - 用户总数、分享总数、待审核数量、今日活跃用户
   - 用户活跃度趋势图表
   - 内容状态分布统计

2. **内容管理**：
   - 内容审核（待审核、已展示、已拒绝）
   - 内容排序（最新、热度、时间）
   - 内容搜索
   - 内容删除

3. **用户管理**：
   - 用户信息查看
   - 用户活跃度统计
   - 用户贡献排行

## 设计要求
请基于以上功能分析，设计出完整的数据库模型结构，包括：

1. **用户相关模型**：
   - 考虑微信小程序的用户体系
   - 用户基本信息、注册时间、活跃状态等

2. **订单相关模型**：
   - 订单主表和订单明细表的关系
   - 订单状态管理
   - 计时功能相关字段

3. **社区内容模型**：
   - 店铺推荐信息
   - 图片存储方案
   - 位置信息存储
   - 内容状态管理（审核状态）

4. **互动相关模型**：
   - 点赞系统
   - 评论系统（如需要）

5. **管理相关模型**：
   - 管理员用户
   - 操作日志等

## 数据库表结构设计

### 总共8张表

1. **users** - 用户表
2. **orders** - 订单表
3. **order_items** - 订单明细表
4. **posts** - 社区分享表
5. **post_images** - 分享图片表
6. **post_likes** - 点赞表
7. **admin_users** - 管理员表
8. **admin_logs** - 管理操作日志表

---

### 1. users（用户表）
**字段定义：**
- id：主键，自增整数，必填
- openid：微信openid，字符串(128)，必填，唯一索引
- unionid：微信unionid，字符串(128)，可空，索引
- nickname：用户昵称，字符串(100)，可空
- avatar_url：头像地址，字符串(500)，可空
- gender：性别，整数(0未知/1男/2女)，默认0
- city：城市，字符串(50)，可空
- province：省份，字符串(50)，可空
- country：国家，字符串(50)，可空
- is_active：是否活跃，布尔值，默认True
- last_login_at：最后登录时间，时间戳，可空
- created_at：创建时间，时间戳，必填
- updated_at：更新时间，时间戳，必填

**索引：**
- openid（唯一）
- unionid
- created_at
- last_login_at

---

### 2. orders（订单表）
**字段定义：**
- id：主键，自增整数，必填
- user_id：用户ID，外键关联users.id，必填
- status：订单状态，字符串(20)，必填（pending待开始/processing处理中/completed已完成）
- total_amount：总金额，decimal(10,2)，必填，默认0.00
- item_count：菜品数量，整数，必填，默认0
- start_time：开始计时时间，时间戳，可空
- complete_time：完成时间，时间戳，可空
- waiting_seconds：等待秒数，整数，默认0
- created_at：创建时间，时间戳，必填
- updated_at：更新时间，时间戳，必填

**索引：**
- user_id
- status
- created_at

**外键关系：**
- user_id → users.id

---

### 3. order_items（订单明细表）
**字段定义：**
- id：主键，自增整数，必填
- order_id：订单ID，外键关联orders.id，必填
- dish_name：菜品名称，字符串(100)，必填
- unit_price：单价，decimal(8,2)，必填
- quantity：数量，整数，必填
- subtotal：小计，decimal(10,2)，必填
- created_at：创建时间，时间戳，必填
- updated_at：更新时间，时间戳，必填

**索引：**
- order_id
- dish_name

**外键关系：**
- order_id → orders.id（级联删除）

---

### 4. posts（社区分享表）
**字段定义：**
- id：主键，自增整数，必填
- user_id：用户ID，外键关联users.id，必填
- shop_name：店铺名称，字符串(100)，必填
- shop_location：店铺地址，字符串(200)，必填
- shop_price：人均消费，整数，必填
- comment：推荐理由，文本，必填
- latitude：纬度，decimal(10,8)，可空
- longitude：经度，decimal(11,8)，可空
- location_address：位置地址，字符串(300)，可空
- status：审核状态，字符串(20)，必填（pending待审核/approved已展示/rejected已拒绝）
- likes_count：点赞数，整数，默认0
- view_count：查看数，整数，默认0
- created_at：创建时间，时间戳，必填
- updated_at：更新时间，时间戳，必填

**索引：**
- user_id
- status
- created_at
- likes_count
- latitude, longitude（组合索引，用于位置查询）

**外键关系：**
- user_id → users.id

---

### 5. post_images（分享图片表）
**字段定义：**
- id：主键，自增整数，必填
- post_id：分享ID，外键关联posts.id，必填
- image_url：图片地址，字符串(500)，必填
- sort_order：排序顺序，整数，默认0
- created_at：创建时间，时间戳，必填

**索引：**
- post_id
- sort_order

**外键关系：**
- post_id → posts.id（级联删除）

**约束：**
- 每个post最多3张图片

---

### 6. post_likes（点赞表）
**字段定义：**
- id：主键，自增整数，必填
- post_id：分享ID，外键关联posts.id，必填
- user_id：用户ID，外键关联users.id，必填
- created_at：创建时间，时间戳，必填

**索引：**
- post_id, user_id（组合唯一索引）
- user_id
- created_at

**外键关系：**
- post_id → posts.id（级联删除）
- user_id → users.id（级联删除）

**约束：**
- post_id + user_id 联合唯一（同一用户不能重复点赞同一内容）

---

### 7. admin_users（管理员表）
**字段定义：**
- id：主键，自增整数，必填
- username：用户名，字符串(50)，必填，唯一
- password：密码哈希，字符串(128)，必填
- email：邮箱，字符串(100)，可空
- real_name：真实姓名，字符串(50)，可空
- is_active：是否激活，布尔值，默认True
- is_superuser：是否超级管理员，布尔值，默认False
- last_login_at：最后登录时间，时间戳，可空
- created_at：创建时间，时间戳，必填
- updated_at：更新时间，时间戳，必填

**索引：**
- username（唯一）
- email
- last_login_at

---

### 8. admin_logs（管理操作日志表）
**字段定义：**
- id：主键，自增整数，必填
- admin_id：管理员ID，外键关联admin_users.id，必填
- action：操作类型，字符串(50)，必填（approve审核通过/reject审核拒绝/delete删除等）
- target_type：目标类型，字符串(20)，必填（post/user等）
- target_id：目标ID，整数，必填
- description：操作描述，字符串(500)，可空
- ip_address：IP地址，字符串(45)，可空
- user_agent：用户代理，字符串(500)，可空
- created_at：创建时间，时间戳，必填

**索引：**
- admin_id
- action
- target_type, target_id（组合索引）
- created_at

**外键关系：**
- admin_id → admin_users.id

---

## 表关系总结

### 一对多关系：
1. users → orders（一个用户可以有多个订单）
2. orders → order_items（一个订单可以有多个菜品）
3. users → posts（一个用户可以发布多个分享）
4. posts → post_images（一个分享可以有多张图片）
5. admin_users → admin_logs（一个管理员可以有多条操作日志）

### 多对多关系：
1. users ↔ posts（通过post_likes表实现用户和分享的点赞关系）

### 特殊约束：
1. 每个分享最多3张图片
2. 用户不能重复点赞同一内容
3. 订单状态只能是 pending/processing/completed
4. 分享审核状态只能是 pending/approved/rejected