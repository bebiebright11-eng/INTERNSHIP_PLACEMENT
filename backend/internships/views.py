
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Organization, Application, Placement
from .serializers import (
    OrganizationSerializer,
    ApplicationSerializer,
    PlacementSerializer
)

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]  

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin sees all applications
        if user.role == "admin":
            return Application.objects.all()

        # Students only see their own applications
        if user.role == "student":
            return Application.objects.filter(student=user)

        return Application.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    #Added such that when the application is approved, a placement is automatically created for the student.
    def perform_update(self, serializer):
        instance = serializer.save()

        #  Reject all other applications of this student
        Application.objects.filter(
            student=instance.student
        ).exclude(id=instance.id).update(status='rejected')


class PlacementViewSet(viewsets.ModelViewSet):
    queryset = Placement.objects.all()
    serializer_class = PlacementSerializer
