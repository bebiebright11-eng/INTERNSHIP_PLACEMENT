from rest_framework import serializers
from .models import Organization, Application, Placement


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    #  ADD: student name
    student_name = serializers.CharField(source='student.username', read_only=True)
    class Meta:
        model = Application
        fields = '__all__'
                #Added for apply reasons
        read_only_fields = ['student']

class PlacementSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    #  ADD: student name
    student_name = serializers.CharField(source='student.username', read_only=True)

    workplace_supervisor_name = serializers.SerializerMethodField()
    academic_supervisor_name = serializers.SerializerMethodField()

    is_fully_assigned = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()

    class Meta:
        model = Placement
        fields = '__all__'

    def get_workplace_supervisor_name(self, obj):
        if not obj.workplace_supervisor:
            return None

        full_name = (
            f"{obj.workplace_supervisor.first_name} "
            f"{obj.workplace_supervisor.last_name}"
        ).strip()

        return full_name or obj.workplace_supervisor.username

    def get_academic_supervisor_name(self, obj):
        if not obj.academic_supervisor:
            return None

        full_name = (
            f"{obj.academic_supervisor.first_name} "
            f"{obj.academic_supervisor.last_name}"
        ).strip()


        return full_name or obj.academic_supervisor.username
    