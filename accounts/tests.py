from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Tenant
from shop.models import Product, Order

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = "/api/auth/register-owner/"
        self.login_url = "/api/auth/login/"
        
        # Create a pre-existing tenant/user for isolation tests
        self.tenant1 = Tenant.objects.create(name="T1", subdomain="t1", contact_email="t1@test.com")
        self.owner1 = User.objects.create_user(username="owner1", email="o1@test.com", password="pass", tenant=self.tenant1, role="OWNER")
        
    def test_register_owner(self):
        data = {
            "tenant_name": "New Store",
            "subdomain": "newstore",
            "contact_email": "hello@newstore.com",
            "owner_username": "newowner",
            "owner_email": "owner@newstore.com",
            "owner_password": "password123"
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Tenant.objects.filter(subdomain="newstore").exists())
        self.assertTrue(User.objects.filter(username="newowner", role="OWNER").exists())
        
        # Verify tokens returned
        self.assertIn("tokens", res.data)

    def test_login_claims(self):
        data = {"username": "owner1", "password": "pass"}
        res = self.client.post(self.login_url, data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        import jwt
        token = res.data["access"]
        # Decode without verification logic (just checking claims presence)
        payload = jwt.decode(token, options={"verify_signature": False})
        
        self.assertEqual(payload["role"], "OWNER")
        self.assertEqual(payload["tenant_id"], self.tenant1.id)

    def test_tenant_isolation_product(self):
        # Owner 1 creates product
        self.client.force_authenticate(user=self.owner1)
        Product.objects.create(name="P1", price=10, stock=10, tenant=self.tenant1)
        
        res = self.client.get("/api/products/")
        self.assertEqual(len(res.data), 1)

        # Create Owner 2
        tenant2 = Tenant.objects.create(name="T2", subdomain="t2", contact_email="t2@test.com")
        owner2 = User.objects.create_user(username="owner2", email="o2@test.com", password="pass", tenant=tenant2, role="OWNER")
        
        self.client.force_authenticate(user=owner2)
        res = self.client.get("/api/products/")
        self.assertEqual(len(res.data), 0) # Should be empty for owner 2

    def test_staff_create_permission(self):
        # Owner 1 creates staff
        self.client.force_authenticate(user=self.owner1)
        data = {"username": "staff1", "email": "s1@test.com", "password": "password123"}
        res = self.client.post("/api/auth/create-staff/", data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="staff1", role="STAFF", tenant=self.tenant1).exists())
        
        # Non-owner fails
        customer = User.objects.create_user(username="cust", email="c@test.com", password="pass", tenant=self.tenant1, role="CUSTOMER")
        self.client.force_authenticate(user=customer)
        res = self.client.post("/api/auth/create-staff/", data)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
