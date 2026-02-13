# API Reference - Java Microservices

Complete API reference for all Java microservices in the Smart Attendance System.

## Base URLs

| Service | URL | Port |
|---------|-----|------|
| Auth Service | `http://localhost:8000` | 8000 |
| QR/OTP Service | `http://localhost:8001` | 8001 |
| Attendance Service | `http://localhost:8002` | 8002 |
| Data Service | `http://localhost:8003` | 8003 |

## Authentication Service (Port 8000)

### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "user123"
}

Response:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### Refresh Token
```
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}

Response:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### Get Current User
```
GET /api/v1/auth/me
Authorization: Bearer {access_token}

Response:
{
  "id": 1,
  "email": "user@example.com",
  "username": "user123",
  "role": "admin",
  "is_active": true
}
```

### Check Admin Status
```
POST /api/v1/auth/is-admin
Authorization: Bearer {access_token}

Response:
true/false
```

## QR/OTP Service (Port 8001)

### List All Codes
```
GET /api/v1/codes/

Response:
[
  [
    {"id": 1, "timetable_id": 1, "code": "ABC123", ...},
    ...
  ],
  [
    {"id": 1, "timetable_id": 1, "code": "123456", ...},
    ...
  ]
]
```

### Get Codes by Timetable
```
GET /api/v1/codes/timetable_id:5

Response:
[
  {"id": 1, "timetable_id": 5, "code": "ABC123", ...},
  {"id": 2, "timetable_id": 5, "code": "DEF456", ...}
]
```

### Create QR Code
```
POST /api/v1/codes/qr_code
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "timetable_id": 1,
  "code": "ABC123DEF456"
}

Response:
{
  "id": 1,
  "timetable_id": 1,
  "code": "ABC123DEF456",
  "generated_at": "2025-02-13T10:30:00",
  "expires_at": "2025-02-13T11:30:00",
  "is_used": false,
  "used_at": null
}
```

### Create OTP Code
```
POST /api/v1/codes/otp_code
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "timetable_id": 1,
  "code": "123456"
}

Response:
{
  "id": 1,
  "timetable_id": 1,
  "code": "123456",
  "generated_at": "2025-02-13T10:30:00",
  "expires_at": "2025-02-13T10:35:00",
  "is_used": false,
  "used_at": null
}
```

### Delete QR Code
```
DELETE /api/v1/codes/qr_code/1
Authorization: Bearer {admin_token}

Response:
{
  "id": 1,
  "timetable_id": 1,
  "code": "ABC123DEF456",
  ...
}
```

### Delete OTP Code
```
DELETE /api/v1/codes/otp_code/1
Authorization: Bearer {admin_token}

Response:
{
  "id": 1,
  "timetable_id": 1,
  "code": "123456",
  ...
}
```

## Attendance Service (Port 8002)

### List All Attendance Records
```
GET /api/v1/attendance/

Response:
[
  {
    "id": 1,
    "student_id": 1,
    "teacher_id": 5,
    "timetable_id": 10,
    "enrollment_id": 1,
    "division_id": 2,
    "batch_id": 1,
    "status": "present",
    "marked_at": "2025-02-13T10:30:00",
    "location_verified": true,
    "access_point_matched": true
  },
  ...
]
```

### Get Attendance by ID
```
GET /api/v1/attendance/1

Response:
[
  {
    "id": 1,
    "student_id": 1,
    "status": "present",
    ...
  }
]
```

### Get Attendance by Student ID
```
GET /api/v1/attendance/student_id:5

Response:
[
  {"id": 1, "student_id": 5, "status": "present", ...},
  {"id": 2, "student_id": 5, "status": "absent", ...},
  ...
]
```

### Create Attendance Record
```
POST /api/v1/attendance/
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "student_id": 1,
  "teacher_id": 5,
  "timetable_id": 10,
  "enrollment_id": 1,
  "division_id": 2,
  "batch_id": 1,
  "status": "present"
}

Response:
{
  "id": 1,
  "student_id": 1,
  "status": "present",
  "marked_at": "2025-02-13T10:30:00",
  ...
}
```

### Update Attendance Record
```
PUT /api/v1/attendance/1
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "status": "absent",
  "location_verified": false
}

Response:
{
  "id": 1,
  "status": "absent",
  "location_verified": false,
  ...
}
```

### Delete Attendance Record
```
DELETE /api/v1/attendance/1
Authorization: Bearer {admin_token}

Response:
{
  "id": 1,
  ...
}
```

## Data Service (Port 8003)

### Batches

```
GET    /api/v1/batches/                          # List all
GET    /api/v1/batches/division_id:2              # By division
POST   /api/v1/batches/                          # Create
PUT    /api/v1/batches/1                         # Update
DELETE /api/v1/batches/batch_id:1                 # Delete
```

### Branches

```
GET    /api/v1/branches/                         # List all
GET    /api/v1/branches/course_id:1              # By course
GET    /api/v1/branches/branch_id:1              # By ID
POST   /api/v1/branches/                         # Create
PUT    /api/v1/branches/1                        # Update
DELETE /api/v1/branches/1                        # Delete
```

### Courses

```
GET    /api/v1/courses/                          # List all
GET    /api/v1/courses/1                         # Get by ID
POST   /api/v1/courses/                          # Create
PUT    /api/v1/courses/1                         # Update
DELETE /api/v1/courses/1                         # Delete
```

### Divisions

```
GET    /api/v1/divisions/                        # List all
GET    /api/v1/divisions/course:1                # By course
GET    /api/v1/divisions/branch_id:1             # By branch
POST   /api/v1/divisions/                        # Create
PUT    /api/v1/divisions/1                       # Update
DELETE /api/v1/divisions/1                       # Delete
```

### Enrollments

```
GET    /api/v1/enrollments/                      # List all
GET    /api/v1/enrollments/id:1                  # By ID
GET    /api/v1/enrollments/student_id:1          # By student
GET    /api/v1/enrollments/course_id:1           # By course
GET    /api/v1/enrollments/branch_id:1           # By branch
GET    /api/v1/enrollments/division_id:1         # By division
POST   /api/v1/enrollments/                      # Create
PUT    /api/v1/enrollments/1                     # Update
DELETE /api/v1/enrollments/1                     # Delete
```

### Locations

```
GET    /api/v1/locations/                        # List all
GET    /api/v1/locations/1                       # Get by ID
POST   /api/v1/locations/                        # Create
PUT    /api/v1/locations/1                       # Update
DELETE /api/v1/locations/1                       # Delete
```

### Timetables

```
GET    /api/v1/timetables/                       # List all
GET    /api/v1/timetables/1                      # Get by ID
GET    /api/v1/timetables/division_id:1          # By division
GET    /api/v1/timetables/teacher_id:1           # By teacher
GET    /api/v1/timetables/location_id:1          # By location
POST   /api/v1/timetables/                       # Create
PUT    /api/v1/timetables/1                      # Update
DELETE /api/v1/timetables/1                      # Delete
```

### Users

```
GET    /api/v1/users/                            # List all
GET    /api/v1/users/1                           # Get by ID
POST   /api/v1/users/                            # Create
PUT    /api/v1/users/1                           # Update
DELETE /api/v1/users/1                           # Delete
```

## Response Format

All responses are JSON formatted with consistent structure:

### Success Response (2xx)
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  ...
}
```

### List Response
```json
[
  {"id": 1, ...},
  {"id": 2, ...},
  ...
]
```

### Error Response (4xx, 5xx)
```json
{
  "error": "Error message",
  "status": 400,
  "path": "/api/v1/endpoint"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

## Authentication

All protected endpoints require Bearer token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token by calling:
```
POST /api/v1/auth/login
```

## Rate Limits

No rate limits currently configured. Implement rate limiting based on requirements.

## Pagination

Currently all list endpoints return full results. Implement pagination as needed with:
- `?page=1&size=10` parameters
