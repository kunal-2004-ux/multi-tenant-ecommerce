from rest_framework.test import APIClient
from rest_framework import status
import pytest
from accounts.models import Tenant, CustomUser
from shop.models import Product, Order

@pytest.mark.django_db
def test_product_isolation():
    # Setup 2 tenants
    t1 = Tenant.objects.create(name="T1", contact_email="t1@t.com")
    t2 = Tenant.objects.create(name="T2", contact_email="t2@t.com")
    
    u1 = CustomUser.objects.create_user(username="u1", password="pw", email="u1@t.com", tenant=t1, role="OWNER")
    u2 = CustomUser.objects.create_user(username="u2", password="pw", email="u2@t.com", tenant=t2, role="OWNER")
    
    # T1 Product
    p1 = Product.objects.create(tenant=t1, name="P1", price=10, stock=10)
    
    client = APIClient()
    
    # U1 should see P1
    client.force_authenticate(user=u1)
    response = client.get('/api/products/')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['name'] == "P1"
    
    # U2 should NOT see P1
    client.force_authenticate(user=u2)
    response = client.get('/api/products/')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 0

@pytest.mark.django_db
def test_order_creation_stock_deduction():
    t1 = Tenant.objects.create(name="T1", contact_email="t1@t.com")
    u1 = CustomUser.objects.create_user(username="u1", password="pw", email="u1@t.com", tenant=t1, role="CUSTOMER")
    p1 = Product.objects.create(tenant=t1, name="P1", price=100, stock=10)
    
    client = APIClient()
    client.force_authenticate(user=u1)
    
    # Place Order
    data = {
        "items": [
           { "product_id": p1.id, "quantity": 2 }
        ]
    }
    response = client.post('/api/orders/', data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['total_amount'] == "200.00"
    
    # Check Stock
    p1.refresh_from_db()
    assert p1.stock == 8
    
    # Check Order
    assert Order.objects.count() == 1
    order = Order.objects.first()
    assert order.tenant == t1
    assert order.customer == u1
