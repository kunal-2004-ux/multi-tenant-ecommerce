from rest_framework import viewsets, permissions
from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.tenant:
            return Product.objects.none()
        return Product.objects.filter(tenant=user.tenant)

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(tenant=user.tenant)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.tenant:
            return Order.objects.none()
            
        qs = Order.objects.filter(tenant=user.tenant)
        
        # Customer Role Isolation
        if user.role == "CUSTOMER":
            qs = qs.filter(customer=user)
            
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        # Serializer handles tenant and customer assignment via context
        serializer.save()
