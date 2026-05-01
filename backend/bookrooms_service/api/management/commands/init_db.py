from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Category, Room, Booking
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Γεμίζει τη βάση με δεδομένα βάσει των μοντέλων'

    def handle(self, *args, **kwargs):
        self.stdout.write("--- Έναρξη αρχικοποίησης ---")

        # 1. Δημιουργία Superuser
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@uni.gr',
                'is_admin': True,
                'is_staff': True,
                'is_superuser': True,
                'role': 'admin'
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('✔ Superuser: admin'))

        # 2. Δημιουργία Clients
        clients = []
        client_data = [
            ('student1', 'student1@uni.gr'),
            ('student2', 'student2@uni.gr'),
            ('prof_papadopoulos', 'prof@uni.gr'),
            ('researcher_maria', 'maria@uni.gr'),
        ]

        for uname, uemail in client_data:
            user, created = User.objects.get_or_create(
                username=uname,
                defaults={'email': uemail, 'role': 'client', 'is_admin': False}
            )
            if created:
                user.set_password('pass123')
                user.save()
            clients.append(user)
        self.stdout.write(self.style.SUCCESS(f'✔ Δημιουργήθηκαν {len(clients)} Clients.'))

        # 3. Δημιουργία Κατηγοριών (Χρήση Description αντί για Name)
        cat_lab, _ = Category.objects.get_or_create(Description="Εργαστήριο Πληροφορικής")
        cat_amf, _ = Category.objects.get_or_create(Description="Αμφιθέατρο")
        cat_class, _ = Category.objects.get_or_create(Description="Αίθουσα Διδασκαλίας")
        self.stdout.write(self.style.SUCCESS('✔ Δημιουργήθηκαν Κατηγορίες.'))

        # 4. Δημιουργία Αιθουσών (Χρήση Short_name, Description, Floor)
        rooms_data = [
            ("L101", "Εργαστήριο Δικτύων", cat_lab, 25, 1),
            ("L102", "Εργαστήριο Προγραμματισμού", cat_lab, 20, 1),
            ("AMF_A", "Μεγάλο Αμφιθέατρο", cat_amf, 150, 0),
            ("AMF_B", "Μικρό Αμφιθέατρο", cat_amf, 100, 0),
            ("R201", "Αίθουσα Θεωρίας", cat_class, 40, 2),
            ("R202", "Αίθουσα Σεμιναρίων", cat_class, 30, 2),
        ]

        created_rooms = []
        for sname, desc, cat, cap, floor in rooms_data:
            room, _ = Room.objects.get_or_create(
                Short_name=sname,
                defaults={
                    'Description': desc,
                    'Category_id': cat,
                    'Capacity': cap,
                    'Floor': floor
                }
            )
            created_rooms.append(room)
        self.stdout.write(self.style.SUCCESS(f'✔ Δημιουργήθηκαν {len(created_rooms)} Αίθουσες.'))

        # 5. Δημιουργία Κρατήσεων
        status_options = ['UPCOMING', 'COMPLETED', 'CANCELLED']
        for _ in range(10):
            r_user = random.choice(clients)
            r_room = random.choice(created_rooms)
            start = timezone.now() + timedelta(days=random.randint(-2, 5), hours=random.randint(1, 10))
            
            Booking.objects.create(
                User_id=r_user,
                Room_id=r_room,
                Start_time=start,
                End_time=start + timedelta(hours=2),
                Status=random.choice(status_options)
            )

        self.stdout.write(self.style.SUCCESS('✔ Δημιουργήθηκαν 10 Κρατήσεις.'))
        self.stdout.write(self.style.SUCCESS('--- Η βάση είναι έτοιμη! ---'))