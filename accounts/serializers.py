from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from accounts.models import Tenant  # Adjusted import from 'core' to 'accounts' based on project structure

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = getattr(user, 'role', None)
        token['tenant_id'] = getattr(getattr(user, 'tenant', None), 'id', None)
        token['tenant_name'] = getattr(getattr(user, 'tenant', None), 'name', None)
        return token

class RegisterOwnerSerializer(serializers.Serializer):
    tenant_name = serializers.CharField(max_length=150)
    subdomain = serializers.SlugField(max_length=64)
    contact_email = serializers.EmailField()
    owner_username = serializers.CharField(max_length=150)
    owner_email = serializers.EmailField()
    owner_password = serializers.CharField(write_only=True, min_length=8)

    def validate_subdomain(self, value):
        slug = value.lower()
        if Tenant.objects.filter(subdomain__iexact=slug).exists():
            raise serializers.ValidationError("Tenant subdomain already taken")
        return slug

    def create(self, validated_data):
        with transaction.atomic():
            tenant = Tenant.objects.create(
                name=validated_data['tenant_name'],
                contact_email=validated_data['contact_email'],
                subdomain=validated_data['subdomain']
            )
            owner = User.objects.create_user(
                username=validated_data['owner_username'],
                email=validated_data['owner_email'],
                password=validated_data['owner_password'],
                tenant=tenant,
                role='OWNER',
                is_active=True
            )
        return {'tenant': tenant, 'owner': owner}

class CustomerRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    tenant_slug = serializers.SlugField(max_length=64)

    def validate_tenant_slug(self, value):
        slug = value.lower()
        try:
            tenant = Tenant.objects.get(subdomain__iexact=slug)
        except Tenant.DoesNotExist:
            raise serializers.ValidationError("Tenant not found")
        self._tenant = tenant
        return slug

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            tenant=self._tenant,
            role='CUSTOMER',
            is_active=True
        )
        return user

class StaffCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    make_active = serializers.BooleanField(default=False)

    def create(self, validated_data):
        request = self.context.get('request')
        owner = request.user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            tenant=owner.tenant,
            role='STAFF',
            is_active=validated_data.get('make_active', True)
        )
        return user
