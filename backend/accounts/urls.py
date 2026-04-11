from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users',UserViewSet)

urlpatterns = [
    path('', include(router.urls)), 
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
