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
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # Create a mutable copy of the data
        data = request.data.copy()
        
        identifier = data.get('username') or data.get('email') or data.get('identifier')
        
        if identifier:
             if '@' in identifier:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                # Find the user by email
                u = User.objects.filter(email__iexact=identifier).first()
                if u:
                    data['username'] = u.username
             else:
                 data['username'] = identifier

        # Manually instantiate the serializer with the modified data
        # This bypasses any request.data immutability issues in DRF
        serializer = self.get_serializer(data=data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            raise e

        # Return the success response (tokens)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

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
        access["username"] = owner.username
        access["role"] = owner.role
        access["tenant_id"] = owner.tenant.id if owner.tenant else None
        access["tenant_name"] = owner.tenant.name if owner.tenant else None

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
        access = refresh.access_token
        access['username'] = user.username
        access['role'] = user.role
        access['tenant_id'] = user.tenant.id if user.tenant else None
        access['tenant_name'] = user.tenant.name if user.tenant else None
        
        return Response({
            "user": {
                "id": user.id, 
                "username": user.username, 
                "email": user.email, 
                "role": user.role,
                "tenant": user.tenant.subdomain if user.tenant else None
            },
            "tokens": {
                "access": str(access),
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


class StaffListView(APIView):
    """List and manage staff members for the owner's tenant."""
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get(self, request):
        """Get all staff members for the owner's tenant."""
        tenant = request.user.tenant
        if not tenant:
            return Response({"error": "No tenant associated with user"}, status=400)
        
        staff_members = User.objects.filter(tenant=tenant, role='STAFF')
        staff_data = [{
            "id": s.id,
            "username": s.username,
            "email": s.email,
            "is_active": s.is_active
        } for s in staff_members]
        
        return Response(staff_data)

    def delete(self, request, staff_id):
        """Deactivate or permanently delete a staff member."""
        tenant = request.user.tenant
        if not tenant:
            return Response({"error": "No tenant associated with user"}, status=400)
        
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        try:
            staff = User.objects.get(id=staff_id, tenant=tenant, role='STAFF')
            if permanent:
                staff.delete()
                return Response({"message": "Staff member removed"}, status=status.HTTP_200_OK)
            else:
                staff.is_active = False
                staff.save()
                return Response({"message": "Staff member deactivated"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Staff member not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, staff_id):
        """Activate a staff member."""
        tenant = request.user.tenant
        if not tenant:
            return Response({"error": "No tenant associated with user"}, status=400)
        
        try:
            staff = User.objects.get(id=staff_id, tenant=tenant, role='STAFF')
            staff.is_active = request.data.get('is_active', True)
            staff.save()
            return Response({"message": "Staff member activated"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Staff member not found"}, status=status.HTTP_404_NOT_FOUND)


class StaffStatsView(APIView):
    """Returns stats for staff dashboard."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from shop.models import Product, Order
        
        user = request.user
        if user.role != 'STAFF':
            return Response({"error": "Only staff can access this endpoint"}, status=403)
        
        tenant = user.tenant
        if not tenant:
            return Response({"error": "No tenant associated with user"}, status=400)

        return Response({
            "assigned_products": total_products,
            "orders_to_process": pending_orders
        })


class TenantListView(APIView):
    """Public endpoint to list all available stores (tenants)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from accounts.models import Tenant
        # Return only what's necessary: id, name, slug (subdomain)
        # Assuming 'subdomain' is the unique slug
        tenants = Tenant.objects.all().values('id', 'name', 'subdomain')
        return Response(list(tenants))
