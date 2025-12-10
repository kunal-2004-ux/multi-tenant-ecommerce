from django.urls import path
from .views import MyTokenObtainPairView, OwnerRegistrationView

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register-owner/', OwnerRegistrationView.as_view(), name='register_owner'),
]
