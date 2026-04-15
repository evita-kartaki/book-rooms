from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from datetime import timezone
from django.utils import timezone
import jwt

# Create your models here.



class  Category(models.Model):
    Category_id = models.AutoField(primary_key=True)
    Description = models.CharField(max_length=100)

    def __str__(self):
        return self.Description

class Room(models.Model):
    Room_id = models.AutoField(primary_key=True)
    Short_name = models.CharField(max_length=50)
    Description = models.CharField(max_length=100)
    Capacity = models.IntegerField()
    Floor = models.IntegerField()
    Category_id = models.ForeignKey( Category, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.Short_name  
    
class User(AbstractUser):

        ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('client', 'Client')
    )

        role = models.CharField(
            max_length=50,
            choices=ROLE_CHOICES,
            default='client'
        )

        phone = models.CharField(
            max_length=20,
            blank=True,
            null=True
        )

        is_admin = models.BooleanField(default=False)
        
        def generate_jwt(self):
            payload = {
                'id': self.id,
                'email': self.email,
                'role': self.role,
                'exp': timezone.now() + timedelta(days=1),
                'iat': timezone.now()
            }
            return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        def __str__(self):
            return f"{self.username} ({self.role})"
        
class Booking(models.Model):

    STATUS_CHOICES = (
        ('UPCOMING', 'Upcoming'),
        ('CHECKED_IN', 'Checked In'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    )

    Booking_id = models.AutoField(primary_key=True)
    User_id = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    Room_id = models.ForeignKey(Room, on_delete=models.CASCADE)
    Start_time = models.DateTimeField()
    End_time = models.DateTimeField()
    Status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='UPCOMING'
    )

    Guest_first_name = models.CharField(max_length=100, blank=True, null=True)
    Guest_last_name = models.CharField(max_length=100, blank=True, null=True)
    Guest_email = models.EmailField(blank=True, null=True)
    Guest_phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Booking {self.Booking_id} for {self.Room_id}"
    
class CheckIn(models.Model):
    CheckIn_id = models.AutoField(primary_key=True)
    Booking_id = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="checkins"
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.phone}"