from rest_framework import viewsets
from rest_framework.decorators import action
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore 
from .serializers import WeeklyLogSerializer, EvaluationSerializer
from .serializers import (
    WeeklyLogSerializer,
    EvaluationSerializer,
    EvaluationCriteriaSerializer,
    CriteriaScoreSerializer
)
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsStudentOrAcademic, IsEvaluator


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    permission_classes = [IsAuthenticated, IsStudentOrAcademic]

    def get_queryset(self):
        user = self.request.user

    # Student
        if user.role == "student":
            return WeeklyLog.objects.filter(
                placement__student=user
           )

    # Workplace Supervisor
        if user.role == "workplace":
            return WeeklyLog.objects.filter(
                placement__workplace_supervisor=user
            )

    # Academic Supervisor
        if user.role == "academic":
            return WeeklyLog.objects.filter(
                placement__academic_supervisor=user
            )

        return WeeklyLog.objects.none()
    

    def perform_create(self, serializer):
    # 🔹 Only students can create weekly logs
        if self.request.user.role != 'student':
            raise PermissionDenied("Only students can submit weekly logs")

        serializer.save()

    def perform_update(self, serializer):

        log = self.get_object()

        if self.request.user.role == "student":

            if log.placement.student != self.request.user:
                raise PermissionDenied(
                   "You cannot edit another student's log."
                )

            if log.status == "approved":
                raise PermissionDenied(
                   "Approved logs cannot be edited."
                )

            if log.status == "rejected":
                serializer.save(status="pending")
                return

        serializer.save()
    
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):

        log = self.get_object()

        if request.user.role != "workplace":
            raise PermissionDenied(
               "Only workplace supervisors can approve logs."
            )
        
        if log.placement.workplace_supervisor != request.user:
           raise PermissionDenied(
               "You are not assigned to this student."
        )

        log.status = "approved"
        log.save()

        return Response({
            "message": "Weekly log approved."
        })
        

    
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):

        log = self.get_object()

        if request.user.role != "workplace":
            raise PermissionDenied(
                "Only workplace supervisors can reject logs."
            )
        
        if log.placement.workplace_supervisor != request.user:
           raise PermissionDenied(
               "You are not assigned to this student."
        )

        feedback = request.data.get(
            "supervisor_feedback",
            ""
        )

        log.status = "rejected"
        log.supervisor_feedback = feedback

        log.save()

        return Response({
            "message": "Weekly log rejected."
        })

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

    # 👨‍🎓 Student → only their evaluation (read-only)
        if user.role == 'student':
            return Evaluation.objects.filter(
               placement__student=user
           )

    #  Workplace → only evaluations they created
        if user.role == 'workplace':
            return Evaluation.objects.filter(
               supervisor=user
            )

    #  Academic → evaluations for their students
        if user.role == 'academic':
            return Evaluation.objects.filter(
               placement__academic_supervisor=user
           )

    # ✅ Admin → only final evaluations
        if user.role == 'admin':
            return Evaluation.objects.filter(
                is_final=True,
                supervisor_type='academic'
            )
        

    def perform_create(self, serializer):
        user = self.request.user

        if user.role in ['student', 'admin']:
            raise PermissionDenied("You cannot create evaluations")

        placement = serializer.validated_data['placement']
        supervisor_type = serializer.validated_data['supervisor_type']


        if supervisor_type == "academic":

            workplace_evaluation_exists = Evaluation.objects.filter(
                placement=placement,
                supervisor_type="workplace"
            ).exists()

            if not workplace_evaluation_exists:
                raise PermissionDenied(
                    "Workplace supervisor must submit an evaluation first."
                )

        existing = Evaluation.objects.filter(
           placement=placement,
           supervisor=user,
           supervisor_type=supervisor_type
        ).first()

        if existing:
            serializer.instance = existing

        serializer.save(supervisor=user)
    




    def create(self, request, *args, **kwargs):
        user = request.user

    # ❌ Students cannot create
        if user.role == "student":
            return Response(
                {"error": "Students cannot submit evaluations"},
                status=status.HTTP_403_FORBIDDEN
        )

    # ❌ Admin cannot create
        if user.role == "admin":
            return Response(
                {"error": "Admin cannot submit evaluations"},
                status=status.HTTP_403_FORBIDDEN
            )

    # ✅ Allow BOTH workplace & academic
        if user.role not in ["workplace", "academic"]:
            return Response(
                {"error": "Unauthorized role"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().create(request, *args, **kwargs)

    def perform_update(self, serializer):
        user = self.request.user
 

    # Workplace → can ONLY edit criteria scores
        if user.role == 'workplace':

            placement = serializer.instance.placement

            academic_evaluation = Evaluation.objects.filter(
                placement=placement,
                supervisor_type='academic',
                is_final=True
            ).exists()

            if academic_evaluation:
                raise PermissionDenied(
                    "You cannot edit this evaluation because the Academic Supervisor has already submitted the final evaluation."
                )

        # Prevent setting final grade
            serializer.save(
                final_grade=None,
                is_final=False
           )
            return

    #  Academic → can finalize evaluation
        if user.role == 'academic':
            serializer.save()
            return

    # Others blocked
        raise PermissionDenied("You cannot update this evaluation")


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