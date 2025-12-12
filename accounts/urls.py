from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterOwnerView, 
    CustomerRegisterView, 
    CreateStaffView,
    StaffListView,
    StaffStatsView,
    TenantListView,
    EmailOrUsernameTokenObtainPairView
)

urlpatterns = [
    path("register-owner/", RegisterOwnerView.as_view(), name="register-owner"),
    path("register-customer/", CustomerRegisterView.as_view(), name="register-customer"),
    path("create-staff/", CreateStaffView.as_view(), name="create-staff"),
    path("staff/", StaffListView.as_view(), name="staff-list"),
    path("staff/<int:staff_id>/", StaffListView.as_view(), name="staff-detail"),
    path("staff-stats/", StaffStatsView.as_view(), name="staff-stats"),
    path("tenants/", TenantListView.as_view(), name="tenant-list"),
    path("login/", EmailOrUsernameTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
