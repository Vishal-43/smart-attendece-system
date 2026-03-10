# Java Gateway Route Proxy Map

This document defines which incoming Java microservice routes are proxied to which Python backend routes.

## Auth Service (`auth-service`)
- `POST /api/v1/auth/login` -> `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh` -> `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me` -> `GET /api/v1/auth/me`
- `POST /api/v1/auth/is-admin` -> `POST /api/v1/auth/is-admin`

## QR/OTP Service (`qr-otp-service`)
- `GET /api/v1/codes/` -> `GET /api/v1/codes/`
- `GET /api/v1/codes/timetable_id:{id}` -> `GET /api/v1/codes/timetable_id:{id}`
- `POST /api/v1/codes/qr_code` -> `POST /api/v1/codes/qr_code`
- `DELETE /api/v1/codes/qr_code/{id}` -> `DELETE /api/v1/codes/qr_code/{id}`
- `POST /api/v1/codes/otp_code` -> `POST /api/v1/codes/otp_code`
- `DELETE /api/v1/codes/otp_code/{id}` -> `DELETE /api/v1/codes/otp_code/{id}`

## Attendance Service (`attendance-service`)
- `GET /api/v1/attendance/` -> `GET /api/v1/attendance/`
- `GET /api/v1/attendance/{id}` -> `GET /api/v1/attendance/{id}`
- `GET /api/v1/attendance/student_id:{id}` -> `GET /api/v1/attendance/student_id:{id}`
- `POST /api/v1/attendance/` -> `POST /api/v1/attendance/`
- `PUT /api/v1/attendance/{id}` -> `PUT /api/v1/attendance/{id}`
- `DELETE /api/v1/attendance/{id}` -> `DELETE /api/v1/attendance/{id}`

## Data Service (`data-service`)
- `GET|POST|PUT|DELETE /api/v1/users/*` -> `/api/v1/users/*`
- `GET|POST|PUT|DELETE /api/v1/courses/*` -> `/api/v1/courses/*`
- `GET|POST|PUT|DELETE /api/v1/branches/*` -> `/api/v1/branches/*`
- `GET|POST|PUT|DELETE /api/v1/divisions/*` -> `/api/v1/divisions/*`
- `GET|POST|PUT|DELETE /api/v1/batches/*` -> `/api/v1/batches/*`
- `GET|POST|PUT|DELETE /api/v1/locations/*` -> `/api/v1/locations/*`
- `GET|POST|PUT|DELETE /api/v1/timetables/*` -> `/api/v1/timetables/*`
- `GET|POST|PUT|DELETE /api/v1/enrollments/*` -> `/api/v1/enrollments/*`
