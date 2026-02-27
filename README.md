# Room Booking System

Full-stack web application for booking university rooms.

## Tech Stack

Backend:
- Django
- Django REST Framework
- JWT Authentication

Frontend:
- React (Vite)
- Fetch API

---

# Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt   # or install packages manually
python manage.py migrate
python manage.py runserver

## Frontend 

#Then run: 
npm run dev
#Frontend runs at:
http://localhost:5173