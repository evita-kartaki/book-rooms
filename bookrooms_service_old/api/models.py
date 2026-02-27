from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from datetime import timezone, timedelta
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
            default='Client'
        )

        phone = models.CharField(
            max_length=20,
            blank=True,
            null=True
        )
        
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
    Booking_id = models.AutoField(primary_key=True)
    User_id = models.ForeignKey(User, on_delete=models.CASCADE)
    Room_id = models.ForeignKey(Room, on_delete=models.CASCADE)
    Start_time = models.DateTimeField()
    End_time = models.DateTimeField()

    def __str__(self):
        return f"Booking {self.Booking_id} by {self.User_id} for {self.Room_id}"      

    
    