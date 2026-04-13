from rest_framework import viewsets
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore 
from .serializers import WeeklyLogSerializer, EvaluationSerializer
from .serializers import (
    WeeklyLogSerializer,
    EvaluationSerializer,
    EvaluationCriteriaSerializer,
    CriteriaScoreSerializer
)

from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsStudentOrSupervisor, IsEvaluator


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'student':
            return WeeklyLog.objects.filter(placement__student=user)

        return WeeklyLog.objects.all()

    


