from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RoomViewSet,
    CategoryViewSet,
    UserViewSet,
    BookingViewSet,
    LoginView,
    LogoutView,
    CheckInAPIView,
    RegisterView,
    GoogleAuthView,
)

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'users', UserViewSet)
router.register(r'bookings', BookingViewSet)
    
urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('check-in/', CheckInAPIView.as_view(), name='check-in'),
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/google/', GoogleAuthView.as_view(), name='auth-google'),
]