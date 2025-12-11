from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterOwnerView, 
    CustomerRegisterView, 
    CreateStaffView, 
    CustomTokenObtainPairView
)

urlpatterns = [
    path("register-owner/", RegisterOwnerView.as_view(), name="register-owner"),
    path("register-customer/", CustomerRegisterView.as_view(), name="register-customer"),
    path("create-staff/", CreateStaffView.as_view(), name="create-staff"),
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
