from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'organization',
            'email',
            'role',
            'first_name',
            'last_name',
            'full_name',
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
        

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add the role inside the encrypted token
        token['role'] = user.role
        return token
    def validate(self, attrs):
        data = super().validate(attrs)
         #  Block login if not activated
        if not self.user.is_activated:
           raise serializers.ValidationError("Account not activated. Please activate first.")


        # Add the role to the visible JSON response for Postman/React
        data['role'] = self.user.role
             # 🔥 ADD THIS LINE
        data['user_id'] = self.user.id

        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        
        return data


from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class PasswordResetRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField()

    def validate(self, attrs):
        identifier = attrs.get("identifier")

        user = User.objects.filter(
            username=identifier
        ).first()

        if not user:
            user = User.objects.filter(
                email=identifier
            ).first()

        if not user:
            raise serializers.ValidationError(
                "No account found"
            )

        if not user.email:
            raise serializers.ValidationError(
                "This account has no email attached"
            )

        attrs["user"] = user

        return attrs