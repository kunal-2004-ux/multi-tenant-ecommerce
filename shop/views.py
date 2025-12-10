from rest_framework import viewsets, permissions
from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer
from accounts.permissions import ProductPermission, OrderPermission

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, ProductPermission]

    def get_queryset(self):
        user = self.request.user
        if not user.tenant:
            return Product.objects.none()
        
        qs = Product.objects.filter(tenant=user.tenant)

        # RBAC Filtering
        if user.role == "STAFF":
            return qs.filter(assigned_to=user)

        # OWNER and CUSTOMER see all products (permission class handles write access)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(tenant=user.tenant)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, OrderPermission]

    def get_queryset(self):
        user = self.request.user
        if not user.tenant:
            return Order.objects.none()
            
        qs = Order.objects.filter(tenant=user.tenant)
        
        # RBAC Filtering
        if user.role == "OWNER":
            return qs.order_by("-created_at")

        if user.role == "STAFF":
            return qs.filter(assigned_to=user).order_by("-created_at")
            
        if user.role == "CUSTOMER":
            return qs.filter(customer=user).order_by("-created_at")
            
        return Order.objects.none() # Fallback

    def perform_create(self, serializer):
        # Serializer handles tenant and customer assignment via context
        serializer.save()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
