from django.urls import path
from .views import MyTokenObtainPairView, OwnerRegistrationView, CustomerRegisterView

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register-owner/', OwnerRegistrationView.as_view(), name='register_owner'),
    path('register-customer/', CustomerRegisterView.as_view(), name='register_customer'),
]
