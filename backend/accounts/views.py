from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer



from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes

User = get_user_model()

@api_view(['POST'])
@authentication_classes([]) 
@permission_classes([AllowAny])
def activate_account(request):
    username = request.data.get("username")
    password = request.data.get("password")

    # 1. Check user exists
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # 2. Check if already activated
    if user.is_activated:
        return Response({"error": "Account already activated"}, status=400)

    # 3. Set password
    user.set_password(password)
    user.is_activated = True
    user.save()

    return Response({"message": "Account activated successfully"})
