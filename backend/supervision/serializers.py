from rest_framework import serializers
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore


class WeeklyLogSerializer(serializers.ModelSerializer):
    # show student_name
    student_name = serializers.CharField(source='placement.student.username', read_only=True)

    # show organization name
    organization_name = serializers.CharField(source='placement.organization.name', read_only=True)
    class Meta:
        model = WeeklyLog
        fields = '__all__'


class EvaluationCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCriteria
        fields = '__all__'



class CriteriaScoreSerializer(serializers.ModelSerializer):
    criteria_name = serializers.CharField(source='criteria.name', read_only=True)
    class Meta:
        model = CriteriaScore
        fields = ['id', 'criteria_name', 'score']


class EvaluationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='placement.student.username', read_only=True)

    #  ADD: organization name
    organization_name = serializers.CharField(source='placement.organization.name', read_only=True)

    supervisor_name = serializers.CharField(source='supervisor.username', read_only=True)
    
    # This grabs the "Readable Name" from your choices (e.g., 'Workplace Supervisor')
    supervisor_type = serializers.CharField(source='get_supervisor_type_display', read_only=True)
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
        logs = WeeklyLog.objects.filter(
            placement=placement,
            status='reviewed'
        ).count()

        score = logs * 2.5

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
