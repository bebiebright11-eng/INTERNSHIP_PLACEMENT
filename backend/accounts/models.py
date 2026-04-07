from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('workplace', 'Workplace Supervisor'),
        ('academic', 'Academic Supervisor'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(max_length=40, blank=True , null=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"
