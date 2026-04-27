from rest_framework import viewsets
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore 
from .serializers import WeeklyLogSerializer, EvaluationSerializer
from .serializers import (
    WeeklyLogSerializer,
    EvaluationSerializer,
    EvaluationCriteriaSerializer,
    CriteriaScoreSerializer
)
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsStudentOrAcademic, IsEvaluator


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    permission_classes = [IsAuthenticated, IsStudentOrAcademic]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'student':
            return WeeklyLog.objects.filter(placement__student=user)


    # 🔹 ACADEMIC SUPERVISOR → only logs of their assigned students
        if user.role == 'academic':
            return WeeklyLog.objects.filter(
                placement__academic_supervisor=user
           )

    #  🚫 Everyone else sees nothing
        return WeeklyLog.objects.none()      
    

        def perform_create(self, serializer):
    # 🔹 Only students can create weekly logs
            if self.request.user.role != 'student':
                raise PermissionDenied("Only students can submit weekly logs")

        serializer.save()

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'student':
            return Evaluation.objects.filter(placement__student=user)

        return Evaluation.objects.filter(supervisor=user)    


class EvaluationCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer
    permission_classes = [IsAuthenticated]


class CriteriaScoreViewSet(viewsets.ModelViewSet):
    queryset = CriteriaScore.objects.all()
    serializer_class = CriteriaScoreSerializer
    permission_classes = [IsAuthenticated, IsEvaluator]

    def get_queryset(self):
        user = self.request.user
        return CriteriaScore.objects.filter(evaluation__supervisor=user)    