from django.shortcuts import render
from rest_framework import viewsets
from .permissions import HasRolePermission
from .serializers import RoomSerializer

from .models import (
    Room,
    Category,
    User,
    Booking
)

from .serializers import RoomSerializer, CategorySerializer, UserSerializer, BookingSerializer

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    search_fields = ['Short_name','Description','Category_id__Category_id']

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin']   

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'client']

