from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import uuid
import os
from datetime import datetime


class ImageUploadView(APIView):
    """图片上传接口"""
    permission_classes = [AllowAny]  # 暂时允许任何人上传，后续可以根据需要调整
    
    def post(self, request):
        if 'image' not in request.FILES:
            return Response({'error': '请选择图片文件'}, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        
        # 验证文件类型
        if not self._validate_image_type(image_file):
            return Response({'error': '仅支持jpg、png、webp格式'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 验证文件大小
        max_size = getattr(settings, 'MAX_IMAGE_SIZE', 2 * 1024 * 1024)
        if image_file.size > max_size:
            return Response({'error': '图片大小不能超过2MB'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 生成唯一文件名
            file_extension = os.path.splitext(image_file.name)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}{file_extension}"
            
            # 按日期创建目录
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
            return Response({'error': f'上传失败: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _validate_image_type(self, image_file):
        """验证图片类型"""
        allowed_extensions = getattr(settings, 'ALLOWED_IMAGE_EXTENSIONS', ['.jpg', '.jpeg', '.png', '.webp'])
        file_extension = os.path.splitext(image_file.name)[1].lower()
        return file_extension in allowed_extensions
