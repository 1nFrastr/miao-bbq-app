# 删除没有完整经纬度信息的帖子

本项目提供了两种方式来删除没有完整经纬度信息的帖子（latitude或longitude为空的帖子）。

## 方式一：Django管理命令 (推荐)

### 使用方法

1. **预览模式** - 查看将被删除的帖子，不实际删除：
```bash
source ./backend/venv/Scripts/activate
python ./backend/manage.py delete_posts_without_location --dry-run
```

2. **实际删除**：
```bash
source ./backend/venv/Scripts/activate
python ./backend/manage.py delete_posts_without_location
```

3. **按状态筛选**：
```bash
# 只删除待审核状态的帖子
python ./backend/manage.py delete_posts_without_location --status pending

# 只删除已通过状态的帖子  
python ./backend/manage.py delete_posts_without_location --status approved

# 只删除已拒绝状态的帖子
python ./backend/manage.py delete_posts_without_location --status rejected
```

### 命令参数

- `--dry-run`: 预览模式，只显示将被删除的帖子，不实际删除
- `--status`: 指定要检查的帖子状态
  - `pending`: 待审核
  - `approved`: 已展示
  - `rejected`: 已拒绝
  - `all`: 所有状态 (默认)

## 方式二：独立Python脚本

### 使用方法

```bash
source ./backend/venv/Scripts/activate
cd ./backend
python delete_incomplete_location_posts.py
```

这个脚本会：
1. 自动查找所有缺少经纬度信息的帖子
2. 显示详细的帖子信息预览
3. 询问确认后执行删除操作

## 脚本功能

### 检测条件

脚本会查找以下情况的帖子：
- `latitude` 字段为 `NULL` 的帖子
- `longitude` 字段为 `NULL` 的帖子

### 删除范围

删除帖子时会同时删除：
- 帖子本身 (`Post`)
- 帖子相关的图片 (`PostImage`)
- 帖子相关的点赞记录 (`PostLike`)

### 安全特性

1. **预览功能**: 可以先查看将被删除的内容
2. **确认机制**: 删除前需要用户确认
3. **事务保护**: 使用数据库事务，确保数据一致性
4. **详细日志**: 显示删除的具体数量和类型

## 示例输出

```
🔍 正在查找没有完整经纬度信息的帖子...

找到 3 个缺少经纬度信息的帖子:
--------------------------------------------------------------------------------
ID:    1 | 店铺: 测试烧烤店           | 状态: 待审核   | 问题: 纬度缺失, 经度缺失 | 创建时间: 2025-01-01 10:00:00
ID:    5 | 店铺: 另一家店             | 状态: 已展示   | 问题: 经度缺失      | 创建时间: 2025-01-02 15:30:00
ID:   12 | 店铺: 第三家店             | 状态: 已拒绝   | 问题: 纬度缺失      | 创建时间: 2025-01-03 20:15:00
--------------------------------------------------------------------------------

⚠️  警告: 即将删除 3 个帖子及其相关数据
确定要执行删除操作吗？输入 'yes' 确认，其他任意键取消: yes

准备删除:
- 帖子: 3 个
- 相关图片: 8 个
- 相关点赞: 12 个

✅ 删除成功:
- 帖子: 3 个
- 相关图片: 8 个  
- 相关点赞: 12 个
```

## 注意事项

1. **备份数据**: 执行删除操作前建议备份数据库
2. **生产环境**: 在生产环境使用前，请先在测试环境验证
3. **不可恢复**: 删除操作不可恢复，请谨慎使用
4. **关联数据**: 删除帖子会同时删除相关的图片和点赞数据
