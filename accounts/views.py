from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import MyTokenObtainPairSerializer, OwnerRegistrationSerializer, TenantSerializer, OwnerResponseSerializer

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
