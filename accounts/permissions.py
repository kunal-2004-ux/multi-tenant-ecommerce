from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwner(BasePermission):
    """
    Allocates permissions only to users with role 'OWNER'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "OWNER")

class ProductPermission(BasePermission):
    """
    SAFE Methods: OWNER, STAFF, CUSTOMER allowed.
    Write Methods:
        - OWNER: Allowed.
        - STAFF: Allowed ONLY if assigned_to == user.
        - CUSTOMER: Never allowed.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.role == "CUSTOMER":
            return request.method in SAFE_METHODS
            
        # Owner and Staff can proceed to object check or create
        # For creation (POST), we block Staff unless assigned_to check is possible (which isn't)
        # So we restrict Unsafe methods to Owner generally, but allow Staff to pass toObjectPermission check
        # Update: We will allow STAFF if it's SAFE or if they are passing to object check
        if request.user.role == "STAFF":
             # We can't check assignment on POST easily here without custom logic. 
             # Assuming STAFF cannot CREATE new products globally.
             if request.method == "POST":
                 return False
             return True
             
        # Owner allowed all
        return request.user.role == "OWNER"

    def has_object_permission(self, request, view, obj):
        # SAFE methods are already covered by has_permission or viewset filtering, but explicit check:
        if request.method in SAFE_METHODS:
             return True # Tenant filtering handles visibility

        if request.user.role == "OWNER":
            return True
            
        if request.user.role == "STAFF":
            return obj.assigned_to == request.user
            
        return False

class OrderPermission(BasePermission):
    """
    SAFE:
        - OWNER: All
        - STAFF: assigned only
        - CUSTOMER: own orders
    POST: All roles allowed.
    PUT/PATCH:
        - OWNER: All
        - STAFF: assigned only
        - CUSTOMER: denied
    DELETE: OWNER only.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
             return False
             
        if request.method == 'DELETE':
             return request.user.role == "OWNER"
             
        # All roles can View and Create (Post)
        return True

    def has_object_permission(self, request, view, obj):
        # SAFE Methods (Reading)
        if request.method in SAFE_METHODS:
            if request.user.role == "OWNER":
                return True
            if request.user.role == "STAFF":
                return obj.assigned_to == request.user
            if request.user.role == "CUSTOMER":
                return obj.customer == request.user
                
        # WRITE Methods
        if request.user.role == "OWNER":
            return True
            
        if request.user.role == "STAFF":
            return obj.assigned_to == request.user
            
        return False
