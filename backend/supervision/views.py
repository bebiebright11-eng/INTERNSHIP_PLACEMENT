from rest_framework import viewsets
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore 
from .serializers import WeeklyLogSerializer, EvaluationSerializer
from .serializers import (
    WeeklyLogSerializer,
    EvaluationSerializer,
    EvaluationCriteriaSerializer,
    CriteriaScoreSerializer
)

class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
