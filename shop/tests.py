from rest_framework.test import APIClient
from rest_framework import status
import pytest
from accounts.models import Tenant, CustomUser
from shop.models import Product, Order

@pytest.mark.django_db
def test_customer_access_control():
    t1 = Tenant.objects.create(name="T1", contact_email="t1@t.com")
    owner = CustomUser.objects.create_user(username="owner", password="pw", email="o@t.com", tenant=t1, role="OWNER")
    customer = CustomUser.objects.create_user(username="customer", password="pw", email="c@t.com", tenant=t1, role="CUSTOMER")
    
    p1 = Product.objects.create(tenant=t1, name="P1", price=10, stock=10)
    
    client = APIClient()
    
    # OWNER can update
    client.force_authenticate(user=owner)
    response = client.patch(f'/api/products/{p1.id}/', {"price": 20}, format='json')
    assert response.status_code == status.HTTP_200_OK
    
    # CUSTOMER CANNOT update
    client.force_authenticate(user=customer)
    response = client.patch(f'/api/products/{p1.id}/', {"price": 30}, format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    
    # CUSTOMER can list products
    response = client.get('/api/products/')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1

@pytest.mark.django_db
def test_staff_assignment_visibility():
    t1 = Tenant.objects.create(name="T1", contact_email="t1@t.com")
    staff = CustomUser.objects.create_user(username="staff", password="pw", email="s@t.com", tenant=t1, role="STAFF")
    
    # Product assigned to Staff
    p_assigned = Product.objects.create(tenant=t1, name="Assigned", price=10, stock=10, assigned_to=staff)
    # Product NOT assigned
    p_unassigned = Product.objects.create(tenant=t1, name="Unassigned", price=10, stock=10)
    
    client = APIClient()
    client.force_authenticate(user=staff)
    
    # Should only see assigned product
    response = client.get('/api/products/')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['name'] == "Assigned"
