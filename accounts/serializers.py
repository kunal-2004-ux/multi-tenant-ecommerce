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

    def validate(self, attrs):
        data = super().validate(attrs)
        
        data['username'] = self.user.username
        data['role'] = self.user.role
        data['tenant_id'] = self.user.tenant.id if self.user.tenant else None
        
        return data

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

class CustomerRegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    tenant_slug = serializers.CharField()

    def validate_tenant_slug(self, value):
        try:
            return Tenant.objects.get(subdomain=value)
        except Tenant.DoesNotExist:
            raise serializers.ValidationError("Invalid tenant identifier")

    def create(self, validated_data):
        tenant = validated_data.pop("tenant_slug")
        user = CustomUser.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            tenant=tenant,
            role="CUSTOMER"
        )
        user.set_password(validated_data["password"])
        user.save()
        return user

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "username": instance.username,
            "email": instance.email,
            "tenant": instance.tenant.subdomain
        }

class StaffCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        request = self.context.get("request")
        owner = request.user
        # create staff user under owner's tenant
        staff = CustomUser.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            tenant=owner.tenant,
            role="STAFF",
        )
        staff.set_password(validated_data["password"])
        staff.save()
        return staff

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "username": instance.username,
            "email": instance.email,
            "tenant": instance.tenant.subdomain if instance.tenant else None,
            "role": instance.role,
        }
