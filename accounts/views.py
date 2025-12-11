from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsOwner
from .serializers import MyTokenObtainPairSerializer, OwnerRegistrationSerializer, TenantSerializer, OwnerResponseSerializer, CustomerRegisterSerializer, StaffCreateSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = MyTokenObtainPairSerializer

class OwnerRegistrationView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = OwnerRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "tenant": TenantSerializer(user.tenant).data,
            "owner": OwnerResponseSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class CustomerRegisterView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = CustomerRegisterSerializer  # Explicitly set

    def post(self, request):
        serializer = CustomerRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"customer": serializer.data}, status=status.HTTP_201_CREATED)

class CreateStaffView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = StaffCreateSerializer

    def post(self, request):
        serializer = StaffCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        staff = serializer.save()
        return Response({"staff": serializer.data}, status=status.HTTP_201_CREATED)
