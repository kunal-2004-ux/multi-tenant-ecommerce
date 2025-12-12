from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"orders", OrderViewSet, basename="order")

urlpatterns = [
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
] + router.urls
