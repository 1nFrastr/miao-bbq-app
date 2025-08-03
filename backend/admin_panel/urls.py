from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'admin-users', views.AdminUserViewSet)
router.register(r'admin-logs', views.AdminLogViewSet)
router.register(r'moderation', views.ContentModerationViewSet, basename='moderation')

urlpatterns = [
    path('', include(router.urls)),
]
