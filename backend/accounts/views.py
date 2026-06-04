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
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")


    if not username or not password or not first_name or not last_name:
        return Response({"error": "All fields are required"}, status=400)
    
    # 1. Check user exists
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # 2. Check if already activated
    if user.is_activated:
        return Response({"error": "Account already activated"}, status=400)

    # Set password and names
    user.set_password(password)
    user.first_name = first_name
    user.last_name = last_name
    user.is_activated = True
    user.save()

    return Response({"message": "Account activated successfully"})




from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import PasswordResetRequestSerializer


class PasswordResetRequestView(APIView):

    def post(self, request):

        serializer = PasswordResetRequestSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        uid = urlsafe_base64_encode(force_bytes(user.pk))

        token = default_token_generator.make_token(user)

        reset_url = f"http://localhost:5173/reset-password/{uid}/{token}/"

        send_mail(
            subject="Password Reset",
            message=f"Click this link to reset your password:\n{reset_url}",
            from_email=None,
            recipient_list=[user.email],
        )

        return Response({
            "message": "Password reset link sent to email"
        }, status=status.HTTP_200_OK)
    

from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model

User = get_user_model()


class PasswordResetConfirmView(APIView):

    def post(self, request, uidb64, token):

        print(request.data)
        
        password = request.data.get("password")

        try:

            uid = urlsafe_base64_decode(uidb64).decode()

            user = User.objects.get(pk=uid)

        except:

            return Response(
                {"error": "Invalid user"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):

            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(password)

        user.save()

        return Response({
            "message": "Password reset successful"
        })