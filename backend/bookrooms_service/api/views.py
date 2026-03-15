# api/views.py

from datetime import datetime
from django.utils import timezone
from django.contrib.auth import authenticate
from rest_framework import viewsets,status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import HasRolePermission
from .models import Room, Category, User, Booking
from .serializers import RoomSerializer, CategorySerializer, UserSerializer, BookingSerializer
from .serializers import MyTokenObtainPairSerializer

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    # για SearchFilter (το έχετε ενεργό στο settings.py)
    search_fields = ["Short_name", "Description", "Category_id__Category_id"]

    @action(detail=False, methods=["GET"], url_path="available")
    def available(self, request):
        """
        GET /api/rooms/available/?date=YYYY-MM-DD&from=HH:MM&to=HH:MM

        Επιστρέφει μόνο τις αίθουσες που ΔΕΝ έχουν booking που τέμνεται
        με το [start_dt, end_dt).
        """
        date_str = request.query_params.get("date")
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")

        if not date_str or not from_str or not to_str:
            raise ValidationError("Πρέπει να δώσεις date, from, to (π.χ. date=2026-02-24&from=11:00&to=12:00)")

        # Parse datetime από date+time
        try:
            start_naive = datetime.strptime(f"{date_str} {from_str}", "%Y-%m-%d %H:%M")
            end_naive = datetime.strptime(f"{date_str} {to_str}", "%Y-%m-%d %H:%M")
        except ValueError:
            raise ValidationError("Λάθος format. Θέλω date=YYYY-MM-DD και from/to=HH:MM")

        if end_naive <= start_naive:
            raise ValidationError("Το 'to' πρέπει να είναι μετά από το 'from'.")

        # Κάνε τα timezone-aware (επειδή USE_TZ=True)
        start_dt = timezone.make_aware(start_naive, timezone.get_current_timezone())
        end_dt = timezone.make_aware(end_naive, timezone.get_current_timezone())

        # Room είναι μη διαθέσιμο αν υπάρχει booking που τέμνεται:
        # Start_time < end_dt AND End_time > start_dt
        busy_room_ids = Booking.objects.filter(
            Start_time__lt=end_dt,
            End_time__gt=start_dt
        ).values_list("Room_id_id", flat=True)

        available_rooms = Room.objects.exclude(Room_id__in=busy_room_ids)

        serializer = RoomSerializer(available_rooms, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ["admin"]


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ["admin", "client"]
    serializer_status = BookingSerializer


    @action(detail=False, methods=["GET"], url_path="calendar")
    def calendar(self, request):
        """
        GET /api/bookings/calendar/?room_id=1&start_date=2026-03-01&end_date=2026-03-31
        Επιστρέφει τις κρατήσεις μιας αίθουσας μέσα σε ένα εύρος ημερομηνιών.
        """
        room_id = request.query_params.get("room_id")
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        if not room_id or not start_date_str or not end_date_str:
            raise ValidationError("Πρέπει να δώσεις room_id, start_date, end_date (π.χ. start_date=2026-03-01)")

        try:
   
            start_naive = datetime.strptime(start_date_str, "%Y-%m-%d")
            
            end_naive = datetime.strptime(end_date_str, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
        except ValueError:
            raise ValidationError("Λάθος format. Το start_date και end_date πρέπει να είναι YYYY-MM-DD")

    
    
        start_dt = timezone.make_aware(start_naive, timezone.get_current_timezone())
        end_dt = timezone.make_aware(end_naive, timezone.get_current_timezone())


        bookings = Booking.objects.filter(
            Room_id=room_id,
            Start_time__lt=end_dt,
            End_time__gt=start_dt
        )

        # Φτιάχνουμε τα δεδομένα που θα σταλούν στο Frontend
        data = []
        for b in bookings:
            data.append({
                "room_in_db": b.Room_id_id,
                "start_time": b.Start_time,
                "end_time": b.End_time,
                "status": b.Status
            })

        return Response(data)
    
    #--UPDATE STATUS ---
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('Status')

        # Έλεγχος αν το status που στάλθηκε είναι έγκυρο
        valid_statuses = [choice[0] for choice in Booking.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Choose from: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.Status = new_status
        booking.save()
        return Response({'message': f'Status updated to {new_status}'})
    
# Πρόσθεσε αυτό το import στην κορυφή
from .serializers import MyTokenObtainPairSerializer

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            # Χρήση του custom serializer για να μπει το role μέσα στο token
            serializer = MyTokenObtainPairSerializer()
            refresh = serializer.get_token(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role
                }
            }, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    POST /api/logout/
    Στο JWT το logout γίνεται κυρίως στο Frontend σβήνοντας το token.
    """
    def post(self, request):
        return Response({'message': 'Αποσυνδεθήκατε με επιτυχία'}, status=status.HTTP_200_OK)