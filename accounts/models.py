from django.db import models
from django.contrib.auth.models import AbstractUser

class Tenant(models.Model):
    name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    subdomain = models.CharField(max_length=255, unique=True, blank=True, null=True)
    custom_domain = models.CharField(max_length=255, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ("OWNER", "Owner"),
        ("STAFF", "Staff"),
        ("CUSTOMER", "Customer"),
    )

    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True
    )
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="CUSTOMER")

    class Meta:
        unique_together = ('email', 'tenant')
