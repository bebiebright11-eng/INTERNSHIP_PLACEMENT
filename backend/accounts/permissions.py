from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'student'
    

class IsWorkplaceSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'workplace'


class IsAcademicSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'academic'