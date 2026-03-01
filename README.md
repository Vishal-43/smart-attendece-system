# Smart Attendance System

A full-stack smart attendance platform consisting of:

| Layer | Stack |
|-------|-------|
| **Backend API** | Python 3.12 · FastAPI · SQLAlchemy · Alembic · PostgreSQL |
| **Web Dashboard** | React 18 · Vite · Zustand · TanStack Query · react-hot-toast |
| **Mobile App** | Flutter 3 · Dart · Dio · SharedPreferences |

---

## Quick Start

### Backend

```bash
cd backend-python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# copy and edit environment variables
cp .env.example .env

# run migrations
alembic upgrade head

# start dev server (auto-reload)
python run.py
```

API docs available at <http://localhost:8000/docs>

---

### Web Dashboard

```bash
cd web
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
```

---

### Mobile App

```bash
cd mobile
flutter pub get
flutter run          # choose a device / emulator
```

---

## Project Structure

```
backend-python/
  app/
    core/
      config.py          # env-var settings (Pydantic BaseSettings)
      dependencies.py    # FastAPI dependency helpers (get_db, get_current_user, …)
      exceptions.py      # Custom HTTP exceptions + handlers
      response.py        # Standardised success_response / error_response wrappers
    database/
      database.py        # SQLAlchemy engine + SessionLocal
      *.py               # ORM models (User, Timetable, AttendanceRecord, …)
      audit_log.py       # Audit trail model
    routers/
      auth.py            # /api/v1/auth/…
      attendance.py      # /api/v1/attendance/…
      qr_code.py         # /api/v1/qr/…
      otp.py             # /api/v1/otp/…
      health.py          # /health
      *.py               # batches, branches, courses, divisions, …
    schemas/             # Pydantic request / response models
    security/
      jwt_token.py       # JWT encode / decode
      permissions.py     # RBAC: require_role() dependency factory
    services/
      audit_service.py   # log_action() writes to audit_logs table
  alembic/               # Database migrations

web/src/
  components/
    Common/
      ConfirmModal.jsx   # Reusable delete/action confirmation dialog
      DataTable.jsx      # Sortable, searchable, paginated table
      index.jsx          # Button, Card, Input, Alert, Loading, Modal, Table, Select
    Layout/
      Layout.jsx, Sidebar.jsx, Header.jsx
  hooks/
    useToast.js          # Wrapper around react-hot-toast
  screens/               # Page components (Dashboard, Users, Courses, …)
  services/              # Axios API calls + endpoints.js
  stores/
    authStore.js         # Zustand auth state
  styles/
    variables.css        # CSS custom properties (single source of truth)
    globals.css          # Base reset + typography

mobile/lib/
  core/
    network/
      api_client.dart          # Typed HTTP client (wraps DioClient)
      api_exception.dart       # Typed error hierarchy
      network_result.dart      # Success<T> / Failure<T> result type
    theme/
      app_colors.dart          # Brand colour tokens
      app_spacing.dart         # Spacing / radius / icon-size / duration tokens
      app_text_styles.dart     # Typography scale
      app_decorations.dart     # BoxDecoration / InputDecoration factories
      app_theme.dart           # ThemeData factory (AppTheme.light())
  features/
    attendance/
      attendance_record.dart          # Data model + AttendanceHistoryPage
      attendance_repository.dart      # API calls for attendance
      attendance_history_card.dart    # Single-record card widget
      attendance_history_screen.dart  # Paginated list screen with stats header
  screens/
    qr_otp/qr_otp_screen.dart  # Student attendance marking (QR + OTP tabs)
    login/…, dashboard/…, admin/…, records/…
  services/              # auth_service, dio_client, qr_otp_service, …
  main.dart              # App() with AppTheme.light() applied
```

---

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | — | Liveness probe |
| POST | /api/v1/auth/login | — | Obtain JWT tokens |
| POST | /api/v1/auth/refresh | — | Refresh access token |
| GET | /api/v1/attendance/ | ADMIN | List all records (paginated) |
| POST | /api/v1/attendance/mark | STUDENT | Self-mark attendance |
| GET | /api/v1/attendance/history/{userId} | SELF/TEACHER/ADMIN | Paginated history |
| GET | /api/v1/attendance/session/{timetableId} | TEACHER/ADMIN | Session-level view |
| PUT | /api/v1/attendance/{id} | TEACHER/ADMIN | Update status |
| POST | /api/v1/qr/generate/{timetableId} | TEACHER/ADMIN | Generate QR code |
| GET | /api/v1/qr/current/{timetableId} | TEACHER/ADMIN | Get active QR |
| POST | /api/v1/qr/refresh/{timetableId} | TEACHER/ADMIN | Rotate QR code |
| POST | /api/v1/otp/generate/{timetableId} | TEACHER/ADMIN | Generate OTP |
| GET | /api/v1/otp/current/{timetableId} | TEACHER/ADMIN | Get active OTP |
| POST | /api/v1/otp/refresh/{timetableId} | TEACHER/ADMIN | Rotate OTP |

See [API_EXAMPLES.md](API_EXAMPLES.md) for full request/response examples.

---

## Environment Variables (backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `SECRET_KEY` | — | JWT signing secret (≥ 32 chars) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |

---

## Authentication

All protected endpoints require an `Authorization: Bearer <access_token>` header.

Roles: `admin` · `teacher` · `student`

---

## Running Migrations

```bash
cd backend-python

# generate a new migration
alembic revision --autogenerate -m "description"

# apply all pending migrations
alembic upgrade head

# roll back one step
alembic downgrade -1
```

---

## Architecture Notes

- **Standardised responses** — every endpoint returns `{ success, data, message }` via `success_response()` / `error_response()`.
- **RBAC** — `require_role(UserRole.TEACHER, UserRole.ADMIN)` is a FastAPI dependency that raises HTTP 403 if the caller's role is not listed.
- **Audit log** — `log_action()` writes to the `audit_logs` table for sensitive operations (attendance marks, QR generation, etc.). It never raises exceptions.
- **Geofencing** — if the timetable's location has `latitude`, `longitude`, and `radius` set, students must provide GPS coordinates within that radius to mark attendance.
- **Code rotation** — generating or refreshing a QR/OTP invalidates all active codes for that timetable first, preventing replay.
