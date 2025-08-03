from django.urls import path, include

urlpatterns = [
    path('users/', include('users.urls')),
    path('orders/', include('orders.urls')),
    path('community/', include('community.urls')),
    path('admin/', include('admin_panel.urls')),
]
