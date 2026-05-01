from datetime import datetime, timedelta

from django.contrib.auth import authenticate
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import Room, Category, User, Booking, CheckIn
from .serializers import (
    RoomSerializer,
    CategorySerializer,
    UserSerializer,
    BookingSerializer,
    MyTokenObtainPairSerializer,
    RegisterSerializer,
)
from .permissions import HasRolePermission

def normalize_phone(phone):
    if not phone:
        return ""

    digits = "".join(ch for ch in str(phone) if ch.isdigit())

    if digits.startswith("30") and len(digits) > 10:
        digits = digits[2:]

    return digits

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    allowed_roles = ["admin"]
    search_fields = ["Short_name", "Description", "Category_id__Category_id"]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "available"]:
            return [AllowAny()]
        return [HasRolePermission()]

    def get_queryset(self):
        if self.action in ["list", "retrieve", "available"]:
            return Room.objects.filter(is_active=True).order_by("Room_id")
        return Room.objects.all().order_by("Room_id")

    def _get_affected_future_bookings(self, room):
        now = timezone.now()
        return Booking.objects.filter(
            Room_id=room,
            Start_time__gte=now,
        ).exclude(Status="CANCELLED").select_related("User_id", "Room_id")

    def _send_room_change_email(self, booking, subject, message):
        recipient = None

        if booking.User_id and booking.User_id.email:
            recipient = booking.User_id.email
        elif booking.Guest_email:
            recipient = booking.Guest_email

        if not recipient:
            return

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )

    def _cancel_bookings_and_notify(self, room, bookings, reason_text):
        affected_count = 0

        for booking in bookings:
            booking.Status = "CANCELLED"
            booking.save(update_fields=["Status"])
            affected_count += 1

            start_local = timezone.localtime(booking.Start_time)
            end_local = timezone.localtime(booking.End_time)

            subject = f"Ακύρωση κράτησης για την αίθουσα {room.Short_name}"
            message = (
                f"Η κράτησή σας ακυρώθηκε λόγω αλλαγής στη διαθεσιμότητα της αίθουσας.\n\n"
                f"Αίθουσα: {room.Short_name}\n"
                f"Περιγραφή: {room.Description}\n"
                f"Ημερομηνία: {start_local.strftime('%d/%m/%Y')}\n"
                f"Ώρα: {start_local.strftime('%H:%M')} - {end_local.strftime('%H:%M')}\n"
                f"Λόγος: {reason_text}\n\n"
                f"Παρακαλούμε συνδεθείτε στο σύστημα για να επιλέξετε άλλη αίθουσα."
            )

            self._send_room_change_email(booking, subject, message)

        return affected_count

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        room = self.get_object()
        old_is_active = room.is_active

        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(room, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated_room = serializer.save()

        affected_count = 0

        # Αν από ενεργή γίνει μη διαθέσιμη, ακύρωσε μελλοντικές κρατήσεις
        if old_is_active and not updated_room.is_active:
            affected_bookings = self._get_affected_future_bookings(updated_room)
            affected_count = self._cancel_bookings_and_notify(
                updated_room,
                affected_bookings,
                "Η αίθουσα δεν είναι πλέον διαθέσιμη.",
            )

        response_data = self.get_serializer(updated_room).data
        response_data["affected_bookings"] = affected_count

        return Response(response_data, status=status.HTTP_200_OK)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        room = self.get_object()

        affected_bookings = self._get_affected_future_bookings(room)
        affected_count = self._cancel_bookings_and_notify(
            room,
            affected_bookings,
            "Η αίθουσα αφαιρέθηκε από τη διαθεσιμότητα του συστήματος.",
        )

        # Soft delete αντί για πραγματικό delete
        room.is_active = False
        room.save(update_fields=["is_active"])

        return Response(
            {
                "message": "Η αίθουσα απενεργοποιήθηκε επιτυχώς.",
                "affected_bookings": affected_count,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["GET"], url_path="available")
    def available(self, request):
        """
        GET /api/rooms/available/?date=YYYY-MM-DD&from=HH:MM&to=HH:MM
        """
        date_str = request.query_params.get("date")
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")

        if not date_str or not from_str or not to_str:
            raise ValidationError(
                "Πρέπει να δώσεις date, from, to "
                "(π.χ. date=2026-02-24&from=11:00&to=12:00)"
            )

        try:
            start_naive = datetime.strptime(
                f"{date_str} {from_str}", "%Y-%m-%d %H:%M"
            )
            end_naive = datetime.strptime(
                f"{date_str} {to_str}", "%Y-%m-%d %H:%M"
            )
        except ValueError:
            raise ValidationError(
                "Λάθος format. Θέλω date=YYYY-MM-DD και from/to=HH:MM"
            )

        if end_naive <= start_naive:
            raise ValidationError("Το 'to' πρέπει να είναι μετά από το 'from'.")

        current_tz = timezone.get_current_timezone()
        start_dt = timezone.make_aware(start_naive, current_tz)
        end_dt = timezone.make_aware(end_naive, current_tz)

        busy_room_ids = Booking.objects.filter(
            Start_time__lt=end_dt,
            End_time__gt=start_dt,
        ).exclude(
            Status="CANCELLED"
        ).values_list("Room_id_id", flat=True).distinct()

        available_rooms = Room.objects.filter(
            is_active=True
        ).exclude(
            Room_id__in=busy_room_ids
        ).order_by("Room_id")

        serializer = RoomSerializer(available_rooms, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ["admin"]

    @action(detail=True, methods=["patch"], url_path="set-password")
    def set_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get("password")

        if not new_password or not str(new_password).strip():
            return Response(
                {"error": "Ο νέος κωδικός είναι υποχρεωτικός."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_password = str(new_password).strip()

        if len(new_password) < 4:
            return Response(
                {"error": "Ο κωδικός πρέπει να έχει τουλάχιστον 4 χαρακτήρες."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Ο κωδικός άλλαξε επιτυχώς."},
            status=status.HTTP_200_OK,
        )


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.action in ["create", "calendar"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Booking.objects.none()

        if user.is_superuser or getattr(user, "role", None) == "admin":
            return Booking.objects.all().select_related(
                "User_id", "Room_id"
            ).order_by("-Start_time")

        return Booking.objects.filter(User_id=user).select_related(
            "User_id", "Room_id"
        ).order_by("-Start_time")

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        guest_email = (data.get("Guest_email") or "").strip().lower()
        guest_phone_raw = (data.get("Guest_phone") or "").strip()
        guest_phone = normalize_phone(guest_phone_raw)

        matched_user = None

        if request.user.is_authenticated:
            matched_user = request.user
        else:
            users = User.objects.all()

            if guest_email and guest_phone:
                for user in users:
                    user_email = (user.email or "").strip().lower()
                    user_phone = normalize_phone(user.phone)

                    if user_email == guest_email and user_phone == guest_phone:
                        matched_user = user
                        break

            if not matched_user and guest_email:
                for user in users:
                    user_email = (user.email or "").strip().lower()
                    if user_email == guest_email:
                        matched_user = user
                        break

            if not matched_user and guest_phone:
                for user in users:
                    user_phone = normalize_phone(user.phone)
                    if user_phone == guest_phone:
                        matched_user = user
                        break

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        booking = serializer.save(User_id=matched_user)

        return Response(
            self.get_serializer(booking).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["PATCH"], url_path="update_status")
    def update_status(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        new_status = request.data.get("Status")

        all_statuses = ["UPCOMING", "CHECKED_IN", "COMPLETED", "CANCELLED"]

        if new_status not in all_statuses:
            return Response(
                {"error": "Μη έγκυρη κατάσταση."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_admin = user.is_superuser or getattr(user, "role", None) == "admin"

        if is_admin:
            previous_status = booking.Status

            booking.Status = new_status
            booking.save()

            email_sent = False
            email_error = None

            if new_status == "CANCELLED" and previous_status != "CANCELLED":
                try:
                    send_booking_cancelled_email(booking, cancelled_by_admin=True)
                    email_sent = True
                except Exception as e:
                    print("BOOKING CANCEL EMAIL ERROR:", str(e))
                    email_error = str(e)

            return Response(
                {
                    "message": "Το status ενημερώθηκε επιτυχώς.",
                    "Booking_id": booking.Booking_id,
                    "Status": booking.Status,
                    "email_sent": email_sent,
                    "email_error": email_error,
                },
                status=status.HTTP_200_OK,
            )

        if booking.User_id != user:
            return Response(
                {"error": "Δεν έχεις δικαίωμα να αλλάξεις αυτή την κράτηση."},
                status=status.HTTP_403_FORBIDDEN,
            )

        allowed_user_statuses = ["CHECKED_IN", "CANCELLED"]

        if new_status not in allowed_user_statuses:
            return Response(
                {
                    "error": "Μπορείς να αλλάξεις την κράτησή σου μόνο σε CHECKED_IN ή CANCELLED."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking.Status == "CANCELLED":
            return Response(
                {"error": "Η κράτηση είναι ήδη ακυρωμένη."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.Status == "COMPLETED":
            return Response(
                {"error": "Η κράτηση έχει ήδη ολοκληρωθεί και δεν μπορεί να αλλάξει."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.Status == "CHECKED_IN" and new_status == "CHECKED_IN":
            return Response(
                {"error": "Έχει ήδη γίνει check-in σε αυτή την κράτηση."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.Status == "CHECKED_IN" and new_status == "CANCELLED":
            return Response(
                {"error": "Δεν μπορείς να ακυρώσεις κράτηση μετά το check-in."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.localtime()
        start_time = timezone.localtime(booking.Start_time) if booking.Start_time else None
        end_time = timezone.localtime(booking.End_time) if booking.End_time else None

        if new_status == "CHECKED_IN":
            if not start_time or not end_time:
                return Response(
                    {"error": "Η κράτηση δεν έχει έγκυρη ώρα έναρξης/λήξης."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if now.date() != start_time.date():
                return Response(
                    {"error": "Το check-in επιτρέπεται μόνο την ημέρα της κράτησης."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            allowed_start = start_time - timedelta(minutes=15)

            if now < allowed_start:
                return Response(
                    {
                        "error": "Το check-in επιτρέπεται έως 15 λεπτά πριν από την έναρξη."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if now > end_time:
                return Response(
                    {"error": "Η ώρα της κράτησης έχει λήξει."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if new_status == "CANCELLED":
            if start_time and now > start_time:
                return Response(
                    {"error": "Δεν μπορείς να ακυρώσεις κράτηση που έχει ήδη ξεκινήσει."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        booking.Status = new_status
        booking.save()

        return Response(
            {
                "message": "Το status ενημερώθηκε επιτυχώς.",
                "Booking_id": booking.Booking_id,
                "Status": booking.Status,
            },
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is not None:
            serializer = MyTokenObtainPairSerializer()
            refresh = serializer.get_token(user)

            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "role": user.role,
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"error": "Invalid Credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "Η εγγραφή ολοκληρώθηκε επιτυχώς.",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                        "phone": user.phone,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        return Response(
            {"message": "Αποσυνδεθήκατε με επιτυχία"},
            status=status.HTTP_200_OK,
        )


class CheckInAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        phone = request.data.get("phone")
        email = request.data.get("email")

        if not first_name or not last_name or not phone or not email:
            return Response(
                {"error": "Όλα τα πεδία είναι υποχρεωτικά."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.localtime()

        booking = (
            Booking.objects
            .filter(
                Guest_phone=phone.strip(),
                Guest_email=email.strip(),
            )
            .select_related("Room_id")
            .order_by("Start_time")
            .first()
        )

        if not booking:
            return Response(
                {"error": "Δεν βρέθηκε κράτηση με αυτά τα στοιχεία."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.Status == "CANCELLED":
            return Response(
                {"error": "Η κράτηση είναι ακυρωμένη."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.Status == "CHECKED_IN":
            return Response(
                {"error": "Η είσοδος έχει ήδη καταγραφεί για αυτή την κράτηση."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start_time = timezone.localtime(booking.Start_time)
        end_time = timezone.localtime(booking.End_time)

        if now.date() != start_time.date():
            return Response(
                {"error": "Η κράτηση δεν είναι για τη σημερινή ημέρα."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed_start = start_time - timedelta(minutes=15)

        if now < allowed_start:
            return Response(
                {
                    "error": "Η είσοδος δεν επιτρέπεται ακόμα. Επιτρέπεται έως 15 λεπτά πριν από την έναρξη."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if now > end_time:
            return Response(
                {"error": "Η ώρα της κράτησης έχει λήξει."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        checkin = CheckIn.objects.create(
            Booking_id=booking,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            phone=phone.strip(),
            email=email.strip(),
        )

        booking.Status = "CHECKED_IN"
        booking.save()

        return Response(
            {
                "message": "Η καταγραφή εισόδου ολοκληρώθηκε επιτυχώς.",
                "visitor": {
                    "first_name": checkin.first_name,
                    "last_name": checkin.last_name,
                    "phone": checkin.phone,
                    "email": checkin.email,
                },
                "booking": {
                    "booking_code": booking.Booking_id,
                    "room_name": booking.Room_id.Short_name if booking.Room_id else "",
                    "room_description": booking.Room_id.Description if booking.Room_id else "",
                    "date": start_time.strftime("%d/%m/%Y"),
                    "time_from": start_time.strftime("%H:%M"),
                    "time_to": end_time.strftime("%H:%M"),
                    "status": booking.Status,
                },
            },
            status=status.HTTP_200_OK,
        )

#---------------------
def send_booking_change_email(booking, room, reason):
    recipient = (booking.Guest_email or "").strip()

    if not recipient:
        if booking.User_id and booking.User_id.email:
            recipient = booking.User_id.email.strip()

    if not recipient:
        return

    start_time = timezone.localtime(booking.Start_time)
    end_time = timezone.localtime(booking.End_time)

    subject = "Ενημέρωση για την κράτησή σας"
    message = (
        f"Αγαπητέ/ή χρήστη,\n\n"
        f"Η κράτησή σας επηρεάστηκε λόγω αλλαγής στην αίθουσα '{room.Short_name}'.\n\n"
        f"Λόγος: {reason}\n"
        f"Κωδικός κράτησης: {booking.Booking_id}\n"
        f"Αίθουσα: {room.Short_name}\n"
        f"Ημερομηνία: {start_time.strftime('%d/%m/%Y')}\n"
        f"Ώρα: {start_time.strftime('%H:%M')} - {end_time.strftime('%H:%M')}\n\n"
        f"Η κράτησή σας έχει ακυρωθεί. Παρακαλούμε συνδεθείτε στο σύστημα για νέα κράτηση.\n\n"
        f"Με εκτίμηση,\n"
        f"RoomBooking"
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
    )

def get_future_affected_bookings(room):
    now = timezone.now()

    return Booking.objects.filter(
        Room_id=room,
        Start_time__gt=now,
        Status="UPCOMING",
    ).select_related("User_id", "Room_id")

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"error": "Δεν δόθηκε Google credential."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except Exception:
            return Response(
                {"error": "Μη έγκυρο Google token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = (idinfo.get("email") or "").strip().lower()
        first_name = (idinfo.get("given_name") or "").strip()
        last_name = (idinfo.get("family_name") or "").strip()
        email_verified = idinfo.get("email_verified", False)
        google_sub = (idinfo.get("sub") or "").strip()

        if not email:
            return Response(
                {"error": "Δεν επιστράφηκε email από τη Google."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email_verified:
            return Response(
                {"error": "Το Google email δεν είναι επιβεβαιωμένο."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()

        if not user:
            base_username = email.split("@")[0] or f"user_{google_sub[:8]}"
            username = base_username
            counter = 1

            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role="client",
                is_admin=False,
                is_staff=False,
                is_superuser=False,
                password=User.objects.make_random_password(),
            )
        else:
            changed = False

            if first_name and not user.first_name:
                user.first_name = first_name
                changed = True

            if last_name and not user.last_name:
                user.last_name = last_name
                changed = True

            if changed:
                user.save()

        serializer = MyTokenObtainPairSerializer()
        refresh = serializer.get_token(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_admin": user.is_admin,
                },
            },
            status=status.HTTP_200_OK,
        )
    
def send_booking_cancelled_email(booking, cancelled_by_admin=False):
    recipient = None

    if booking.User_id and booking.User_id.email:
        recipient = booking.User_id.email.strip().lower()
    elif booking.Guest_email:
        recipient = booking.Guest_email.strip().lower()

    if not recipient:
        return

    start_time = timezone.localtime(booking.Start_time) if booking.Start_time else None
    end_time = timezone.localtime(booking.End_time) if booking.End_time else None

    room_name = booking.Room_id.Short_name if booking.Room_id else "Άγνωστη αίθουσα"

    subject = f"Ακύρωση κράτησης για την αίθουσα {room_name}"

    if cancelled_by_admin:
        reason_text = "Η κράτησή σας ακυρώθηκε από τον διαχειριστή του συστήματος."
    else:
        reason_text = "Η κράτησή σας ακυρώθηκε."

    message = (
        f"{reason_text}\n\n"
        f"Αίθουσα: {room_name}\n"
        f"Ημερομηνία: {start_time.strftime('%d/%m/%Y') if start_time else '-'}\n"
        f"Ώρα: "
        f"{start_time.strftime('%H:%M') if start_time else '-'} - "
        f"{end_time.strftime('%H:%M') if end_time else '-'}\n"
        f"Κωδικός κράτησης: {booking.Booking_id}\n\n"
        f"Αν χρειάζεται, μπορείτε να μπείτε στο σύστημα και να κάνετε νέα κράτηση."
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
    )