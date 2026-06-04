from rest_framework import serializers
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore
from django.utils import timezone
from datetime import timedelta


class WeeklyLogSerializer(serializers.ModelSerializer):
    # show student_name
    student_name = serializers.CharField(source='placement.student.username', read_only=True)

    # show organization name
    organization_name = serializers.CharField(source='placement.organization.name', read_only=True)
    status = serializers.SerializerMethodField()


    class Meta:
        model = WeeklyLog
        fields = '__all__'
    
    def get_status(self, obj):

        placement_logs = WeeklyLog.objects.filter(
            placement=obj.placement
        ).order_by("submitted_at")

        reviewed_ids = placement_logs[:8].values_list("id", flat=True)

        if obj.id in reviewed_ids:
            return "reviewed"

        return "pending"
     
    def validate(self, data):

        placement = data.get("placement")

        today = timezone.now().date()

    # Prevent submission before placement starts
        if placement.start_date and today < placement.start_date:
            raise serializers.ValidationError(
                f"You cannot submit logs before {placement.start_date}"
            )

    # Prevent submission after placement ends
        if placement.end_date and today > placement.end_date:
            raise serializers.ValidationError(
                "This placement has already ended"
            )

    # Monday of current week
        start_of_week = today - timedelta(days=today.weekday())

    # Sunday of current week
        end_of_week = start_of_week + timedelta(days=6)

    # Prevent more than one submission in same week
        existing_log = WeeklyLog.objects.filter(
            placement=placement,
            submitted_at__date__gte=start_of_week,
            submitted_at__date__lte=end_of_week
        ).exists()

        if existing_log:
            raise serializers.ValidationError(
                "You have already submitted a weekly log for this week."
            )

        return data



class EvaluationCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCriteria
        fields = '__all__'



class CriteriaScoreSerializer(serializers.ModelSerializer):
    criteria_name = serializers.CharField(source='criteria.name', read_only=True)
    criteria = serializers.PrimaryKeyRelatedField(
        queryset=EvaluationCriteria.objects.all()
    )
    class Meta:
        model = CriteriaScore
        fields = ['id', 'criteria','criteria_name', 'score']


    def validate(self, attrs):

        criteria = attrs.get("criteria")
        score = attrs.get("score")

        if score < 0:
            raise serializers.ValidationError(
                f"{criteria.name} cannot be less than 0."
            )

        if score > criteria.max_score:
            raise serializers.ValidationError(
                f"{criteria.name} cannot exceed {criteria.max_score} marks."
            )

        return attrs
    
    

class EvaluationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='placement.student.username', read_only=True)

    #  ADD: organization name
    organization_name = serializers.CharField(source='placement.organization.name', read_only=True)

    supervisor_name = serializers.CharField(source='supervisor.username', read_only=True)
    
    # This grabs the "Readable Name" from your choices (e.g., 'Workplace Supervisor')
    supervisor_type = serializers.CharField()
    #  ADD THIS LINE
    supervisor = serializers.HiddenField(default=serializers.CurrentUserDefault())
     
    supervisor_type_display = serializers.CharField(
    source='get_supervisor_type_display',
    read_only=True
)
    criteria_scores = CriteriaScoreSerializer(
    many=True,
    required=False
)
    class Meta:
        model = Evaluation
        fields = [
            'id',
            'placement',
            'supervisor',
            'supervisor_type',
            'supervisor_type_display',
            'score',
            'comments',
            'final_grade',
            'is_final',
            'criteria_scores',

            'student_name',
            'organization_name',
            'supervisor_name'
        ]

    def get_log_score(self, placement):

        reviewed_logs = WeeklyLog.objects.filter(
            placement=placement
        ).order_by("submitted_at", "id")[:8]

        count = reviewed_logs.count()

        score = count * 2.5

        return min(score, 20)  # cap at 20
    



    def create(self, validated_data):

        criteria_data = validated_data.pop('criteria_scores', [])

        evaluation = Evaluation.objects.create(**validated_data)

        total = 0

    # 🔹 Workplace evaluation
        if evaluation.supervisor_type == 'workplace':

            for item in criteria_data:

                CriteriaScore.objects.create(
                    evaluation=evaluation,
                    criteria=item['criteria'],
                    score=item['score']
                )

                total += item['score']

            evaluation.score = total

    #  Academic Supervisor → Manual score (20)
        elif evaluation.supervisor_type == 'academic':

            academic_score = validated_data.get('score', 0)

            evaluation.score = academic_score

            log_score = self.get_log_score(evaluation.placement)

            workplace_eval = Evaluation.objects.filter(
                placement=evaluation.placement,
                supervisor_type='workplace'
            ).first()

            if not workplace_eval:
                raise serializers.ValidationError(
                   "Workplace evaluation must be completed first"
                )

            final = (
                workplace_eval.score +
                log_score +
                academic_score
            )

            evaluation.final_grade = final
            evaluation.is_final = True

        evaluation.save()
        return evaluation
    

    def update(self, instance, validated_data):

        criteria_data = validated_data.pop('criteria_scores', [])

        instance.comments = validated_data.get(
            'comments',
            instance.comments
        )

    # 🔹 Workplace evaluation update
        if instance.supervisor_type == 'workplace':

            instance.criteria_scores.all().delete()

            total = 0

            for item in criteria_data:

                CriteriaScore.objects.create(
                    evaluation=instance,
                    criteria=item['criteria'],
                    score=item['score']
                )

                total += item['score']

            instance.score = total

    # 🔹 Academic evaluation update
        elif instance.supervisor_type == 'academic':

            academic_score = validated_data.get(
                'score',
                instance.score
            )

            instance.score = academic_score

            log_score = self.get_log_score(instance.placement)

            
            
            workplace_eval = Evaluation.objects.filter(
                placement=instance.placement,
                supervisor_type='workplace'
            ).first()

            if workplace_eval:

                final = (
                   workplace_eval.score +
                   log_score +
                   academic_score
                )

                instance.final_grade = final
                instance.is_final = True

        instance.save()

        return instance

    