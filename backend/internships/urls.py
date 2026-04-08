from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet, ApplicationViewSet, PlacementViewSet

router = DefaultRouter()
router.register(r'organizations',OrganizationViewSet)
router.register(r'applications',ApplicationViewSet)
router.register(r'placements',PlacementViewSet)

urlpatterns =[
    path('',include(router.urls)),
]
