from django.contrib import admin
from .models import User, Room, Category, Booking 

admin.site.register(User) 
admin.site.register(Room) 
admin.site.register(Category)
admin.site.register(Booking)