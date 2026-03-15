from rest_framework import serializers
from .models import Room,Category,User,Booking 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['Room_id', 'Short_name', 'Description', 'Capacity', 'Floor', 'Category_id']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['Category_id', 'Description']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone']

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['Booking_id', 'User_id', 'Room_id', 'Start_time', 'End_time','Status']
        
    def get_booking(self,obj):
        user = self.context ['request'].user
        if user.is_authenticated:
            return Booking.objects.filter(User_id=user) 
        return Booking.objects.none()    
    
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Πρόσθεσε τα custom πεδία που θέλεις στο token
        token['role'] = user.role
        token['username'] = user.username
        # Μπορείς να προσθέσεις ό,τι άλλο θέλεις, π.χ. token['is_admin'] = user.is_admin

        return token