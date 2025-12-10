from django.contrib import admin
from .models import Product, Order, OrderItem

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'assigned_to', 'price', 'stock', 'is_active')
    list_filter = ('tenant', 'assigned_to')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'customer', 'assigned_to', 'status', 'total_amount', 'created_at')
    list_filter = ('tenant', 'status', 'assigned_to')
    inlines = [OrderItemInline]
