from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (RoomViewSet, CategoryViewSet, UserViewSet, BookingViewSet, LoginView, LogoutView)

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'users', UserViewSet)
router.register(r'bookings', BookingViewSet)
    
urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]