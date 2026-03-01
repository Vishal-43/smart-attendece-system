# API Examples

Complete request / response examples for all new endpoints.

---

## Health

### GET /health

```http
GET /health HTTP/1.1
Host: localhost:8000
```

**Response 200:**
```json
{
  "status": "ok",
  "database": "connected",
  "version": "2.0.0",
  "timestamp": "2024-09-01T12:00:00.000000"
}
```

**Response 503 (DB down):**
```json
{
  "status": "degraded",
  "database": "unreachable",
  "version": "2.0.0",
  "timestamp": "2024-09-01T12:00:00.000000"
}
```

---

## Authentication

### POST /api/v1/auth/login

```json
// Request
{
  "username": "teacher@college.edu",
  "password": "secret"
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "token_type": "bearer",
    "user": {
      "id": 7,
      "email": "teacher@college.edu",
      "role": "teacher",
      "first_name": "Jane",
      "last_name": "Doe"
    }
  },
  "message": "Login successful"
}
```

---

## Attendance

### POST /api/v1/attendance/mark

Requires **student** JWT.

```json
// Request
{
  "timetable_id": 42,
  "method": "otp",
  "code": "847291",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "device_info": "iPhone 15 Pro"
}

// Response 200
{
  "success": true,
  "data": {
    "id": 1001,
    "timetable_id": 42,
    "student_id": 15,
    "enrollment_id": 3,
    "teacher_id": 7,
    "division_id": 2,
    "batch_id": null,
    "location_id": 5,
    "marked_at": "2024-09-01T09:15:00",
    "status": "present",
    "device_info": "iPhone 15 Pro",
    "created_at": "2024-09-01T09:15:00",
    "updated_at": "2024-09-01T09:15:00"
  },
  "message": "Attendance marked successfully"
}

// Error — duplicate
{
  "success": false,
  "data": null,
  "message": "Conflict — Attendance already marked for this session today"
}

// Error — expired code
{
  "success": false,
  "data": null,
  "message": "Validation error — Code has expired"
}

// Error — outside geofence
{
  "success": false,
  "data": null,
  "message": "Forbidden — You are 842m away from the session location (max 100m)"
}
```

---

### GET /api/v1/attendance/history/{userId}

Requires **student** (own id only), **teacher**, or **admin** JWT.

Query params: `page`, `limit`, `timetable_id`, `start_date` (YYYY-MM-DD), `end_date`

```
GET /api/v1/attendance/history/15?page=1&limit=20&start_date=2024-09-01
Authorization: Bearer <token>
```

```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1001,
        "timetable_id": 42,
        "student_id": 15,
        "status": "present",
        "marked_at": "2024-09-01T09:15:00"
      }
    ],
    "total": 48,
    "page": 1,
    "limit": 20,
    "pages": 3
  },
  "message": null
}
```

---

### GET /api/v1/attendance/session/{timetableId}

Requires **teacher** or **admin** JWT.

Query params: `session_date` (defaults to today)

```
GET /api/v1/attendance/session/42?session_date=2024-09-01
Authorization: Bearer <token>
```

```json
{
  "success": true,
  "data": {
    "timetable_id": 42,
    "date": "2024-09-01",
    "total_present": 34,
    "records": [ /* array of attendance record objects */ ]
  }
}
```

---

### PUT /api/v1/attendance/{attendanceId}

Requires **teacher** (own sessions) or **admin**.

```json
// Request
{ "status": "late" }

// Response 200
{
  "success": true,
  "data": { /* updated attendance record */ },
  "message": "Attendance record updated"
}
```

---

## QR Codes

### POST /api/v1/qr/generate/{timetableId}

Requires **teacher** (own timetable) or **admin**.

Query params: `ttl_minutes` (1–120, default 10)

```
POST /api/v1/qr/generate/42?ttl_minutes=15
Authorization: Bearer <token>
```

```json
{
  "success": true,
  "data": {
    "id": 99,
    "timetable_id": 42,
    "code": "Xk9mP2rL...",
    "created_at": "2024-09-01T09:00:00",
    "expires_at": "2024-09-01T09:15:00",
    "used_count": 0,
    "is_expired": false,
    "qr_image_base64": "iVBOR..."
  },
  "message": "QR code generated"
}
```

---

### GET /api/v1/qr/current/{timetableId}

```
GET /api/v1/qr/current/42?with_image=true
Authorization: Bearer <token>
```

Response shape identical to generate; returns 404 if no active code exists.

---

### POST /api/v1/qr/refresh/{timetableId}

Invalidates current code and issues a new one. Same response shape as generate.

---

## OTP Codes

### POST /api/v1/otp/generate/{timetableId}

Requires **teacher** (own timetable) or **admin**.

Query params: `ttl_minutes` (1–60, default 5)

```json
{
  "success": true,
  "data": {
    "id": 55,
    "timetable_id": 42,
    "code": "847291",
    "created_at": "2024-09-01T09:00:00",
    "expires_at": "2024-09-01T09:05:00",
    "used_count": 0,
    "is_expired": false
  },
  "message": "OTP generated successfully"
}
```

---

### GET /api/v1/otp/current/{timetableId}

```
GET /api/v1/otp/current/42
Authorization: Bearer <token>
```

Returns 404 if no active OTP.

---

### POST /api/v1/otp/refresh/{timetableId}

Rotates OTP. Same response as generate.

---

## Standard Error Envelope

All errors return a consistent shape:

```json
{
  "success": false,
  "data": null,
  "message": "Human-readable error text"
}
```

HTTP status codes:
- `400` Bad Request — missing / invalid body fields
- `401` Unauthorised — missing / expired JWT
- `403` Forbidden — insufficient role
- `404` Not Found — resource does not exist
- `409` Conflict — duplicate resource
- `422` Validation Error — FastAPI request validation failed
- `500` Internal Server Error — unexpected exception
