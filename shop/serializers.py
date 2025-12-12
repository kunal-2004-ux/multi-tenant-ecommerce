from rest_framework import serializers
from django.db import transaction
from .models import Product, Order, OrderItem
from accounts.models import CustomUser

class ProductSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(role='STAFF'), 
        required=False, 
        allow_null=True
    )
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'is_active', 'assigned_to', 'assigned_to_username', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'assigned_to_username']

class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'unit_price', 'line_total']
        read_only_fields = ['id', 'unit_price', 'line_total']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(role='STAFF'),
        required=False, 
        allow_null=True
    )
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total_amount', 'created_at', 'updated_at', 'items', 'customer_username', 'assigned_to', 'assigned_to_username']
        read_only_fields = ['id', 'status', 'total_amount', 'created_at', 'updated_at', 'customer_username', 'assigned_to_username']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        tenant = user.tenant

        with transaction.atomic():
            order = Order.objects.create(
                tenant=tenant,
                customer=user,
                status='PENDING'
            )

            total_amount = 0

            for item_data in items_data:
                product_instance = item_data['product']
                quantity = item_data['quantity']
                
                # Re-fetch with lock to prevent race conditions
                product = Product.objects.select_for_update().get(id=product_instance.id)

                # Validate Tenant
                if product.tenant_id != tenant.id:
                    raise serializers.ValidationError(f"Product {product.name} does not belong to this tenant")

                # Validate Stock
                if product.stock < quantity:
                    raise serializers.ValidationError(f"Insufficient stock for {product.name}")

                unit_price = product.price
                line_total = unit_price * quantity
                
                # Check line total calculation sanity (though model save handles it, good to have consistent)
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    unit_price=unit_price,
                    line_total=line_total
                )
                
                # Deduct Stock
                product.stock -= quantity
                product.save()

                total_amount += line_total

            order.total_amount = total_amount
            order.save()
            return order
