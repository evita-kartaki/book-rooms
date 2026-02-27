# api/views.py

from datetime import datetime
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .permissions import HasRolePermission
from .models import Room, Category, User, Booking
from .serializers import RoomSerializer, CategorySerializer, UserSerializer, BookingSerializer


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