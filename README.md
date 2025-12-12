# Multi-Tenant E-Commerce Platform

A SaaS-style multi-tenant e-commerce backend built with **Django REST Framework**. Each store (tenant) operates independently with complete data isolation, role-based access control, and JWT authentication.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Django 4.x, Django REST Framework |
| **Authentication** | SimpleJWT (JSON Web Tokens) |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Frontend** | React 18, Axios |

---

## Quick Setup

### Backend
```bash
cd multi-tenant-shop
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver    # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

---

## API Endpoints

### Authentication (`/api/auth/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register-owner/` | Create store + owner account | Public |
| POST | `/register-customer/` | Register customer to a store | Public |
| POST | `/login/` | JWT login (email or username) | Public |
| POST | `/token/refresh/` | Refresh access token | Public |
| GET | `/tenants/` | List all stores | Public |
| POST | `/create-staff/` | Invite staff member | Owner |
| GET/DELETE | `/staff/` | Manage staff | Owner |
| GET | `/staff-stats/` | Staff dashboard data | Staff |

### Shop (`/api/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET/POST | `/products/` | List/Create products | Auth |
| GET/PUT/PATCH/DELETE | `/products/<id>/` | Product CRUD | Owner/Staff |
| GET/POST | `/orders/` | List/Create orders | Auth |
| GET/PATCH | `/orders/<id>/` | Order details/Update | Auth |
| GET | `/dashboard/stats/` | Owner statistics | Owner |

---

## Architecture

### Multi-Tenancy Implementation

**Approach**: Shared database with tenant isolation via foreign keys.

```python
# accounts/models.py
class Tenant(models.Model):
    name = models.CharField(max_length=255)
    subdomain = models.CharField(max_length=63, unique=True)
    contact_email = models.EmailField()

class CustomUser(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    role = models.CharField(choices=[('OWNER','Owner'), ('STAFF','Staff'), ('CUSTOMER','Customer')])
```

**Data Isolation**: All models reference tenant, queries filtered automatically:

```python
# shop/views.py
class ProductViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Product.objects.filter(tenant=self.request.user.tenant)
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)
```

**Scoped Email Uniqueness**: Same email can exist across tenants:
```python
class Meta:
    unique_together = ('email', 'tenant')
```

---

### Role-Based Access Control

**Custom Permission Classes** (`accounts/permissions.py`):

```python
class ProductPermission(permissions.BasePermission):
    """Owner: full access, Staff: assigned items only, Customer: read-only"""
    
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ['OWNER', 'STAFF']
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'OWNER':
            return True
        if request.user.role == 'STAFF':
            return obj.assigned_to == request.user
        return False

class OrderPermission(permissions.BasePermission):
    """Customers can create orders, Owner/Staff can manage"""
    
    def has_permission(self, request, view):
        if request.method == 'POST':
            return request.user.role == 'CUSTOMER'
        return True
```

**ViewSet Permission Mapping**:
```python
class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, OrderPermission]
```

---

### Authentication Flow

**JWT with Email/Username Support**:

```python
# accounts/views.py
class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        identifier = request.data.get('username')
        
        if '@' in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
            if user:
                request.data['username'] = user.username
        
        return super().post(request, *args, **kwargs)
```

**Response includes user data**:
```python
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'role': self.user.role,
            'tenant': self.user.tenant.name
        }
        return data
```

---

### Key Backend Features

| Feature | Implementation |
|---------|---------------|
| **Tenant Isolation** | ForeignKey filtering in all ViewSets |
| **Staff Assignment** | `assigned_to` FK on Product/Order models |
| **Order Workflow** | Status: PENDING → PAID → SHIPPED |
| **Nested Serializers** | OrderItemSerializer within OrderSerializer |
| **Atomic Transactions** | `transaction.atomic()` for order creation |
| **Stock Validation** | Check availability before order creation |

---

## Database Schema

```
Tenant
├── CustomUser (role: OWNER/STAFF/CUSTOMER)
├── Product (assigned_to: Staff)
└── Order (customer, assigned_to: Staff)
    └── OrderItem (product, quantity, unit_price)
```

**Key Relationships**:
- Tenant → Users (1:N)
- Tenant → Products (1:N)
- Tenant → Orders (1:N)
- User (Staff) → Products (1:N via assigned_to)
- User (Staff) → Orders (1:N via assigned_to)
- Order → OrderItems (1:N)

---

## Project Structure

```
multi-tenant-shop/
├── accounts/                 # Authentication & Users
│   ├── models.py            # Tenant, CustomUser
│   ├── views.py             # Auth views, Staff CRUD
│   ├── serializers.py       # Registration, JWT serializers
│   ├── permissions.py       # RBAC permission classes
│   └── urls.py
├── shop/                     # E-commerce Core
│   ├── models.py            # Product, Order, OrderItem
│   ├── views.py             # ViewSets with tenant filtering
│   ├── serializers.py       # Nested order serializers
│   └── urls.py
├── multitenant_shop/        # Project Config
│   ├── settings.py          # JWT, CORS, REST config
│   └── urls.py
└── frontend/                # React SPA
```

---
 