from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "OWNER")

class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "STAFF")

class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "CUSTOMER")

class ProductPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Owners and Staff can manage products
        # Note: Granular object-level permission (assigned_to check) happens in has_object_permission or view logic
        return request.user and request.user.role in ["OWNER", "STAFF"]
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Owners can edit anything in their tenant (handled by view queryset)
        if request.user.role == "OWNER":
            return True
        
        # Staff can only edit if assigned to them
        if request.user.role == "STAFF":
            return obj.assigned_to == request.user

        return False

class OrderPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == "POST":
            # Customers create orders
            return request.user and request.user.role == "CUSTOMER"
        # Owners and Staff can manage orders (updates)
        return request.user and request.user.role in ["OWNER", "STAFF"]
