# 社区页面上传图片功能

## 需求概述
在社区推荐页面的发布表单中添加"上传图片"字段，用户可以拍照或者从相册上传多张图片（最多3张），展示店铺的实际情况。

前端+后端都需要实现完整的文件上传功能，包括图片选择、预览、上传、删除等操作。

后端需考虑使用支持多种存储引擎的库，以便后续拓展到阿里云OSS、腾讯云COS等云存储服务。开发阶段使用本地存储。

## 功能说明

### 1. 功能入口
- **页面位置**: 社区推荐页面 (`frontend-app/src/pages/community/index.tsx`)
- **表单区域**: 在"推荐理由"输入框下方，"发布推荐"按钮上方
- **原型参考**: `.github/feature_prompts/images/location.png`

### 2. 前端功能要求

#### 2.1 图片选择组件
- **组件位置**: `frontend-app/src/components/ImageUploader/`
- **选择方式**: 支持拍照和从相册选择
- **数量限制**: 最多选择3张图片
- **格式限制**: 支持jpg、png、webp格式
- **大小限制**: 单张图片不超过2MB

#### 2.2 UI交互设计
```scss
// 样式要求 (遵循项目设计规范)
.image-uploader {
  .image-list {
    display: flex;
    gap: 16rpx;
    flex-wrap: wrap;
    
    .image-item {
      position: relative;
      width: 200rpx;
      height: 200rpx;
      border-radius: 12rpx;
      border: 2rpx dashed #ddd;
      
      .image-preview {
        width: 100%;
        height: 100%;
        border-radius: 12rpx;
      }
      
      .delete-btn {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        width: 32rpx;
        height: 32rpx;
        background: #ff4757;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .add-btn {
      width: 200rpx;
      height: 200rpx;
      border: 2rpx dashed #FF6B35;
      border-radius: 12rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fff;
      
      &:active {
        background: #f5f5f5;
      }
    }
  }
}
```

#### 2.3 技术实现要求
- **使用Taro API**: `Taro.chooseImage` 选择图片
- **图片压缩**: 使用 `Taro.compressImage` 压缩图片
- **上传接口**: 使用 `Taro.uploadFile` 上传到后端
- **状态管理**: 使用 `useState` 管理图片列表和上传状态
- **错误处理**: 完善的错误提示和重试机制

#### 2.4 组件接口设计
```typescript
interface ImageUploaderProps {
  value?: string[]  // 已上传图片URL列表
  onChange?: (urls: string[]) => void  // 图片变化回调
  maxCount?: number  // 最大图片数量，默认3
  disabled?: boolean  // 是否禁用
}

interface ImageItem {
  id: string
  url: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
}
```

### 3. 后端功能要求

#### 3.1 文件上传API
- **接口路径**: `POST /api/uploads/images/`
- **请求格式**: `multipart/form-data`
- **响应格式**: 
```json
{
  "code": 200,
  "data": {
    "image_url": "http://localhost:8000/media/uploads/images/2024/08/07/xxx.jpg",
    "image_id": "uuid",
    "file_size": 1024000,
    "file_name": "image.jpg"
  },
  "message": "上传成功"
}
```

#### 3.2 存储策略
- **开发环境**: 本地文件存储 (`MEDIA_ROOT/uploads/images/`)
- **目录结构**: 按日期分目录 (`uploads/images/YYYY/MM/DD/`)
- **文件命名**: UUID + 原始扩展名
- **扩展设计**: 预留云存储接口，支持后续切换到OSS/COS

#### 3.3 Django后端实现
```python
# backend/core/settings.py 需要添加的配置
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# 文件上传配置
FILE_UPLOAD_MAX_MEMORY_SIZE = 2 * 1024 * 1024  # 2MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB

# 允许的图片格式
ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2MB

# backend/core/urls.py 需要添加media文件服务
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... 现有的URL配置
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# backend/api/views.py 新增图片上传视图
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import uuid
import os
from PIL import Image
import io

class ImageUploadView(APIView):
    """图片上传接口"""
    
    def post(self, request):
        if 'image' not in request.FILES:
            return Response({'error': '请选择图片文件'}, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        
        # 验证文件类型
        if not self._validate_image_type(image_file):
            return Response({'error': '仅支持jpg、png、webp格式'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 验证文件大小
        if image_file.size > settings.MAX_IMAGE_SIZE:
            return Response({'error': '图片大小不能超过2MB'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 生成唯一文件名
            file_extension = os.path.splitext(image_file.name)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}{file_extension}"
            
            # 按日期创建目录
            from datetime import datetime
            date_path = datetime.now().strftime('%Y/%m/%d')
            file_path = f"uploads/images/{date_path}/{unique_filename}"
            
            # 保存文件
            saved_path = default_storage.save(file_path, ContentFile(image_file.read()))
            
            # 构建完整URL
            image_url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)
            
            return Response({
                'image_url': image_url,
                'image_id': unique_filename.split('.')[0],
                'file_size': image_file.size,
                'file_name': image_file.name
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': '上传失败'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _validate_image_type(self, image_file):
        """验证图片类型"""
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        file_extension = os.path.splitext(image_file.name)[1].lower()
        return file_extension in allowed_extensions

# backend/api/urls.py 需要添加上传路由
from django.urls import path, include
from .views import ImageUploadView

urlpatterns = [
    path('users/', include('users.urls')),
    path('orders/', include('orders.urls')),
    path('community/', include('community.urls')),
    path('admin/', include('admin_panel.urls')),
    path('uploads/images/', ImageUploadView.as_view(), name='image_upload'),  # 新增
]
```

#### 3.4 数据库模型调整
```python
# backend/community/models.py 中的PostImage模型已经存在，可能需要调整
# 当前模型：
class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500, verbose_name='图片地址')
    sort_order = models.IntegerField(default=0, db_index=True, verbose_name='排序顺序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

# 建议增强字段（可选，用于更好的文件管理）：
class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500, verbose_name='图片地址')
    image_file = models.ImageField(upload_to='uploads/images/%Y/%m/%d/', null=True, blank=True, verbose_name='本地文件')  # 新增
    file_size = models.IntegerField(default=0, verbose_name='文件大小')  # 新增
    original_name = models.CharField(max_length=255, blank=True, verbose_name='原始文件名')  # 新增
    sort_order = models.IntegerField(default=0, db_index=True, verbose_name='排序顺序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

# 现有的PostCreateSerializer已经支持images字段，无需修改：
class PostCreateSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, required=False)
    
    class Meta:
        model = Post
        fields = [
            'shop_name', 'shop_location', 'shop_price', 'comment',
            'latitude', 'longitude', 'location_address', 'images'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        post = Post.objects.create(**validated_data)
        
        # 创建图片记录
        for i, image_data in enumerate(images_data[:3]):  # 最多3张图片
            PostImage.objects.create(
                post=post,
                sort_order=i,
                **image_data
            )
        
        return post
```

### 4. 功能流程

#### 4.1 图片上传流程
1. 用户点击"添加图片"按钮
2. 调用 `Taro.chooseImage` 选择图片
3. 预览选中的图片
4. 压缩图片（如果需要）
5. 调用后端上传接口
6. 显示上传进度
7. 上传成功后更新图片列表
8. 发布表单时将图片URL数组传给后端

#### 4.2 表单提交流程
```typescript
// frontend-app/src/utils/api.ts 中的CommunityAPI.createPost方法已存在
// 当前接口定义：
static async createPost(postData: {
  shop_name: string
  shop_location: string
  shop_price: number
  comment: string
  latitude?: number
  longitude?: number
  location_address?: string
  images?: Array<{ image_url: string }>  // 已支持图片数组
}) {
  return request('/community/posts/', {
    method: 'POST',
    data: postData
  })
}

// 需要新增的图片上传API：
export class UploadAPI {
  // 上传单张图片
  static async uploadImage(filePath: string): Promise<{ image_url: string }> {
    return new Promise((resolve, reject) => {
      Taro.uploadFile({
        url: `${API_BASE_URL}/api/uploads/images/`,
        filePath,
        name: 'image',
        header: {
          'X-Openid': getOpenid() || ''
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (res.statusCode === 200) {
              resolve(data)
            } else {
              reject(new Error(data.error || '上传失败'))
            }
          } catch (error) {
            reject(new Error('响应解析失败'))
          }
        },
        fail: reject
      })
    })
  }
}

// 前端组件集成示例：
const handlePublish = async () => {
  // 1. 先上传所有图片
  const uploadedImages = []
  for (const imagePath of selectedImages) {
    try {
      const result = await UploadAPI.uploadImage(imagePath)
      uploadedImages.push({ image_url: result.image_url })
    } catch (error) {
      MessageUtils.showError('图片上传失败')
      return
    }
  }
  
  // 2. 提交表单数据（包含图片URL）
  const postData = {
    ...formData,
    images: uploadedImages
  }
  
  await CommunityAPI.createPost(postData)
}
```

### 5. 用户体验优化

#### 5.1 加载状态
- 上传过程显示进度条
- 上传成功显示✓图标
- 上传失败显示重试按钮

#### 5.2 操作反馈
- 选择图片时显示toast提示
- 删除图片时显示确认弹窗
- 上传失败时显示具体错误信息

#### 5.3 性能优化
- 图片预览使用缩略图
- 上传失败支持断点续传
- 合理的图片压缩策略

### 6. 开发优先级

#### P0 (核心功能)
- ✅ 基础图片选择和预览
- ✅ 图片上传到后端
- ✅ 图片删除功能
- ✅ 与表单的集成

#### P1 (体验优化)
- 📋 上传进度显示
- 📋 图片压缩优化
- 📋 错误处理完善

#### P2 (扩展功能)
- 📋 图片编辑（裁剪、旋转）
- 📋 批量上传优化
- 📋 云存储迁移

### 7. 测试要求

#### 7.1 功能测试
- 图片选择各种场景（相册、拍照、取消）
- 图片数量限制（最多3张）
- 图片格式和大小验证
- 网络异常情况处理

#### 7.2 兼容性测试
- 不同微信版本的兼容性
- 不同设备的图片质量
- iOS和Android的表现一致性

### 9. 现有代码基础分析

#### 9.1 后端现状
- ✅ **数据模型**: `PostImage`模型已存在，支持图片URL存储
- ✅ **序列化器**: `PostImageSerializer`和`PostCreateSerializer`已实现图片数组处理
- ✅ **API接口**: 创建分享的API已支持images字段
- 📋 **需要补充**: 图片上传接口、媒体文件配置、文件存储处理

#### 9.2 前端现状  
- ✅ **页面结构**: 社区页面已有基础表单布局
- ✅ **API调用**: `CommunityAPI.createPost`已支持images参数
- ✅ **表单处理**: 基础的表单验证和提交流程已完善
- 📋 **需要补充**: 图片选择组件、上传进度显示、预览和删除功能

#### 9.3 集成点分析
```typescript
// 当前社区页面的表单结构 (frontend-app/src/pages/community/index.tsx)
const [formData, setFormData] = useState<PostFormData>({
  shop_name: '',
  shop_location: '',
  shop_price: '',
  comment: ''
})

// 需要新增图片状态：
const [selectedImages, setSelectedImages] = useState<string[]>([])  // 本地图片路径
const [uploadedImages, setUploadedImages] = useState<string[]>([])   // 已上传的URL

// 在现有的发布按钮位置插入图片上传组件：
// 位置：推荐理由输入框之后，发布按钮之前
<View className="form-item">
  <Text className="form-label">推荐理由</Text>
  <Textarea {...} />
</View>

{/* 新增图片上传组件区域 */}
<View className="form-item">
  <Text className="form-label">店铺图片 (最多3张)</Text>
  <ImageUploader
    value={selectedImages}
    onChange={setSelectedImages}
    maxCount={3}
  />
</View>

<Button className="publish-btn" onClick={handlePublish}>
  {/* 现有发布按钮 */}
</Button>
```

#### 9.4 技术栈兼容性
- ✅ **Taro版本**: 项目使用Taro 4.x，支持所需的图片选择和上传API
- ✅ **Django版本**: Django 5.2.4，完全支持文件上传和媒体处理
- ✅ **样式规范**: 项目已有完整的SCSS规范和主题色配置
- ✅ **TypeScript**: 完整的类型定义体系，便于扩展图片相关接口

### 10. 实现优先级建议

#### 阶段1: 核心功能实现 (2-3天)
1. 后端图片上传接口开发
2. 前端ImageUploader组件开发
3. 基础的选择、预览、删除功能
4. 与现有表单的集成

#### 阶段2: 体验优化 (1-2天)  
1. 上传进度显示
2. 错误处理完善
3. 图片压缩优化
4. 样式细节调整

#### 阶段3: 扩展功能 (1天)
1. 图片编辑功能
2. 批量操作优化  
3. 云存储预留接口

此需求文档基于现有代码架构设计，确保与项目技术栈和代码规范完全兼容。


