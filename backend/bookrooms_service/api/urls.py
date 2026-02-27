from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (RoomViewSet, CategoryViewSet, UserViewSet, BookingViewSet)

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'users', UserViewSet)
router.register(r'bookings', BookingViewSet)
    
urlpatterns = [
    path('', include(router.urls))
]