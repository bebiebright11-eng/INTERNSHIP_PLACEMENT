from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import WeeklyLogViewSet, EvaluationViewSet

router = DefaultRouter()
router.register(r'weeklylogs',WeeklyLogViewSet)
router.register(r'evaluations',EvaluationViewSet)


urlpatterns = [
    path('',include(router.urls)),
]