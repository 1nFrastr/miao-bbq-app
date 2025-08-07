from django.urls import path, include
from .upload_views import ImageUploadView

urlpatterns = [
    path('users/', include('users.urls')),
    path('orders/', include('orders.urls')),
    path('community/', include('community.urls')),
    path('admin/', include('admin_panel.urls')),
    path('uploads/images/', ImageUploadView.as_view(), name='image_upload'),
]
