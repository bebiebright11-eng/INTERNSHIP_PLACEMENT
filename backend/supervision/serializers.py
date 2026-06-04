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

    student_registration_number = serializers.CharField(
    source='placement.student.username',
    read_only=True
    )

    student_name = serializers.SerializerMethodField()

    #  ADD: organization name
    organization_name = serializers.CharField(source='placement.organization.name', read_only=True)

    supervisor_name = serializers.CharField(source='supervisor.username', read_only=True)
    supervisor_type_display = serializers.CharField(
    source='get_supervisor_type_display',
    read_only=True
    )
    
    # This grabs the "Readable Name" from your choices (e.g., 'Workplace Supervisor')
    supervisor_type = serializers.CharField()
    #  ADD THIS LINE
    supervisor = serializers.HiddenField(default=serializers.CurrentUserDefault())
    criteria_scores = CriteriaScoreSerializer(many=True)

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
            'student_registration_number',
            'student_name',
            'organization_name',
            'supervisor_name'
        ]

    def get_student_name(self, obj):

        student = obj.placement.student

        full_name = f"{student.first_name} {student.last_name}".strip()

    # fallback to username if no names exist
        return full_name if full_name else student.username

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

    #  Workplace Supervisor → Criteria scoring (60)
        if evaluation.supervisor_type == 'workplace':
           for item in criteria_data:
                score_obj = CriteriaScore(
                   evaluation=evaluation,
                   criteria=item['criteria'],
                   score=item['score']
                )

                score_obj.full_clean()  # 🔥 VALIDATION
                score_obj.save()


                total += item['score']

           evaluation.score = total  # out of 60

    #  Academic Supervisor → Manual score (20)
        elif evaluation.supervisor_type == 'academic':
            evaluation.score = validated_data.get('score', 0)

        #  ADD LOG SCORE
            log_score = self.get_log_score(evaluation.placement)

        #  GET workplace score
            workplace_eval = Evaluation.objects.filter(
                placement=evaluation.placement,
                supervisor_type='workplace'
            ).first()
            if not workplace_eval:
                raise serializers.ValidationError("Workplace evaluation must be completed first")
            
            workplace_score = workplace_eval.score

        #  FINAL CALCULATION
            final = workplace_score + log_score + evaluation.score

            evaluation.final_grade = final
            evaluation.is_final = True

        evaluation.save()
        return evaluation
