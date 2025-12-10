from django.contrib import admin
from .models import Product, Order, OrderItem

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'price', 'stock', 'is_active')
    list_filter = ('tenant',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'customer', 'status', 'total_amount', 'created_at')
    list_filter = ('tenant', 'status')
    inlines = [OrderItemInline]
