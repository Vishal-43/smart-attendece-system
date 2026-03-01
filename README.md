# Smart Attendance System

Multi-platform attendance management system using geo-fencing, QR codes, and OTP verification.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend API** | Python 3.12+ · FastAPI · SQLAlchemy · Alembic |
| **Web Dashboard** | React 18 · Vite · Zustand · TanStack Query |
| **Mobile App** | Flutter 3.x · Dart · Dio · SharedPreferences |
| **Java Services** | Spring Boot (microservices skeleton) |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT (python-jose) · bcrypt (passlib) |

## Project Structure

```
backend-python/   – FastAPI REST API (11 routers, JWT auth, Alembic migrations)
web/               – React admin/teacher dashboard (Vite, neomorphism UI)
mobile/            – Flutter student/teacher mobile app
java-microservices/ – Spring Boot microservice skeletons
```

## Quick Start

### Backend
```bash
cd backend-python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Set DATABASE_URL and SECRET_KEY in .env
python run.py
```

### Web Dashboard
```bash
cd web
npm install
npm run dev
```

### Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## License

MIT
