from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Room, Category, User, Booking


def normalize_phone(phone):
    if not phone:
        return ""

    digits = "".join(ch for ch in str(phone) if ch.isdigit())

    if digits.startswith("30") and len(digits) > 10:
        digits = digits[2:]

    return digits


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = [
            "Room_id",
            "Short_name",
            "Description",
            "Capacity",
            "Floor",
            "Category_id",
            "is_active",
        ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["Category_id", "Description"]


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "phone",
            "first_name",
            "last_name",
            "password",
        ]
        extra_kwargs = {
            "email": {"required": False, "allow_blank": True},
            "phone": {"required": False, "allow_blank": True},
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
        }

    def validate_username(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Το username είναι υποχρεωτικό.")

        qs = User.objects.filter(username=value)

        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError("Το username χρησιμοποιείται ήδη.")

        return value

    def validate_email(self, value):
        value = (value or "").strip().lower()

        if not value:
            return value

        qs = User.objects.filter(email=value)

        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError("Το email χρησιμοποιείται ήδη.")

        return value

    def validate_phone(self, value):
        value = normalize_phone(value)

        if not value:
            return value

        qs = User.objects.filter(phone=value)

        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError("Το τηλέφωνο χρησιμοποιείται ήδη.")

        return value

    def create(self, validated_data):
        password = (validated_data.pop("password", "") or "").strip()

        if not password:
            raise serializers.ValidationError({
                "password": "Ο κωδικός είναι υποχρεωτικός."
            })

        role = validated_data.get("role", "client")
        email = (validated_data.get("email", "") or "").strip().lower()
        phone = normalize_phone(validated_data.get("phone", ""))

        user = User.objects.create_user(
            username=(validated_data.get("username", "") or "").strip(),
            email=email,
            first_name=(validated_data.get("first_name", "") or "").strip(),
            last_name=(validated_data.get("last_name", "") or "").strip(),
            phone=phone,
            role=role,
            is_admin=(role == "admin"),
            is_staff=(role == "admin"),
            password=password,
        )

        return user

    def update(self, instance, validated_data):
        validated_data.pop("password", None)

        instance.username = (validated_data.get("username", instance.username) or "").strip()
        instance.email = (validated_data.get("email", instance.email) or "").strip().lower()
        instance.first_name = (validated_data.get("first_name", instance.first_name) or "").strip()
        instance.last_name = (validated_data.get("last_name", instance.last_name) or "").strip()
        instance.phone = normalize_phone(validated_data.get("phone", instance.phone))
        instance.role = validated_data.get("role", instance.role)

        instance.is_admin = instance.role == "admin"
        instance.is_staff = instance.role == "admin"

        instance.save()
        return instance


class BookingSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source="Room_id.Short_name", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "Booking_id",
            "User_id",
            "Room_id",
            "Start_time",
            "End_time",
            "Status",
            "Guest_first_name",
            "Guest_last_name",
            "Guest_email",
            "Guest_phone",
            "room_name",
        ]
        read_only_fields = ["User_id", "room_name"]

    def validate(self, attrs):
        room = attrs.get("Room_id")
        start_time = attrs.get("Start_time")
        end_time = attrs.get("End_time")

        if not room:
            raise serializers.ValidationError(
                {"Room_id": "Το δωμάτιο είναι υποχρεωτικό."}
            )

        if not start_time or not end_time:
            raise serializers.ValidationError(
                {"time": "Η ώρα έναρξης και λήξης είναι υποχρεωτικές."}
            )

        if end_time <= start_time:
            raise serializers.ValidationError(
                {"End_time": "Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης."}
            )

        overlapping_bookings = Booking.objects.filter(
            Room_id=room,
            Start_time__lt=end_time,
            End_time__gt=start_time,
        ).exclude(Status="CANCELLED")

        if self.instance:
            overlapping_bookings = overlapping_bookings.exclude(
                Booking_id=self.instance.Booking_id
            )

        if overlapping_bookings.exists():
            raise serializers.ValidationError(
                {"error": "Η αίθουσα είναι ήδη δεσμευμένη για την επιλεγμένη ημέρα και ώρα."}
            )

        return attrs


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["username"] = user.username
        return token


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "password",
            "confirm_password",
        ]

    def validate_username(self, value):
        username = value.strip()

        if not username:
            raise serializers.ValidationError("Το username είναι υποχρεωτικό.")

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("Το username χρησιμοποιείται ήδη.")

        return username

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Το email χρησιμοποιείται ήδη.")

        return email

    def validate_phone(self, value):
        phone = normalize_phone(value)

        if not phone:
            raise serializers.ValidationError("Το τηλέφωνο είναι υποχρεωτικό.")

        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Το τηλέφωνο χρησιμοποιείται ήδη.")

        return phone

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Οι κωδικοί δεν ταιριάζουν."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"].strip(),
            email=validated_data["email"].strip().lower(),
            first_name=validated_data["first_name"].strip(),
            last_name=validated_data["last_name"].strip(),
            phone=normalize_phone(validated_data["phone"]),
            role="client",
            is_admin=False,
            is_staff=False,
            is_superuser=False,
            password=validated_data["password"],
        )

        return user