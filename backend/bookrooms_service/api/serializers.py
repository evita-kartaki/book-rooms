from rest_framework import serializers
from .models import Room,Category,User,Booking 

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
        fields = ['Booking_id', 'User_id', 'Room_id', 'Start_time', 'End_time']
        
    def get_booking(self,obj):
        user = self.context ['request'].user
        if user.is_authenticated:
            return Booking.objects.filter(User_id=user) 
        return Booking.objects.none()    