from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
from .models import Tenant, CustomUser

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['tenant_id'] = user.tenant.id if user.tenant else None
        token['role'] = user.role

        return token

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'subdomain', 'custom_domain']

class OwnerResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']

class OwnerRegistrationSerializer(serializers.Serializer):
    tenant_name = serializers.CharField(required=True)
    contact_email = serializers.EmailField(required=True)
    subdomain = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    custom_domain = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    owner_username = serializers.CharField(required=True)
    owner_email = serializers.EmailField(required=True)
    owner_password = serializers.CharField(required=True, write_only=True)

    def validate_subdomain(self, value):
        if value and Tenant.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError("Subdomain already exists.")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            tenant = Tenant.objects.create(
                name=validated_data['tenant_name'],
                contact_email=validated_data['contact_email'],
                subdomain=validated_data.get('subdomain'),
                custom_domain=validated_data.get('custom_domain')
            )

            user = CustomUser.objects.create_user(
                username=validated_data['owner_username'],
                email=validated_data['owner_email'],
                password=validated_data['owner_password'],
                role='OWNER',
                tenant=tenant
            )
            return user
