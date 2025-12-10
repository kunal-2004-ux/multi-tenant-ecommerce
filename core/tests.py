from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
import pytest

@pytest.mark.django_db
def test_health_check_api():
    client = APIClient()
    url = '/api/health/' # Hardcoding url to verify routing too, or use reverse('health_check')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"status": "ok", "message": "Multi-tenant shop backend up"}
