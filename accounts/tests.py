from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
import pytest
from .models import Tenant, CustomUser

@pytest.mark.django_db
def test_owner_registration():
    client = APIClient()
    url = reverse('register_owner')
    data = {
        "tenant_name": "Test Shop",
        "contact_email": "contact@testshop.com",
        "subdomain": "testshop",
        "owner_username": "owner1",
        "owner_email": "owner@testshop.com",
        "owner_password": "strongpassword123"
    }
    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert 'tenant' in response.data
    assert 'owner' in response.data
    assert response.data['tenant']['name'] == "Test Shop"
    assert response.data['owner']['role'] == "OWNER"
    
    # Verify DB
    assert Tenant.objects.count() == 1
    assert CustomUser.objects.count() == 1
    user = CustomUser.objects.first()
    assert user.tenant.name == "Test Shop"

@pytest.mark.django_db
def test_login_returns_tenant_info():
    # Setup
    tenant = Tenant.objects.create(name="Login Shop", contact_email="login@shop.com")
    user = CustomUser.objects.create_user(
        username="login_owner",
        email="login@shop.com",
        password="password123",
        role="OWNER",
        tenant=tenant
    )
    
    client = APIClient()
    url = reverse('token_obtain_pair')
    data = {
        "username": "login_owner",
        "password": "password123"
    }
    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    
    # Decode token would go here, but for now we trust the serializer test implicitly via result. 
    # To be thorough we could decode.
    import jwt
    # We can't easily verify the secret key signature without settings, but we can peek payload if we skip verification or use decode provided by simplejwt
    from rest_framework_simplejwt.tokens import AccessToken
    token = AccessToken(response.data['access'])
    assert token['role'] == "OWNER"
    assert token['tenant_id'] == tenant.id
