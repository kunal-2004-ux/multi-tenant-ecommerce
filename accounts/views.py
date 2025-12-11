from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterOwnerSerializer, 
    CustomerRegisterSerializer, 
    StaffCreateSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import IsOwner

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterOwnerView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterOwnerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        owner = result["owner"]
        
        # Generate tokens immediately for auto-login
        refresh = RefreshToken.for_user(owner)
        access = refresh.access_token
        
        # Add claims explicitly
        access["role"] = owner.role
        access["tenant_id"] = owner.tenant.id if owner.tenant else None

        return Response({
            "tenant": {
                "id": result["tenant"].id, 
                "name": result["tenant"].name, 
                "subdomain": result["tenant"].subdomain
            },
            "owner": {
                "id": owner.id, 
                "username": owner.username, 
                "email": owner.email, 
                "role": owner.role
            },
            "tokens": {
                "access": str(access),
                "refresh": str(refresh)
            }
        }, status=status.HTTP_201_CREATED)

class CustomerRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CustomerRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Auto-login behavior
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": {
                "id": user.id, 
                "username": user.username, 
                "email": user.email, 
                "role": user.role,
                "tenant": user.tenant.subdomain
            },
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        }, status=status.HTTP_201_CREATED)

class CreateStaffView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request):
        serializer = StaffCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        staff = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
