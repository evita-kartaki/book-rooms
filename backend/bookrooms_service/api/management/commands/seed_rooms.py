from django.core.management.base import BaseCommand
from api.models import Category, Room

class Command(BaseCommand):
    help = "Seed initial categories and rooms"

    def handle(self, *args, **options):
        categories = {
            "Αίθουσες Διδασκαλίας": None,
            "Αίθουσες Εργαστηρίων": None,
            "Meeting Rooms": None,
            "Αίθουσες Παρουσιάσεων": None,
        }

        # Create / get categories
        for name in categories.keys():
            cat, _ = Category.objects.get_or_create(Description=name)
            categories[name] = cat

        rooms = [
            # Αίθουσες Διδασκαλίας
            {
                "Short_name": "Αίθουσα Διδασκαλίας Α1",
                "Description": "Χωρητικότητα 2 έως 5 άτομα",
                "Capacity": 5,
                "Floor": 1,
                "Category": "Αίθουσες Διδασκαλίας",
            },
            {
                "Short_name": "Αίθουσα Διδασκαλίας Α2",
                "Description": "Χωρητικότητα 5 έως 15 άτομα",
                "Capacity": 15,
                "Floor": 1,
                "Category": "Αίθουσες Διδασκαλίας",
            },
            {
                "Short_name": "Αίθουσα Διδασκαλίας Α3",
                "Description": "Χωρητικότητα 15 έως 40 άτομα",
                "Capacity": 40,
                "Floor": 1,
                "Category": "Αίθουσες Διδασκαλίας",
            },

            # Εργαστήρια
            {
                "Short_name": "Εργαστήριο Πληροφορικής",
                "Description": "Χωρητικότητα έως 15 άτομα",
                "Capacity": 15,
                "Floor": 1,
                "Category": "Αίθουσες Εργαστηρίων",
            },
            {
                "Short_name": "Εργαστήριο Φυσικής",
                "Description": "Χωρητικότητα έως 15 άτομα",
                "Capacity": 15,
                "Floor": 1,
                "Category": "Αίθουσες Εργαστηρίων",
            },
            {
                "Short_name": "Εργαστήριο Χημείας",
                "Description": "Χωρητικότητα έως 15 άτομα",
                "Capacity": 15,
                "Floor": 1,
                "Category": "Αίθουσες Εργαστηρίων",
            },

            # Meeting Rooms
            {
                "Short_name": "Meeting Room Β1",
                "Description": "Χωρητικότητα έως 10 άτομα",
                "Capacity": 10,
                "Floor": 2,
                "Category": "Meeting Rooms",
            },
            {
                "Short_name": "Meeting Room Β2",
                "Description": "Χωρητικότητα έως 10 άτομα",
                "Capacity": 10,
                "Floor": 2,
                "Category": "Meeting Rooms",
            },

            # Παρουσιάσεων
            {
                "Short_name": "Αίθουσα Παρουσιάσεων Γ1",
                "Description": "Χωρητικότητα έως 50 άτομα",
                "Capacity": 50,
                "Floor": 3,
                "Category": "Αίθουσες Παρουσιάσεων",
            },
            {
                "Short_name": "Αίθουσα Παρουσιάσεων Γ2",
                "Description": "Χωρητικότητα έως 200 άτομα",
                "Capacity": 200,
                "Floor": 3,
                "Category": "Αίθουσες Παρουσιάσεων",
            },
        ]

        created_count = 0
        for r in rooms:
            cat = categories[r["Category"]]
            room, created = Room.objects.get_or_create(
                Short_name=r["Short_name"],
                defaults={
                    "Description": r["Description"],
                    "Capacity": r["Capacity"],
                    "Floor": r["Floor"],
                    "Category_id": cat,
                },
            )
            if created:
                created_count += 1
            else:
                # optional: update existing to match your desired values
                room.Description = r["Description"]
                room.Capacity = r["Capacity"]
                room.Floor = r["Floor"]
                room.Category_id = cat
                room.save()

        self.stdout.write(self.style.SUCCESS(f"Done. Rooms created: {created_count}. Total rooms now: {Room.objects.count()}"))