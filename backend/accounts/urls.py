from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MyTokenObtainPairView,activate_account
from rest_framework_simplejwt.views import TokenRefreshView
from .views import PasswordResetRequestView
from .views import PasswordResetConfirmView


router = DefaultRouter()
router.register(r'users',UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('activate/', activate_account), 
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path(
    'password-reset/',
    PasswordResetRequestView.as_view(),
    name='password-reset'
),
    path(
    'reset-password-confirm/<uidb64>/<token>/',
    PasswordResetConfirmView.as_view()
),
]   
