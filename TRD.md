# Smart Attendance System
# Technical Requirements Document (TRD)

**Version:** 2.0.0  
**Status:** Production-Ready  
**Date:** March 25, 2026

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Database Design](#3-database-design)
4. [API Specification](#4-api-specification)
5. [Security Requirements](#5-security-requirements)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Real-Time Features](#7-real-time-features)
8. [Geofencing Implementation](#8-geofencing-implementation)
9. [QR Code System](#9-qr-code-system)
10. [OTP System](#10-otp-system)
11. [Web Frontend Architecture](#11-web-frontend-architecture)
12. [Mobile App Architecture](#12-mobile-app-architecture)
13. [Infrastructure](#13-infrastructure)
14. [Environment Configuration](#14-environment-configuration)
15. [Error Handling](#15-error-handling)
16. [Logging & Monitoring](#16-logging--monitoring)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SMART ATTENDANCE SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐    ┌─────────────────────┐                      │
│   │       Mobile         │    │         Web          │                      │
│   │     (Flutter)        │    │       (React)        │                      │
│   │    :8888            │    │      :5173          │                      │
│   └──────────┬──────────┘    └──────────┬──────────┘                      │
│              │                          │                                  │
│              │                          │                                  │
│              └──────────────┬───────────┘                                  │
│                             │                                              │
│                             ▼                                              │
│                   ┌─────────────────┐                                      │
│                   │    Nginx        │                                      │
│                   │   Reverse Proxy │                                      │
│                   │    :8000        │                                      │
│                   └────────┬────────┘                                      │
│                            │                                               │
│                            ▼                                               │
│                   ┌─────────────────┐    ┌─────────────────┐            │
│                   │   FastAPI        │    │     Redis       │            │
│                   │   (Python)        │◄───►│   (Cache)       │            │
│                   └────────┬────────┘    └─────────────────┘            │
│                            │                                               │
│                            ▼                                               │
│                   ┌─────────────────┐                                      │
│                   │   PostgreSQL    │                                      │
│                   │    (Database)    │                                      │
│                   └─────────────────┘                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND COMPONENTS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  app/                                                                      │
│  ├── main.py                 # FastAPI application entry point             │
│  ├── seed_data.py            # Database seeding                            │
│  ├── core/                                                                  │
│  │   ├── config.py           # Environment configuration (Pydantic)        │
│  │   ├── dependencies.py     # Dependency injection (get_db, get_user)    │
│  │   ├── exceptions.py       # Custom HTTP exceptions                      │
│  │   ├── response.py        # Standardized response wrappers              │
│  │   ├── redis_service.py   # Redis cache service                          │
│  │   └── email.py           # Email service                               │
│  ├── database/                                                             │
│  │   ├── database.py        # SQLAlchemy engine + SessionLocal              │
│  │   ├── user.py            # User model + UserRole enum                   │
│  │   ├── attendance_records.py  # Attendance model + Status enum          │
│  │   ├── qr_codes.py        # QR code storage                              │
│  │   ├── otp_code.py        # OTP storage                                 │
│  │   ├── timetables.py      # Timetable scheduling                        │
│  │   ├── locations.py       # Location + RoomType enum                     │
│  │   ├── access_points.py   # WiFi access points                          │
│  │   ├── courses.py         # Course model                                 │
│  │   ├── branches.py        # Branch model                                 │
│  │   ├── divisions.py       # Division model                               │
│  │   ├── batches.py         # Batch model                                  │
│  │   ├── subjects.py        # Subject model                                │
│  │   ├── student_enrollments.py  # Enrollment model                        │
│  │   ├── notifications.py   # Notification model                          │
│  │   └── audit_log.py       # Audit log model                              │
│  ├── routers/                                                             │
│  │   ├── auth.py            # /api/v1/auth/*                              │
│  │   ├── attendance.py      # /api/v1/attendance/*                        │
│  │   ├── qr_code.py         # /api/v1/qr/*                                │
│  │   ├── otp.py             # /api/v1/otp/*                               │
│  │   ├── users.py           # /api/v1/users/*                             │
│  │   ├── timetable.py       # /api/v1/timetables/*                       │
│  │   ├── locations.py        # /api/v1/locations/*                         │
│  │   ├── access_points.py   # /api/v1/access-points/*                    │
│  │   ├── reports.py         # /api/v1/reports/*                          │
│  │   ├── dashboard.py       # /api/v1/dashboard/*                        │
│  │   ├── notifications.py    # /api/v1/notifications/*                    │
│  │   ├── realtime.py        # WebSocket /ws/attendance/*                 │
│  │   └── health.py          # /health                                     │
│  ├── schemas/              # Pydantic request/response models              │
│  ├── security/                                                            │
│  │   ├── jwt_token.py       # JWT encode/decode                            │
│  │   ├── password.py        # Password hashing                            │
│  │   └── permissions.py     # RBAC dependency factory                     │
│  └── services/                                                            │
│      ├── audit_service.py   # Audit logging                                │
│      ├── notification_service.py  # Notification creation                  │
│      └── attendance_ws.py   # WebSocket manager                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Backend Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Python | 3.12 |
| Framework | FastAPI | Latest |
| ORM | SQLAlchemy | Latest |
| Migrations | Alembic | Latest |
| Database | PostgreSQL | 15 |
| Auth | python-jose | Latest |
| Password Hashing | bcrypt | Latest |
| QR Generation | qrcode | Latest |
| Redis Client | redis-py | Latest |
| CORS | fastapi.middleware.cors | Built-in |
| Rate Limiting | slowapi | Latest |
| Logging | structlog | Latest |

### 2.2 Web Frontend Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18 |
| Build Tool | Vite | 5 |
| Language | JavaScript (JSX) | ES2022 |
| State Management | Zustand | 4 |
| Data Fetching | TanStack Query | 5 |
| HTTP Client | Axios | 1.6 |
| Routing | React Router | 6 |
| Charts | Recharts | 2 |
| Maps | React Leaflet | 4 |
| Notifications | react-hot-toast | 2.4 |
| Icons | Lucide React | Latest |

### 2.3 Mobile App Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Flutter | 3 |
| Language | Dart | 3.x |
| HTTP Client | Dio | 5 |
| Local Storage | SharedPreferences | Latest |
| QR Scanner | mobile_scanner | Latest |
| QR Generator | qr_flutter | Latest |
| Location | geolocator | Latest |
| Network Info | network_info_plus | Latest |
| Permissions | permission_handler | Latest |

---

## 3. Database Design

### 3.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐        ┌─────────────────────┐        ┌─────────────┐    │
│  │    User     │        │  StudentEnrollment  │        │   Course    │    │
│  ├─────────────┤        ├─────────────────────┤        ├─────────────┤    │
│  │ id (PK)     │───┐    │ id (PK)             │    ┌───│ id (PK)     │    │
│  │ email       │   │    │ student_id (FK) ───┼────┘   │ name        │    │
│  │ username    │   └──► │ course_id (FK)      │        │ code        │    │
│  │ password_hash   │    │ branch_id (FK)      │        │ duration    │    │
│  │ first_name  │        │ division_id (FK)   │        │ semesters   │    │
│  │ last_name   │        │ enrollment_number  │        └─────────────┘    │
│  │ phone       │        │ enrollment_date    │              ▲           │
│  │ role        │        │ academic_year      │              │           │
│  │ branch_id   │        │ status             │              │           │
│  │ is_active   │        └─────────────────────┘              │           │
│  │ created_at  │                       │                    │           │
│  └─────────────┘                       │              ┌─────┴─────┐      │
│                                         │              │  Branch   │      │
│                                         │              ├───────────┤      │
│                                         └──────────────►│ id (PK)  │      │
│                                                        │ course_id │      │
│  ┌─────────────────┐       ┌─────────────────┐        │ name     │      │
│  │   Timetable     │       │ AttendanceRecord│        │ code     │      │
│  ├─────────────────┤       ├─────────────────┤        └───────────┘      │
│  │ id (PK)         │◄───────│ timetable_id    │               │           │
│  │ division_id     │       │ student_id (FK) │               │           │
│  │ teacher_id (FK) │       │ enrollment_id   │               │           │
│  │ subject_id (FK) │       │ teacher_id      │               │           │
│  │ location_id (FK)│       │ division_id     │               │           │
│  │ batch_id (FK)   │       │ batch_id        │        ┌──────┴──────┐    │
│  │ subject         │       │ location_id     │        │  Division   │    │
│  │ day_of_week     │       │ marked_at       │        ├─────────────┤    │
│  │ start_time      │       │ status          │        │ id (PK)     │    │
│  │ end_time        │       │ device_info     │        │ branch_id   │────┘
│  │ is_active       │       └─────────────────┘        │ name        │
│  └─────────────────┘                                   │ year        │
│         │                                              │ semester    │
│         │                                              └─────────────┘
│         │                                                    │
│  ┌──────┴──────┐                                           │
│  │  Location  │                                           │
│  ├─────────────┤              ┌────────────┐              │
│  │ id (PK)     │              │   Batch    │              │
│  │ name        │              ├────────────┤              │
│  │ latitude    │◄────────────│ id (PK)    │              │
│  │ longitude   │              │ division_id │              │
│  │ radius      │              │ name        │              │
│  │ room_no     │              └────────────┘              │
│  │ floor       │                                           │
│  │ room_type   │    ┌─────────────────┐                   │
│  │ capacity    │    │  AccessPoint    │                   │
│  └─────────────┘    ├─────────────────┤                   │
│         │           │ id (PK)         │                   │
│         └───────────►│ location_id    │                   │
│                      │ name           │                   │
│                      │ mac_address    │                   │
│                      │ is_active      │                   │
│                      └─────────────────┘                   │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │    QRCode       │    │    OTPCode      │                │
│  ├─────────────────┤    ├─────────────────┤                │
│  │ id (PK)         │    │ id (PK)         │                │
│  │ timetable_id    │    │ timetable_id   │                │
│  │ code (32-chars) │    │ code (6-digits)│                │
│  │ expires_at      │    │ expires_at     │                │
│  │ used_count      │    │ used_count     │                │
│  │ status          │    │ status         │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────┐ │
│  │  Notification   │    │   AuditLog     │    │UserPref    │ │
│  ├─────────────────┤    ├─────────────────┤    ├────────────┤ │
│  │ id (PK)         │    │ id (PK, UUID)  │    │ id (PK)    │ │
│  │ user_id (FK)    │    │ user_id (FK)   │    │ user_id    │ │
│  │ title           │    │ action         │    │ theme      │ │
│  │ message         │    │ entity_type    │    │ notif_pref │ │
│  │ type            │    │ entity_id      │    │ language   │ │
│  │ is_read         │    │ details (JSON) │    └────────────┘ │
│  │ created_at     │    │ ip_address     │                   │
│  └─────────────────┘    │ created_at     │                   │
│                         └─────────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Database Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | email, username, password_hash, role, branch_id, is_active |
| `courses` | Academic programs | name, code, duration_years, total_semesters |
| `branches` | Course specializations | name, code, branch_code, course_id |
| `divisions` | Class groups | name, year, semester, branch_id, capacity |
| `batches` | Student subgroups | name, batch_number, division_id |
| `subjects` | Course subjects | name, code, branch_id |
| `student_enrollments` | Student enrollment | enrollment_number, student_id, division_id, status |
| `timetables` | Class schedules | subject, day_of_week, start_time, end_time, teacher_id |
| `locations` | Physical rooms | name, latitude, longitude, radius, room_type |
| `access_points` | WiFi access points | location_id, name, mac_address, is_active |
| `qr_codes` | QR tokens | timetable_id, code, expires_at, used_count |
| `otp_codes` | OTP tokens | timetable_id, code, expires_at, used_count |
| `attendance_records` | Attendance entries | timetable_id, student_id, status, marked_at |
| `notifications` | User notifications | user_id, title, message, type, is_read |
| `audit_logs` | Action history | user_id, action, entity_type, details, ip_address |
| `user_preferences` | User settings | user_id, theme, notification_email, language |

---

## 4. API Specification

### 4.1 API Base URL

```
http://localhost:8000/api/v1
```

### 4.2 Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | - | Register new user |
| POST | `/auth/login` | - | User login |
| POST | `/auth/refresh` | - | Refresh access token |
| POST | `/auth/logout` | - | User logout |
| POST | `/auth/forgot-password` | - | Request password reset |
| POST | `/auth/reset-password` | - | Reset password with token |
| GET | `/auth/me` | JWT | Get current user info |

### 4.3 Attendance Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/attendance/mark` | STUDENT | Mark attendance via QR/OTP |
| GET | `/attendance/history/{userId}` | SELF/TEACHER/ADMIN | Get attendance history |
| GET | `/attendance/session/{timetableId}` | TEACHER/ADMIN | Get session attendance |
| PUT | `/{attendanceId}` | TEACHER/ADMIN | Update attendance status |
| GET | `/attendance/today` | TEACHER/ADMIN | Today's attendance |
| POST | `/attendance/mark-absent/{timetableId}` | TEACHER/ADMIN | Mark absent students |
| GET | `/attendance` | ADMIN | List all records |

### 4.4 QR Code Endpoints ⭐ UNIQUE

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/qr/generate/{timetableId}` | TEACHER/ADMIN | Generate QR code |
| GET | `/qr/current/{timetableId}` | TEACHER/ADMIN | Get active QR |
| GET | `/qr/status/{timetableId}` | JWT | Check session status |
| POST | `/qr/refresh/{timetableId}` | TEACHER/ADMIN | Refresh QR code |
| DELETE | `/qr/{qrId}` | TEACHER/ADMIN | Cancel QR session |
| DELETE | `/qr/cancel/{timetableId}` | TEACHER/ADMIN | Cancel by timetable |

### 4.5 OTP Endpoints ⭐ UNIQUE

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/otp/generate/{timetableId}` | TEACHER/ADMIN | Generate OTP |
| GET | `/otp/current/{timetableId}` | TEACHER/ADMIN | Get active OTP |
| GET | `/otp/status/{timetableId}` | JWT | Check session status |
| POST | `/otp/refresh/{timetableId}` | TEACHER/ADMIN | Refresh OTP |
| DELETE | `/otp/{otpId}` | TEACHER/ADMIN | Cancel OTP session |
| DELETE | `/otp/cancel/{timetableId}` | TEACHER/ADMIN | Cancel by timetable |

### 4.6 Academic Management Endpoints

| Resource | Methods |
|----------|---------|
| `/users` | GET, POST, PUT, DELETE |
| `/courses` | GET, POST, PUT, DELETE |
| `/branches` | GET, POST, PUT, DELETE |
| `/divisions` | GET, POST, PUT, DELETE |
| `/batches` | GET, POST, PUT, DELETE |
| `/subjects` | GET, POST, PUT, DELETE |
| `/timetables` | GET, POST, PUT, DELETE |
| `/enrollments` | GET, POST, PUT, DELETE |

### 4.7 Location & Access Points Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/locations` | - | List locations |
| POST | `/locations` | ADMIN | Create location |
| PUT | `/locations/{id}` | ADMIN | Update location |
| DELETE | `/locations/{id}` | ADMIN | Delete location |
| GET | `/access-points` | - | List access points |
| POST | `/access-points/{locationId}` | ADMIN | Create access point |
| DELETE | `/access-points/{id}` | ADMIN | Delete access point |

### 4.8 Reporting Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | JWT | Dashboard statistics |
| GET | `/reports/attendance-summary` | JWT | Attendance summary |
| GET | `/reports/student/{id}` | SELF/TEACHER/ADMIN | Student report |
| GET | `/reports/class/{timetableId}` | TEACHER/ADMIN | Class report |
| GET | `/reports/division-attendance` | TEACHER/ADMIN | Division report |
| GET | `/reports/export/csv` | TEACHER/ADMIN | Export CSV |

### 4.9 Notification Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | JWT | List notifications |
| PUT | `/{id}/read` | JWT | Mark as read |
| GET | `/notifications/unread-count` | JWT | Get unread count |

### 4.10 WebSocket Endpoint ⭐ UNIQUE

| Endpoint | Description |
|----------|-------------|
| `/ws/attendance/{timetableId}` | Real-time attendance updates |

---

## 5. Security Requirements

### 5.1 Authentication Security

| Requirement | Implementation |
|------------|----------------|
| Token Type | JWT (Access + Refresh) |
| Algorithm | HS256 |
| Access Token Expiry | 30 minutes |
| Refresh Token Expiry | 7 days |
| Password Hashing | PBKDF2 (29,000 rounds) |
| Token Storage | Client-side (localStorage/SharedPreferences) |

### 5.2 API Security

| Requirement | Implementation |
|------------|----------------|
| CORS | Configurable allowed origins |
| Rate Limiting | In-memory per-IP bucket algorithm |
| Request Logging | JSON structured logging |
| Error Handling | Custom exception handlers |
| Input Validation | Pydantic schemas |

### 5.3 CORS Configuration

```python
# Allowed origins loaded from environment
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Wildcard (*) logs warning but is allowed for development
```

### 5.4 Rate Limiting

```python
# Rate limit buckets per IP
_rate_limit_buckets: dict[tuple[str, str], deque[float]]

# Limits by endpoint type:
# - /api/v1/qr/generate, /api/v1/otp/generate: 30 requests/minute
# - /api/v1/auth/*: 60 requests/minute
# - All other: 120 requests/minute
```

---

## 6. Authentication & Authorization

### 6.1 JWT Token Structure

```python
# Access Token Payload
{
    "sub": "user_id",
    "email": "user@example.com",
    "role": "STUDENT",
    "exp": 1234567890,  # 30 minutes from issue
    "iat": 1234567890
}

# Refresh Token Payload
{
    "sub": "user_id",
    "type": "refresh",
    "exp": 1234567890,  # 7 days from issue
    "iat": 1234567890
}
```

### 6.2 Role-Based Access Control

```python
# User Roles Enum
class UserRole(enum.Enum):
    ADMIN = "ADMIN"
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"

# Permission Decorator Usage
@router.post("/attendance/mark")
async def mark_attendance(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    ...
)
```

### 6.3 Password Security

```python
# Password hashing with PBKDF2
from app.security.password import hash_password, verify_password

# Hash: PBKDF2 with salt, 29,000 rounds
password_hash = hash_password("password123", "salt")

# Verify
is_valid = verify_password("password123", password_hash)
```

---

## 7. Real-Time Features ⭐ UNIQUE

### 7.1 WebSocket Architecture

```python
# WebSocket Manager (attendance_ws.py)
class AttendanceWebSocketManager:
    def __init__(self):
        self._connections: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, timetable_id: int, websocket: WebSocket):
        await websocket.accept()
        self._connections[timetable_id].add(websocket)

    def disconnect(self, timetable_id: int, websocket: WebSocket):
        self._connections[timetable_id].discard(websocket)

    async def broadcast(self, timetable_id: int, payload: dict):
        # Send to all connected clients in the room
        for socket in self._connections[timetable_id]:
            await socket.send_text(json.dumps(payload))
```

### 7.2 WebSocket Endpoint

```python
# realtime.py
@router.websocket("/ws/attendance/{timetable_id}")
async def attendance_stream(websocket: WebSocket, timetable_id: int):
    await attendance_ws_manager.connect(timetable_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        attendance_ws_manager.disconnect(timetable_id, websocket)
```

### 7.3 Real-Time Event Payload

```json
{
  "event": "attendance_marked",
  "record": {
    "id": 1,
    "student_id": 5,
    "timetable_id": 10,
    "status": "present",
    "marked_at": "2026-03-25T09:30:00"
  },
  "student": {
    "id": 5,
    "name": "John Doe"
  }
}
```

### 7.4 Notification System

```python
# Notification Types
class NotificationType(enum.Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"

# Create Notification
notification = create_notification(
    db,
    user_id=teacher_id,
    title="New attendance marked",
    message="John Doe marked attendance for Mathematics",
    notification_type=NotificationType.INFO
)
```

---

## 8. Geofencing Implementation ⭐ UNIQUE

### 8.1 GPS Distance Calculation (Haversine Formula)

```python
# attendance.py
def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in metres between two WGS-84 coordinates."""
    R = 6_371_000  # Earth's radius in meters
    
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
```

### 8.2 GPS Validation Flow

```python
# Check if location has GPS configured
location_requires_gps = (
    location and 
    location.latitude is not None and 
    location.longitude is not None and 
    location.radius is not None and
    location.radius > 0
)

# Validate student GPS
if location_requires_gps:
    if user_lat is None or user_lon is None:
        raise ValidationError("GPS coordinates required")
    
    distance = _haversine_distance(user_lat, user_lon, location.latitude, location.longitude)
    if distance > location.radius:
        raise ValidationError(f"You are {distance:.0f}m away (max {location.radius}m)")
```

### 8.3 WiFi/BSSID Verification

```python
# Check WiFi access points for location
registered_aps = (
    db.query(AccessPoint)
    .filter(
        AccessPoint.location_id == location.id,
        AccessPoint.is_active == True,
    )
    .all()
)

# Match student BSSID
bssid_upper = student_bssid.upper()
bssid_matched = any(
    ap.mac_address.upper() == bssid_upper 
    for ap in registered_aps
)

if not bssid_matched:
    raise ForbiddenError("Not connected to authorized WiFi network")
```

---

## 9. QR Code System ⭐ UNIQUE

### 9.1 QR Code Generation

```python
# qr_code.py
def _generate_qr_image(data: str, timetable_id: int) -> str:
    """Render data as QR code, return base64 PNG."""
    qr_payload = json.dumps({"code": data, "timetable_id": timetable_id})
    img = qrcode.make(qr_payload)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()

# Generate 32-character URL-safe token
code_value = secrets.token_urlsafe(24)
```

### 9.2 QR Code Storage

```python
# Database model
class QRCode(Base):
    __tablename__ = "qr_codes"
    
    id = Column(Integer, primary_key=True)
    timetable_id = Column(Integer, ForeignKey("timetables.id"))
    code = Column(String, unique=True, nullable=False)  # 32 chars
    expires_at = Column(DateTime)
    used_count = Column(Integer, default=0)
    status = Column(Enum(CodeStatus))
    created_at = Column(DateTime)
```

### 9.3 QR Code Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         QR CODE LIFECYCLE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [TEACHER]                                                                 │
│        │                                                                    │
│        ├─ 1. POST /api/v1/qr/generate/{timetableId}                       │
│        │                                                                    │
│        │    ┌──────────────────────────────────────────────┐              │
│        │    │ System Actions:                               │              │
│        │    │ ├─ Invalidates existing QR codes              │              │
│        │    │ ├─ Generates 32-char URL-safe token           │              │
│        │    │ ├─ Creates Base64 PNG QR image                │              │
│        │    │ ├─ Sets TTL (default 10 minutes)              │              │
│        │    │ └─ Stores in database + Redis cache           │              │
│        │    └──────────────────────────────────────────────┘              │
│        │                                                                    │
│        ├─ 2. Returns QR Image + Code                                       │
│        │                                                                    │
│        │                         [STUDENT]                                 │
│        │                              │                                    │
│        │                              ├─ 3. Reads QR code                 │
│        │                              │                                    │
│        │                              ├─ 4. POST /attendance/mark         │
│        │                              │    Body: { method: "qr", code }  │
│        │                              │                                    │
│        │                              ├─ 5. System validates:             │
│        │                              │    ├─ Code exists                │
│        │                              │    ├─ Code not expired           │
│        │                              │    ├─ Student enrolled           │
│        │                              │    ├─ No duplicate               │
│        │                              │    └─ Location verified         │
│        │                              │                                    │
│        │                              ├─ 6. Attendance recorded          │
│        │                              │                                    │
│        │                              │                                    │
│        ├─ ←─ WEBSOCKET ───────────────┼─ Real-time notification         │
│        │                                                                    │
│        ├─ 7. TTL expires OR refresh/regenerate                            │
│        │                                                                    │
│        └─ 8. Code invalidated                                              │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.4 QR Code API Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "timetable_id": 10,
    "code": "abc123xyz...",
    "qr_image_base64": "iVBORw0KGgo...",
    "expires_at": "2026-03-25T10:30:00Z",
    "expires_in": 600,
    "used_count": 0,
    "status": "active",
    "is_expired": false
  }
}
```

---

## 10. OTP System ⭐ UNIQUE

### 10.1 OTP Generation

```python
# otp.py
def _make_otp() -> str:
    """Return a random 6-digit numeric string."""
    return "".join(random.choices(string.digits, k=settings.OTP_LENGTH))

# Default: 6 digits, 5 minutes TTL
OTP_LENGTH = 6
OTP_DEFAULT_TTL_MINUTES = 5
```

### 10.2 OTP Storage

```python
# Database model
class OTPCode(Base):
    __tablename__ = "otp_codes"
    
    id = Column(Integer, primary_key=True)
    timetable_id = Column(Integer, ForeignKey("timetables.id"))
    code = Column(String, nullable=False)  # 6 digits
    expires_at = Column(DateTime)
    used_count = Column(Integer, default=0)
    status = Column(String)  # active, cancelled
    created_at = Column(DateTime)
```

### 10.3 OTP Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OTP LIFECYCLE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [TEACHER]                                                                 │
│        │                                                                    │
│        ├─ 1. POST /api/v1/otp/generate/{timetableId}                      │
│        │                                                                    │
│        │    ┌──────────────────────────────────────────────┐              │
│        │    │ System Actions:                               │              │
│        │    │ ├─ Invalidates existing OTPs                  │              │
│        │    │ ├─ Generates 6-digit numeric code             │              │
│        │    │ ├─ Sets TTL (default 5 minutes)               │              │
│        │    │ └─ Stores in database + Redis cache           │              │
│        │    └──────────────────────────────────────────────┘              │
│        │                                                                    │
│        ├─ 2. Returns OTP (display on screen)                              │
│        │                                                                    │
│        │                         [STUDENT]                                 │
│        │                              │                                    │
│        │                              ├─ 3. Enters 6-digit OTP           │
│        │                              │                                    │
│        │                              ├─ 4. POST /attendance/mark         │
│        │                              │    Body: { method: "otp", code }  │
│        │                              │                                    │
│        │                              ├─ 5. System validates:             │
│        │                              │    ├─ OTP exists                  │
│        │                              │    ├─ OTP not expired             │
│        │                              │    ├─ Student enrolled            │
│        │                              │    ├─ No duplicate               │
│        │                              │    └─ Location verified           │
│        │                              │                                    │
│        │                              ├─ 6. Attendance recorded          │
│        │                              │                                    │
│        │                              │                                    │
│        ├─ ←─ WEBSOCKET ───────────────┼─ Real-time notification         │
│        │                                                                    │
│        ├─ 7. TTL expires OR refresh/regenerate                            │
│        │                                                                    │
│        └─ 8. OTP invalidated                                               │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Web Frontend Architecture

### 11.1 Project Structure

```
web/
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Main app with routing
│   ├── index.css            # Global styles
│   ├── api/
│   │   ├── client.js        # Axios instance with interceptors
│   │   ├── endpoints.js     # API endpoint definitions
│   │   ├── services.js      # High-level API services
│   │   └── hooks.js         # React Query hooks
│   ├── components/
│   │   ├── Common/          # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── DataTable.jsx
│   │   │   └── ConfirmModal.jsx
│   │   ├── Layout/          # Layout components
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── ui/              # Glass UI components
│   │   │   ├── GlassCard.jsx
│   │   │   ├── GlassInput.jsx
│   │   │   └── GlassButton.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── Management/
│   │   │   ├── UsersPage.jsx
│   │   │   ├── CoursesPage.jsx
│   │   │   ├── BranchesPage.jsx
│   │   │   ├── DivisionsPage.jsx
│   │   │   ├── BatchesPage.jsx
│   │   │   ├── EnrollmentsPage.jsx
│   │   │   ├── TimetablesPage.jsx
│   │   │   ├── LocationsPage.jsx
│   │   │   ├── AccessPointsPage.jsx
│   │   │   └── QrOtpManagement.jsx
│   │   ├── Reports/
│   │   │   ├── AttendanceReportsPage.jsx
│   │   │   ├── StudentReportPage.jsx
│   │   │   ├── ClassReportPage.jsx
│   │   │   └── AnalyticsPage.jsx
│   │   └── Settings/
│   │       ├── SettingsPage.jsx
│   │       └── ProfilePage.jsx
│   ├── stores/
│   │   └── authStore.js     # Zustand auth store
│   ├── hooks/
│   │   └── useToast.js
│   ├── contexts/
│   │   └── ThemeContext.jsx
│   └── styles/
│       ├── variables.css
│       └── globals.css
├── public/
├── package.json
├── vite.config.js
└── Dockerfile
```

### 11.2 State Management (Zustand)

```javascript
// stores/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  
  login: (user, accessToken, refreshToken) => set({ 
    user, 
    accessToken, 
    refreshToken 
  }),
  
  logout: () => set({ 
    user: null, 
    accessToken: null, 
    refreshToken: null 
  }),
  
  updateUser: (userData) => set({ 
    user: { ...useAuthStore.getState().user, ...userData } 
  }),
}));
```

### 11.3 API Client (Axios)

```javascript
// api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const response = await axios.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = response.data.data;
          useAuthStore.getState().login(
            useAuthStore.getState().user,
            access_token,
            refresh_token
          );
          // Retry original request
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(error.config);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### 11.4 QR/OTP Management Page

| Feature | Description |
|---------|-------------|
| Timetable Selector | Dropdown to select session |
| QR Display | Base64 PNG image with countdown |
| OTP Display | 6-digit number with countdown |
| Refresh Button | Rotate code |
| Live Count | Real-time attendance count |
| Timer | Countdown to expiry |

---

## 12. Mobile App Architecture

### 12.1 Project Structure

```
mobile/
├── lib/
│   ├── main.dart             # Flutter entry point
│   ├── constants.dart        # App constants
│   ├── core/
│   │   ├── network/
│   │   │   ├── api_client.dart
│   │   │   ├── api_exception.dart
│   │   │   └── network_result.dart
│   │   └── theme/
│   │       ├── app_colors.dart
│   │       ├── app_spacing.dart
│   │       ├── app_text_styles.dart
│   │       ├── app_decorations.dart
│   │       └── app_theme.dart
│   ├── features/
│   │   └── attendance/
│   │       ├── attendance_record.dart
│   │       ├── attendance_repository.dart
│   │       ├── attendance_history_card.dart
│   │       └── attendance_history_screen.dart
│   ├── screens/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── qr_otp/
│   │   ├── attendance/
│   │   ├── records/
│   │   ├── schedule/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── admin/
│   │   └── shell/
│   ├── services/
│   │   ├── dio_client.dart
│   │   ├── auth_service.dart
│   │   ├── user_service.dart
│   │   ├── location_service.dart
│   │   ├── wifi_service.dart
│   │   └── qr_otp/
│   │       └── qr_otp_service.dart
│   ├── providers/
│   ├── models/
│   ├── widgets/
│   └── utils/
├── pubspec.yaml
└── android/
```

### 12.2 Network Layer (Dio)

```dart
// services/dio_client.dart
class DioClient {
  late final Dio _dio;
  
  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: Duration(seconds: 30),
      receiveTimeout: Duration(seconds: 30),
    ));
    
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = StorageService.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }
}
```

### 12.3 QR/OTP Attendance Screen

| Tab | Feature |
|-----|---------|
| QR Tab | Enter scanned QR value |
| OTP Tab | Enter 6-digit OTP |
| Location | GPS coordinates capture |
| WiFi | BSSID capture |

---

## 13. Infrastructure

### 13.1 Docker Compose Architecture

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: smartattendance
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend-python
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/smartattendance
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  web:
    build: ./web
    ports:
      - "5173:80"

volumes:
  postgres_data:
```

### 13.2 Nginx Configuration

```nginx
# infra/nginx.prod.conf
server {
    listen 80;
    server_name _;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws/ {
        proxy_pass http://backend:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 14. Environment Configuration

### 14.1 Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | PostgreSQL connection string |
| `SECRET_KEY` | - | JWT signing secret (≥32 chars) |
| `ALGORITHM` | HS256 | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 30 | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | 7 | Refresh token lifetime |
| `ALLOWED_ORIGINS` | localhost:5173,localhost:3000 | CORS origins |
| `ENVIRONMENT` | development | Environment name |
| `DEBUG` | true | Debug mode |
| `QR_DEFAULT_TTL_MINUTES` | 10 | QR code TTL |
| `OTP_DEFAULT_TTL_MINUTES` | 5 | OTP TTL |
| `OTP_LENGTH` | 6 | OTP digit count |
| `REDIS_URL` | redis://localhost:6379 | Redis connection |

### 14.2 Web Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | http://localhost:8000 | API base URL |

---

## 15. Error Handling

### 15.1 Custom Exceptions

```python
# exceptions.py
class NotFoundError(Exception):
    """Resource not found (404)"""
    pass

class ConflictError(Exception):
    """Resource conflict (409)"""
    pass

class ForbiddenError(Exception):
    """Access forbidden (403)"""
    pass

class UnauthorizedError(Exception):
    """Authentication required (401)"""
    pass

class ValidationError(Exception):
    """Validation error (422)"""
    pass
```

### 15.2 Exception Handlers

```python
# main.py
app.add_exception_handler(NotFoundError, not_found_handler)
app.add_exception_handler(ConflictError, conflict_handler)
app.add_exception_handler(ForbiddenError, forbidden_handler)
app.add_exception_handler(UnauthorizedError, unauthorized_handler)
app.add_exception_handler(ValidationError, validation_handler)
app.add_exception_handler(RequestValidationError, validation_handler)
app.add_exception_handler(IntegrityError, integrity_handler)
app.add_exception_handler(Exception, generic_handler)
```

### 15.3 Standardized Response Format

```python
# response.py
def success_response(data: Any, message: str = "Success") -> dict:
    return {
        "success": True,
        "message": message,
        "data": data
    }

def error_response(message: str, errors: Any = None) -> dict:
    return {
        "success": False,
        "message": message,
        "errors": errors
    }
```

---

## 16. Logging & Monitoring

### 16.1 Request Logging

```python
# Structured JSON logging for each request
{
    "request_id": "uuid",
    "method": "POST",
    "path": "/api/v1/attendance/mark",
    "status_code": 200,
    "duration_ms": 45.2,
    "client_ip": "192.168.1.1"
}
```

### 16.2 Audit Logging

```python
# audit_service.py
async def log_action(
    db: Session,
    action: str,
    entity_type: str,
    user_id: int,
    entity_id: str = None,
    details: dict = None,
    request: Request = None
):
    # Log sensitive actions to audit_logs table
    # Non-blocking - failures don't disrupt main operation
```

### 16.3 Health Check Endpoint

```python
# health.py
@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }
```

---

## Appendix A: API Request/Response Examples

### A.1 Mark Attendance Request

```json
POST /api/v1/attendance/mark
{
  "timetable_id": 1,
  "method": "qr",
  "code": "abc123xyz...",
  "latitude": 19.1234,
  "longitude": 72.8765,
  "bssid": "AA:BB:CC:DD:EE:FF",
  "device_info": "iPhone 14 Pro"
}
```

### A.2 Mark Attendance Response

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "id": 1,
    "timetable_id": 1,
    "student_id": 5,
    "status": "present",
    "marked_at": "2026-03-25T09:30:00"
  }
}
```

### A.3 Generate QR Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "timetable_id": 1,
    "code": "abc123xyz...",
    "qr_image_base64": "iVBORw0KGgo...",
    "expires_at": "2026-03-25T10:30:00Z",
    "expires_in": 600,
    "used_count": 0,
    "status": "active",
    "is_expired": false
  }
}
```

---

## Appendix B: WebSocket Message Types

| Event | Description | Payload |
|-------|-------------|---------|
| `attendance_marked` | Student marked attendance | Record + Student info |
| `attendance_updated` | Status changed | Record info |
| `session_started` | QR/OTP generated | Timetable info |
| `session_ended` | Code expired | Timetable info |

---

*Document Version: 2.0.0*  
*Last Updated: March 25, 2026*
