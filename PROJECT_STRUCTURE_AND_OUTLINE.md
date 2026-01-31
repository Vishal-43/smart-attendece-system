# Smart Attendance System - Comprehensive Project Plan

**Last Updated:** January 18, 2026  
**Project Status:** Phase 2 Complete - Pydantic Schemas Validated  
**Architecture Level:** Industry-Grade, Production-Ready

## 🎯 Current Progress Summary

✅ **Phase 1: Database Schema & Models (COMPLETE)**
- All 11 SQLAlchemy ORM models created and tested
- Supabase PostgreSQL database connectivity verified
- Seed data script successfully populates database with sample data
- Import paths fixed (absolute imports from `app.database.database`)
- All model validations passing

✅ **Phase 2: Pydantic Schemas (COMPLETE)**
- All 11 Pydantic schema modules created and validated
- User, Enrollment, Timetable, Attendance, Location schemas
- Course, Branch, Division, Batch schemas
- QRCode and OTPCode schemas
- All imports tested successfully

✅**Phase 3: Alembic Migrations (COMPLETE)**
- Setup database version control
- Generate initial migration from models

✅ **Phase 4: Authentication (COMPLETE)**
- JWT token system implemented (access + refresh tokens)
- Password hashing with bcrypt via passlib
- Security utilities: `app/security/token.py` and `app/security/password.py`
- FastAPI dependencies: `app/core/dependencies.py`
  - OAuth2PasswordBearer token extraction
  - `get_current_user` dependency (validates JWT, loads user, checks is_active)
  - Role guards: `require_admin`, `require_teacher`, `require_student`
- Auth schemas: `app/schemas/auth.py`
  - `AuthLoginRequest`, `AuthTokens`, `TokenRefreshRequest`, `UserPublic`, `TokenPayload`
- Auth routes: `app/routers/auth.py`
  - POST `/api/v1/auth/login` → returns access + refresh tokens
  - POST `/api/v1/auth/refresh` → returns new access token
  - GET `/api/v1/auth/me` → returns current user profile
- All endpoints tested and working successfully

---

## Phase 1: Database Layer - Completion Report

### ✅ Models Implemented & Tested

| Model | Status | Purpose | Key Fields |
|-------|--------|---------|-----------|
| `User` | ✅ Tested | Central user identity (Admin, Teacher, Student) | id, email, username, role, is_active |
| `Course` | ✅ Tested | Academic degree programs (BE, ME, BSc) | id, name, code, duration_years |
| `Branch` | ✅ Tested | Engineering departments (COMP, IT, MECH) | id, course_id, branch_code, name |
| `Division` | ✅ Tested | Class sections (A, B, C, D) - fixed assignment | id, branch_id, name, year, semester, capacity |
| `Batch` | ✅ Tested | Lab practical batches (1-4 per division) | id, division_id, batch_number, semester |
| `StudentEnrollment` | ✅ Tested | Student progression tracking | id, student_id, enrollment_number, current_year, has_kt |
| `Location` | ✅ Tested | Geo-fenced classroom/labs | id, name, latitude, longitude, radius, room_type |
| `Timetable` | ✅ Tested | Class schedule (theory + practical) | id, division_id, teacher_id, location_id, lecture_type |
| `AttendanceRecord` | ✅ Tested | Attendance marking with verification | id, student_id, timetable_id, status, device_info |
| `QRCode` | ✅ Tested | Dynamic QR codes (25s refresh) | id, timetable_id, code, expires_at |
| `OTPCode` | ✅ Tested | One-time passwords (60s refresh) | id, timetable_id, code, expires_at |

### ✅ Database Features Implemented

- **Connection**: Supabase PostgreSQL with SQLAlchemy connection pooling
- **Enums**: UserRole, EnrollmentStatus, EnrollmentYear, LectureType, DayOfWeek, AttendanceStatus, RoomType
- **Relationships**: Proper ForeignKey constraints, cascade behaviors
- **Defaults**: datetime.utcnow for timestamps, Boolean flags for status tracking
- **Validation**: Nullable constraints, String length specifications, PK/UK indexes

### ✅ Testing & Seed Data

**Sample Data Inserted Successfully:**
- 6 users (1 admin, 2 teachers, 3 students)
- 2 courses (BE, ME)
- 3 branches (COMP, IT, MECH)
- 2 divisions (A, B)
- 6 batches (3 per division)
- 3 student enrollments with realistic enrollment numbers (VU4f2425001)
- 2 locations with geo-coordinates
- 2 timetables (theory + practical sessions)
- 1 QR code with 30-second expiry
- 1 OTP code with 60-second expiry
- 2 attendance records with device info and JSON payload

### 🔧 Issues Fixed

1. **Import Path Errors**: All models updated from `from database import base` → `from app.database.database import Base`
2. **Naming Conventions**: database.py standardized to use `SessionLocal` and `Base` (PascalCase)
3. **Duplicate Column**: Removed duplicate `used_count` column in OTPCode model
4. **Missing Exception Block**: Added except/finally to seed_batches function
5. **File Organization**: Reorganized model files for consistency

### 📊 Database Verification

```
✅ Database connectivity: VERIFIED
✅ All tables created: VERIFIED
✅ Sample data inserted: VERIFIED
✅ Enum types: VERIFIED
✅ Foreign key constraints: VERIFIED
✅ Timestamp defaults: VERIFIED

Sample Verification Output:
  - Users: 6 ✅
  - Courses: 2 ✅
  - Branches: 3 ✅
  - Divisions: 2 ✅
  - Batches: 6 ✅
  - Enrollments: 3 ✅
  - Locations: 2 ✅
  - Timetables: 2 ✅
  - QR Codes: 1 ✅
  - OTP Codes: 1 ✅
  - Attendance Records: 2 ✅
```

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Mandatory Language Integration Strategy](#mandatory-language-integration-strategy)
3. [Technology Stack](#technology-stack)
4. [Project Directory Structure](#project-directory-structure)
5. [Database Schema (Supabase)](#database-schema-supabase)
6. [System Architecture](#system-architecture)
7. [CI/CD Pipeline Strategy](#cicd-pipeline-strategy)
8. [Docker & Containerization](#docker--containerization)
9. [API Documentation](#api-documentation)
10. [Security Implementation](#security-implementation)
11. [Monitoring & Logging](#monitoring--logging)
12. [Development Workflow](#development-workflow)
13. [Rapid Development Timeline](#rapid-development-timeline)
14. [Deployment Strategy](#deployment-strategy)
15. [Environment Configuration](#environment-configuration)
16. [Next Steps & Action Items](#next-steps--action-items)

---

## Executive Summary

Building an **industry-level smart attendance system** that mandatorily integrates **Python, Java, JavaScript, Dart, and Haskell** with **Supabase** as the database backbone. The system focuses on rapid development while maintaining enterprise-grade quality, scalability, and security.

### Core Features
- **Geo-fencing** - Location-based attendance validation
- **Dynamic QR Codes** - Refreshing every 20-30 seconds
- **One-Time Passwords** - Expiring after 60 seconds
- **Access Point Matching** - WiFi/Bluetooth signal verification
- **Admin Dashboard** - Division and timetable management
- **Real-time Updates** - WebSocket-based live attendance tracking
- **Multi-platform** - Web admin + iOS/Android mobile apps

### Target Users
- **Students** - Mark attendance via mobile app
- **Teachers** - Initiate and monitor attendance sessions
- **Administrators** - Manage system, users, and schedules
- **DevOps** - Monitor, maintain, and scale infrastructure

---

## Mandatory Language Integration Strategy

Each of the **five languages** serves a specific, critical purpose with **no redundancy**:

### Language Responsibility Matrix

| Language | Primary Role | Justification | Key Technologies |
|----------|-------------|---------------|------------------|
| **Python** | Core API Server & Real-time Services | Rapid development, async capabilities, rich ecosystem | FastAPI, Celery, WebSockets, SQLAlchemy |
| **Java** | High-Performance Microservices | Enterprise-grade processing, critical validations | Spring Boot, Spring Cloud, Kafka, JPA |
| **JavaScript/TypeScript** | Admin Web Dashboard | Industry standard for web UIs, rich component library | React 18, TypeScript, Vite, TanStack Query |
| **Dart/Flutter** | Cross-Platform Mobile Apps | Single codebase for iOS/Android, native performance | Flutter 3.x, Provider, Dio, Geolocator |
| **Haskell** | Pure Functional Validation Engine | Type-safe calculations, mathematical accuracy | Servant, Warp, Aeson, PostgreSQL-simple |

### Language Dependency Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
├──────────────────────┬──────────────────┬───────────────────┤
│   Dart/Flutter       │   Dart/Flutter   │   JavaScript/     │
│   (Student App)      │   (Teacher App)  │   React (Admin)   │
└──────────┬───────────┴──────────┬───────┴──────────┬────────┘
           │                      │                   │
           └──────────────────────┼───────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   Python FastAPI Server    │
                    │   (Main API Gateway)       │
                    └─────────────┬──────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
    ┌───────▼────────┐   ┌────────▼────────┐   ┌──────▼──────┐
    │ Java Spring    │   │ Haskell Servant │   │ Python      │
    │ Microservices  │   │ Validation      │   │ Celery      │
    │ (Validation)   │   │ Engine          │   │ Workers     │
    └───────┬────────┘   └────────┬────────┘   └──────┬──────┘
            │                     │                    │
            └─────────────────────┼────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   Supabase (PostgreSQL)    │
                    │   + Redis Cache            │
                    └────────────────────────────┘
```

### Why All 5 Languages?

**Python (FastAPI):**
- Your strongest skill - handles core API logic
- Async/await for WebSocket real-time updates
- Celery for background QR/OTP refresh tasks
- Rich libraries for geo-calculations and QR generation

**Java (Spring Boot):**
- Enterprise-level attendance validation (mission-critical)
- High-throughput access point signal processing
- Batch report generation and analytics
- Kafka event streaming for audit logs
- Production-grade error handling and monitoring

**JavaScript/React:**
- Industry standard for admin dashboards
- Rich UI component ecosystem
- Real-time data visualization (charts, maps)
- TypeScript for large-scale codebase safety

**Dart/Flutter:**
- Single codebase for iOS and Android
- Native performance for GPS and sensors
- Offline-first architecture capability
- Cross-platform consistency

**Haskell:**
- Pure functional geo-fencing calculations (no side effects)
- Type-safe validation rules (compile-time guarantees)
- Mathematical precision for location algorithms
- Learning curve justified by critical validation accuracy

---

## Directory Structure

```
smartattendencesystem/
│
├── PROJECT_STRUCTURE_AND_OUTLINE.md      # This file
├── README.md                              # Quick start guide
├── CONTRIBUTING.md                        # Development guidelines
├── LICENSE                                # MIT or your choice
├── .gitignore                             # Git ignore rules
├── docker-compose.yml                     # Local development stack
├── docker-compose.prod.yml                # Production stack
│
├── backend-python/                        # Python FastAPI Backend ✅ Phase 1 Complete
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                        # FastAPI app entry point (TODO)
│   │   ├── config.py                      # Configuration management (TODO)
│   │   │
│   │   ├── api/                           # API route handlers (TODO Phase 2)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                    # Authentication endpoints
│   │   │   ├── users.py                   # User management
│   │   │   ├── enrollments.py             # Student enrollment APIs
│   │   │   ├── attendance.py              # Attendance marking
│   │   │   ├── timetables.py              # Timetable management
│   │   │   ├── locations.py               # Geo-fence locations
│   │   │   ├── qr_codes.py                # QR code generation
│   │   │   ├── otp_codes.py               # OTP generation
│   │   │   └── reports.py                 # Attendance reports
│   │   │
│   │   ├── database/                      # Database Layer ✅ Phase 1 Complete
│   │   │   ├── __init__.py
│   │   │   ├── database.py                # ✅ SQLAlchemy setup, connection pooling
│   │   │   ├── user.py                    # ✅ User model + UserRole enum
│   │   │   ├── courses.py                 # ✅ Course model
│   │   │   ├── branches.py                # ✅ Branch model
│   │   │   ├── divisions.py               # ✅ Division model (fixed assignment)
│   │   │   ├── batches.py                 # ✅ Batch model
│   │   │   ├── student_enrollments.py     # ✅ StudentEnrollment + EnrollmentStatus
│   │   │   ├── locations.py               # ✅ Location + RoomType enum
│   │   │   ├── timetables.py              # ✅ Timetable + LectureType + DayOfWeek
│   │   │   ├── attendance_records.py      # ✅ AttendanceRecord + AttendanceStatus
│   │   │   ├── qr_codes.py                # ✅ QRCode model
│   │   │   └── otp_code.py                # ✅ OTPCode model
│   │   │
│   │   ├── schemas/                       # Pydantic validation schemas ✅ Phase 2 Complete
│   │   │   ├── __init__.py
│   │   │   ├── user.py                    # ✅ User request/response schemas
│   │   │   ├── enrollment.py              # ✅ StudentEnrollment schemas
│   │   │   ├── attendance_records.py      # ✅ Attendance record schemas
│   │   │   ├── locations.py               # ✅ Location schemas
│   │   │   ├── timetable.py               # ✅ Timetable schemas
│   │   │   ├── courses.py                 # ✅ Course schemas
│   │   │   ├── branches.py                # ✅ Branch schemas
│   │   │   ├── divisions.py               # ✅ Division schemas
│   │   │   ├── batches.py                 # ✅ Batch schemas
│   │   │   ├── qr_code.py                 # ✅ QRCode schemas
│   │   │   └── otp_code.py                # ✅ OTPCode schemas
│   │   │
│   │   ├── services/                      # Business logic layer (TODO Phase 3+)
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py            # Authentication logic
│   │   │   ├── attendance_service.py      # Attendance validation
│   │   │   ├── geofence_service.py        # Geo-fencing calculations
│   │   │   ├── qr_service.py              # QR code management
│   │   │   └── notification_service.py    # Push notifications
│   │   │
│   │   ├── celery_tasks/                  # Async background tasks (TODO Phase 4)
│   │   │   ├── __init__.py
│   │   │   ├── qr_refresh_task.py         # Scheduled QR refresh
│   │   │   ├── otp_cleanup_task.py        # Clean expired OTPs
│   │   │   ├── attendance_sync_task.py    # Sync attendance data
│   │   │   └── reports_task.py            # Generate reports
│   │   │
│   │   ├── middleware/                    # Custom middleware (TODO Phase 3)
│   │   │   ├── __init__.py
│   │   │   ├── auth_middleware.py         # JWT verification
│   │   │   ├── error_handler.py           # Global error handling
│   │   │   └── logging_middleware.py      # Request/response logging
│   │   │
│   │   ├── utils/                         # Utility functions (TODO)
│   │   │   ├── __init__.py
│   │   │   ├── jwt_utils.py               # JWT token handling
│   │   │   ├── validators.py              # Input validation
│   │   │   └── exceptions.py              # Custom exceptions
│   │   │
│   │   ├── seed_data.py                   # ✅ Database seeding script
│   │   └── dependencies.py                # FastAPI dependencies
│   │
│   ├── tests/                             # Test suite (TODO)
│   │   ├── __init__.py
│   │   ├── conftest.py                    # Pytest fixtures
│   │   └── test_models.py                 # Model tests
│   │
│   ├── venv/                              # ✅ Virtual environment (Python 3.14)
│   ├── requirements.txt                   # ✅ Python dependencies installed
│   ├── .env.example                       # ✅ Environment variables template
│   ├── Dockerfile                         # Docker image (TODO)
│   ├── docker-compose.yml                 # Docker composition (TODO)
│   └── Makefile                           # Development commands (TODO)
│
├── mobile/                                # Flutter Mobile App
│   ├── pubspec.yaml                       # Flutter dependencies
│   ├── pubspec.lock                       # Locked versions
│   ├── Makefile                           # Flutter commands
│   ├── .env.example                       # App configuration template
│   │
│   ├── lib/
│   │   ├── main.dart                      # App entry point
│   │   ├── config/
│   │   │   ├── app_config.dart            # App configuration
│   │   │   ├── api_client.dart            # HTTP client setup
│   │   │   └── constants.dart             # App constants
│   │   │
│   │   ├── models/                        # Data models
│   │   │   ├── user_model.dart
│   │   │   ├── location_model.dart
│   │   │   ├── attendance_model.dart
│   │   │   └── qr_model.dart
│   │   │
│   │   ├── providers/                     # State management (Riverpod/Provider)
│   │   │   ├── auth_provider.dart
│   │   │   ├── attendance_provider.dart
│   │   │   ├── location_provider.dart
│   │   │   └── qr_provider.dart
│   │   │
│   │   ├── services/                      # Business logic
│   │   │   ├── api_service.dart
│   │   │   ├── location_service.dart      # GPS access
│   │   │   ├── camera_service.dart        # Camera/QR
│   │   │   ├── storage_service.dart       # Local storage
│   │   │   └── notification_service.dart
│   │   │
│   │   ├── screens/                       # UI screens
│   │   │   ├── splash_screen.dart
│   │   │   ├── auth/
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── register_screen.dart
│   │   │   │   └── forgot_password_screen.dart
│   │   │   ├── attendance/
│   │   │   │   ├── attendance_home_screen.dart
│   │   │   │   ├── qr_display_screen.dart
│   │   │   │   ├── location_verification_screen.dart
│   │   │   │   └── attendance_history_screen.dart
│   │   │   ├── profile/
│   │   │   │   ├── profile_screen.dart
│   │   │   │   └── settings_screen.dart
│   │   │   └── navigation/
│   │   │       └── bottom_nav_bar.dart
│   │   │
│   │   ├── widgets/                       # Reusable widgets
│   │   │   ├── qr_code_widget.dart
│   │   │   ├── location_display_widget.dart
│   │   │   ├── attendance_card_widget.dart
│   │   │   └── custom_buttons.dart
│   │   │
│   │   ├── utils/                         # Utility functions
│   │   │   ├── validators.dart
│   │   │   ├── formatters.dart
│   │   │   ├── logger.dart
│   │   │   └── exceptions.dart
│   │   │
│   │   └── theme/
│   │       ├── app_theme.dart
│   │       ├── app_colors.dart
│   │       └── app_text_styles.dart
│   │
│   ├── test/                              # Flutter tests
│   │   ├── unit/
│   │   │   └── services_test.dart
│   │   ├── widget/
│   │   │   └── screens_test.dart
│   │   └── integration/
│   │       └── app_flow_test.dart
│   │
│   ├── android/                           # Android native
│   │   └── app/
│   │       └── build.gradle
│   │
│   ├── ios/                               # iOS native
│   │   └── Podfile
│   │
│   ├── Dockerfile.mobile                  # Build container (optional)
│   └── .gitignore
│
├── web/                                   # React Admin Dashboard
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js                     # Vite build config
│   ├── .env.example                       # Environment template
│   ├── Makefile                           # Development commands
│   │
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── main.jsx                       # React entry point
│   │   ├── App.jsx
│   │   ├── index.css
│   │   │
│   │   ├── api/                           # API integration
│   │   │   ├── client.js                  # Axios client
│   │   │   ├── endpoints.js               # API endpoints
│   │   │   └── hooks.js                   # React Query hooks
│   │   │
│   │   ├── components/                    # Reusable components
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── Common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   └── Table.jsx
│   │   │   └── Dashboard/
│   │   │       ├── StatCard.jsx
│   │   │       ├── Chart.jsx
│   │   │       └── Analytics.jsx
│   │   │
│   │   ├── pages/                         # Page components
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── DashboardStats.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Management/
│   │   │   │   ├── Divisions.jsx
│   │   │   │   ├── DivisionForm.jsx
│   │   │   │   ├── Timetables.jsx
│   │   │   │   ├── TimetableForm.jsx
│   │   │   │   ├── Locations.jsx
│   │   │   │   ├── LocationForm.jsx
│   │   │   │   ├── AccessPoints.jsx
│   │   │   │   ├── Users.jsx
│   │   │   │   └── UserForm.jsx
│   │   │   ├── Reports/
│   │   │   │   ├── AttendanceReports.jsx
│   │   │   │   ├── StudentReport.jsx
│   │   │   │   ├── ClassReport.jsx
│   │   │   │   └── Analytics.jsx
│   │   │   ├── Settings/
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── SystemConfig.jsx
│   │   │   │   └── UserProfile.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── store/                         # State management
│   │   │   ├── authStore.js               # Auth state (Zustand)
│   │   │   ├── uiStore.js                 # UI state
│   │   │   └── appStore.js                # App state
│   │   │
│   │   ├── hooks/                         # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useForm.js
│   │   │   └── usePagination.js
│   │   │
│   │   ├── utils/                         # Utility functions
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── logger.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── styles/                        # Global styles
│   │   │   ├── variables.css
│   │   │   ├── globals.css
│   │   │   └── responsive.css
│   │   │
│   │   └── theme/
│   │       └── theme.js
│   │
│   ├── tests/                             # Test suite
│   │   ├── unit/
│   │   │   └── utils.test.js
│   │   ├── component/
│   │   │   └── Dashboard.test.jsx
│   │   └── integration/
│   │       └── adminFlow.test.js
│   │
│   ├── Dockerfile                         # Docker image
│   ├── .dockerignore
│   ├── nginx.conf                         # Nginx config for production
│   └── .gitignore
│
├── haskell/                               # Haskell Services (Future)
│   ├── stack.yaml                         # Stack build tool
│   ├── package.yaml                       # Package definition
│   │
│   ├── src/
│   │   ├── Lib.hs
│   │   ├── Api/
│   │   │   └── Server.hs                  # Servant REST server
│   │   ├── Services/
│   │   │   ├── GeofenceValidator.hs       # Geo-fence validation
│   │   │   ├── AccessPointMatcher.hs      # Access point matching
│   │   │   └── AttendanceValidator.hs     # Attendance validation
│   │   └── Utils/
│   │       ├── Types.hs
│   │       └── Config.hs
│   │
│   ├── test/
│   │   ├── Spec.hs
│   │   └── Services/
│   │       └── GeofenceValidatorSpec.hs
│   │
│   └── Dockerfile
│
├── java/                                  # Java Services (Future)
│   ├── pom.xml                            # Maven configuration
│   ├── src/
│   │   ├── main/
│   │   │   └── java/com/smartattendance/
│   │   │       ├── Application.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── model/
│   │   │       └── repository/
│   │   └── test/
│   │       └── java/com/smartattendance/
│   │
│   └── Dockerfile
│
├── infrastructure/                        # Infrastructure & DevOps
│   ├── kubernetes/                        # K8s manifests (future)
│   │   ├── namespace.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── backend-service.yaml
│   │   ├── postgres-statefulset.yaml
│   │   ├── redis-deployment.yaml
│   │   ├── celery-deployment.yaml
│   │   ├── ingress.yaml
│   │   └── configmap.yaml
│   │
│   ├── docker/
│   │   ├── nginx.dockerfile              # Reverse proxy
│   │   └── prometheus.dockerfile         # Monitoring
│   │
│   ├── terraform/                         # Infrastructure as Code (future)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── networking.tf
│   │   ├── compute.tf
│   │   └── database.tf
│   │
│   ├── scripts/
│   │   ├── setup_dev.sh                  # Dev environment setup
│   │   ├── setup_prod.sh                 # Prod environment setup
│   │   ├── backup_database.sh            # Database backup
│   │   ├── restore_database.sh           # Database restore
│   │   ├── migrate_database.sh           # Run migrations
│   │   └── deploy.sh                     # Deployment script
│   │
│   └── monitoring/
│       ├── prometheus.yml                # Prometheus config
│       ├── grafana-dashboards/
│       │   ├── attendance-dashboard.json
│       │   └── system-health.json
│       └── alerting/
│           └── alert-rules.yml
│
├── docs/                                  # Documentation
│   ├── ARCHITECTURE.md                    # System architecture
│   ├── API_DOCUMENTATION.md               # API reference
│   ├── DATABASE_SCHEMA.md                 # Database design
│   ├── DEPLOYMENT.md                      # Deployment guide
│   ├── DEVELOPMENT.md                     # Development guide
│   ├── TESTING.md                         # Testing strategy
│   ├── SECURITY.md                        # Security guidelines
│   ├── TROUBLESHOOTING.md                 # Troubleshooting guide
│   └── CONTRIBUTING.md                    # Contribution guidelines
│
├── .github/
│   ├── workflows/
│   │   ├── backend-ci.yml                # Backend CI/CD
│   │   ├── mobile-ci.yml                 # Mobile CI/CD
│   │   ├── web-ci.yml                    # Web CI/CD
│   │   ├── deploy-staging.yml            # Staging deployment
│   │   ├── deploy-production.yml         # Production deployment
│   │   └── security-scan.yml             # Security scanning
│   │
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── documentation.md
│   │
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitlab-ci.yml                        # GitLab CI/CD (alternative)
├── .env.example                          # Global environment template
└── CHANGELOG.md                          # Release notes

```

---

## Technology Stack

### Backend Services

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| API Framework | FastAPI | 0.100+ | High-performance async REST API |
| ASGI Server | Uvicorn | 0.23+ | ASGI server for FastAPI |
| Database | PostgreSQL | 14+ | Main relational database |
| Cache/Session | Redis | 7.0+ | Caching, sessions, token storage |
| Task Queue | Celery | 5.3+ | Background jobs, scheduled tasks |
| Message Broker | Redis | 7.0+ | Message broker for Celery |
| ORM | SQLAlchemy | 2.0+ | Database ORM |
| Migration | Alembic | 1.12+ | Database schema migrations |
| Validation | Pydantic | 2.0+ | Data validation |
| JWT | PyJWT | 2.8+ | JWT token generation/validation |
| WebSocket | python-socketio | 5.9+ | Real-time WebSocket communication |
| HTTP Client | httpx | 0.24+ | HTTP client for external APIs |
| Testing | pytest | 7.4+ | Testing framework |
| Code Quality | black, flake8, isort | latest | Code formatting and linting |

### Frontend - Mobile

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Flutter | 3.16+ | Cross-platform mobile development |
| State Mgmt | Riverpod | 2.4+ | Advanced state management |
| API Client | dio | 5.2+ | HTTP client with interceptors |
| Storage | sqflite | 2.2+ | Local SQLite database |
| Geolocation | geolocator | 9.0+ | GPS location access |
| Camera | camera | 0.10+ | Camera access for QR scanning |
| QR Display | qr_flutter | 4.0+ | QR code generation |
| Notifications | flutter_local_notifications | 14.0+ | Local notifications |
| Testing | flutter_test | Latest | Testing framework |

### Frontend - Web

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 18+ | UI framework |
| Build Tool | Vite | 4.5+ | Fast build tool |
| State Mgmt | Zustand | 4.4+ | Lightweight state management |
| Server State | React Query | 5.0+ | Server state management |
| HTTP Client | axios | 1.6+ | HTTP client |
| Maps | react-leaflet | 4.0+ | Map visualization |
| UI Library | React Bootstrap / Material-UI | Latest | Component library |
| Testing | vitest, react-testing-library | Latest | Testing frameworks |
| Routing | react-router-dom | 6.0+ | Client-side routing |
| Charts | recharts | 2.10+ | Data visualization |

### Infrastructure & DevOps

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Containerization | Docker | 24.0+ | Container images |
| Orchestration | Docker Compose | 2.20+ | Multi-container management |
| Kubernetes | K8s | 1.27+ | Production orchestration (future) |
| Reverse Proxy | Nginx | 1.25+ | API gateway, load balancer |
| CI/CD | GitHub Actions / GitLab CI | Latest | Automated testing & deployment |
| Monitoring | Prometheus | 2.45+ | Metrics collection |
| Visualization | Grafana | 10.0+ | Metrics visualization |
| Log Aggregation | ELK Stack | 8.0+ | Centralized logging (future) |
| IaC | Terraform | 1.5+ | Infrastructure as Code (future) |

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client Layer                                  │
├──────────────────────┬──────────────────────┬────────────────────┤
│  Flutter Mobile App  │  Flutter Mobile App  │  React Admin Web   │
│   (Student)          │   (Teacher)          │   Dashboard        │
└──────────┬───────────┴─────────┬────────────┴────────┬───────────┘
           │                     │                     │
           │      HTTPS/WSS      │                     │
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   Nginx (Reverse Proxy)  │
                    │   Load Balancing         │
                    │   SSL Termination        │
                    └────────────┬─────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
        ┌───────▼────────┐  ┌────▼──────┐  ┌────▼──────────────┐
        │  FastAPI       │  │ WebSocket │  │ Health Check      │
        │  Servers       │  │ Server    │  │ Metrics           │
        │  (replicas)    │  │           │  │ (Prometheus)      │
        └────────┬───────┘  └─────┬─────┘  └───────────────────┘
                 │                │
                 └────────┬───────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼─────┐   ┌──────▼──────┐   ┌─────▼──────┐
   │PostgreSQL│   │   Redis     │   │  Celery   │
   │Database  │   │  (Cache)    │   │  Workers  │
   │Replicas  │   │  (Sessions) │   │           │
   └──────────┘   └─────────────┘   └───────────┘

Optional Future Components:
   │
   ├─ Haskell Geo-fencing Service (Validation)
   ├─ Java Batch Processing Service
   └─ Elasticsearch (Log aggregation)
```

### Data Flow Architecture

```
Student App                          Teacher App
    │                                   │
    ├─ Request Attendance          ─────┤
    │
    ▼
FastAPI Backend
    │
    ├─ Validate JWT Token
    │
    ├─ Fetch Geo-fence Data (Redis)
    │
    ├─ Validate GPS Location (Haversine)
    │
    ├─ Validate QR Code (Current/Previous)
    │
    ├─ Match Access Point (WiFi/BLE)
    │
    ├─ Create Attendance Record (PostgreSQL)
    │
    ├─ Emit Real-time Update (WebSocket)
    │
    └─ Return Response

Background Tasks (Celery)
    │
    ├─ Refresh QR Codes every 25 sec
    │
    ├─ Clean Expired OTPs every 60 sec
    │
    ├─ Sync Attendance Data
    │
    └─ Generate Reports (Async)
```

### Deployment Topology

```
Development Environment:
    Docker Compose (single machine)
    - Backend (1 instance)
    - PostgreSQL
    - Redis
    - Celery Worker

Staging Environment:
    Docker Compose or Mini K8s
    - Backend (2 instances behind nginx)
    - PostgreSQL with backup
    - Redis cluster
    - Celery (2 workers)
    - Monitoring (Prometheus/Grafana)

Production Environment:
    Kubernetes Cluster
    - Backend (3+ replicas, auto-scaling)
    - PostgreSQL (managed, with automated backups)
    - Redis Cluster
    - Celery (auto-scaling)
    - Nginx Ingress
    - Monitoring & Alerting (Prometheus/Grafana)
    - Log Aggregation (ELK)
    - CDN for static assets
```

---

## Development Workflow

### 1. Local Development Setup

**Prerequisites:**
```bash
- Python 3.9+
- Node.js 18+
- Flutter 3.16+
- Docker & Docker Compose
- Git
- PostgreSQL (or via Docker)
- Redis (or via Docker)
```

**Setup Steps:**

```bash
# Clone repository
git clone https://github.com/yourusername/smartattendencesystem.git
cd smartattendencesystem

# Setup environment
cp .env.example .env
# Edit .env with your local settings

# Start services with Docker Compose
docker-compose up -d

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
alembic upgrade head  # Run migrations

# Seed initial data
python seed_data.py

# Start FastAPI server
uvicorn app.main:app --reload

# In another terminal - Celery worker
celery -A app.celery_tasks worker --loglevel=info

# Web dashboard setup
cd ../web
npm install
npm run dev

# Mobile app setup
cd ../mobile
flutter pub get
flutter run
```

### 2. Git Workflow

**Branch Strategy:**
```
main
  ├─ release/v1.0.0 (release branches)
  └─ develop
      ├─ feature/auth-system
      ├─ feature/geo-fencing
      ├─ feature/qr-generation
      ├─ bugfix/token-validation
      └─ hotfix/database-connection
```

**Commit Convention:**
```
feat: Add new feature
fix: Fix bug
docs: Documentation update
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Build/dependency update
ci: CI/CD changes
```

### 3. Code Review Process

1. Create feature branch from `develop`
2. Make commits following convention
3. Push and create Pull Request
4. Automated tests run (GitHub Actions)
5. Code review by team lead
6. Merge to `develop` after approval
7. Deploy to staging automatically
8. Merge to `main` for production release

### 4. Testing Strategy

**Unit Tests:**
- Backend: `pytest` (Python)
- Web: `vitest` (React)
- Mobile: `flutter test`

**Integration Tests:**
- Backend API endpoints with database
- WebSocket communication
- Third-party integrations

**E2E Tests:**
- Complete attendance flow
- Multi-user scenarios
- Mobile app navigation

**Test Coverage Goals:**
- Backend: 80%+
- Frontend: 70%+
- Critical paths: 100%

---

## DevOps & CI/CD

### GitHub Actions Workflows

#### 1. Backend CI/CD Pipeline

**File:** `.github/workflows/backend-ci.yml`

**Stages:**
1. **Trigger:** Push to any branch, PR to develop/main
2. **Build:**
   - Checkout code
   - Set up Python 3.9+
   - Install dependencies
   - Run linting (flake8, black)
   - Run type checking (mypy)

3. **Test:**
   - Run unit tests (pytest)
   - Run integration tests
   - Generate coverage report
   - Upload to Codecov

4. **Quality:**
   - SonarQube scan (optional)
   - Security scanning (Bandit)
   - Dependency vulnerability check

5. **Build Docker Image:**
   - Build container image
   - Push to container registry (Docker Hub / GitHub Container Registry)

6. **Deploy to Staging:**
   - Run migrations
   - Deploy to staging environment
   - Run smoke tests

#### 2. Web CI/CD Pipeline

**File:** `.github/workflows/web-ci.yml`

**Stages:**
1. Build React app with Vite
2. Run ESLint and Prettier checks
3. Run unit tests
4. Build production bundle
5. Upload coverage report
6. Push Docker image
7. Deploy to staging

#### 3. Mobile CI/CD Pipeline

**File:** `.github/workflows/mobile-ci.yml`

**Stages:**
1. Analyze Dart code (dartanalyzer)
2. Run Flutter tests
3. Build APK (Android)
4. Build IPA (iOS) - requires macOS runner
5. Upload artifacts to GitHub Releases
6. Upload to TestFlight (beta testing)

#### 4. Production Deployment

**File:** `.github/workflows/deploy-production.yml`

**Trigger:** Manual or tag-based
1. Wait for manual approval
2. Run final tests
3. Create release notes
4. Deploy to production
5. Smoke tests
6. Rollback on failure

### GitLab CI/CD (Alternative)

**File:** `.gitlab-ci.yml`

Similar pipeline structure but using GitLab runners.

---

## Docker Setup

### Development Environment

**File:** `docker-compose.yml`

```yaml
Services:
  - backend: FastAPI application
  - postgres: PostgreSQL database
  - redis: Redis cache
  - celery_worker: Celery background tasks
  - mailhog: Email testing (catches outgoing emails)

Volumes:
  - postgres_data: Database persistence
  - redis_data: Redis persistence

Networks:
  - smartattendance-net
```

### Production Environment

**File:** `docker-compose.prod.yml`

```yaml
Services:
  - nginx: Reverse proxy (load balancing)
  - backend (replica 1-3): FastAPI instances
  - postgres: Production database (managed service preferred)
  - redis: Redis cluster
  - celery_worker (replica 1-3): Celery workers
  - prometheus: Metrics collection
  - grafana: Metrics visualization

Environment:
  - Separate secrets management
  - Health checks enabled
  - Resource limits configured
  - Restart policies
```

### Dockerfile Strategy

**Backend:** `backend/Dockerfile`
```
Multi-stage build:
  Stage 1: Builder (install dependencies)
  Stage 2: Runtime (minimal image)
  
- Python 3.11 slim base
- Non-root user
- Health check
- Optimized for security & size
```

**Web:** `web/Dockerfile`
```
Multi-stage build:
  Stage 1: Build (Node 18)
  Stage 2: Nginx (serve built files)
  
- Build React app with Vite
- Copy to Nginx
- Gzip compression enabled
```

**Celery Worker:** `backend/celery_worker.Dockerfile`
```
Similar to backend but:
- Optimized for long-running tasks
- Different resource allocation
- Monitoring hooks
```

### Container Registry

**Options:**
1. Docker Hub (public images)
2. GitHub Container Registry (private images)
3. GitLab Container Registry
4. AWS ECR (if hosted on AWS)
5. Private registry (self-hosted)

**Image Naming:**
```
docker.io/yourusername/smart-attendance-backend:v1.0.0
docker.io/yourusername/smart-attendance-web:v1.0.0
ghcr.io/yourusername/smart-attendance-backend:latest
```

---

## Database Design

### Core Tables

**users**
```sql
- id (PK)
- email (UNIQUE)
- username
- password_hash
- role (student, teacher, admin)
- division_id (FK)
- created_at
- updated_at
- is_active
```

**divisions**
```sql
- id (PK)
- name
- description
- college_id (FK)
- created_at
- updated_at
```

**locations**
```sql
- id (PK)
- name
- latitude
- longitude
- radius (meters)
- building
- classroom_number
- created_at
- updated_at
```

**timetables**
```sql
- id (PK)
- division_id (FK)
- location_id (FK)
- teacher_id (FK)
- subject
- day_of_week
- start_time
- end_time
- created_at
- updated_at
```

**attendance_records**
```sql
- id (PK)
- student_id (FK)
- timetable_id (FK)
- location_id (FK)
- timestamp
- latitude
- longitude
- verification_method (QR, OTP, WiFi, Combined)
- qr_code_used
- otp_used
- access_point_matched
- ip_address
- device_id
- created_at
```

**access_points**
```sql
- id (PK)
- location_id (FK)
- bssid (WiFi MAC)
- ssid
- signal_strength
- type (WiFi, Bluetooth)
- created_at
- updated_at
```

**qr_sessions**
```sql
- id (PK)
- location_id (FK)
- current_qr_code
- previous_qr_code
- qr_ttl (time to live in seconds)
- created_at
- updated_at
```

**otp_tokens**
```sql
- id (PK)
- code
- location_id (FK)
- expires_at
- used
- created_at
```

### Indexes for Performance

```sql
- users(email)
- users(division_id)
- timetables(division_id, day_of_week, start_time)
- attendance_records(student_id, created_at)
- attendance_records(location_id, created_at)
- locations(latitude, longitude) - spatial index
```

### Migrations Strategy

Use Alembic for version control:
```
alembic/versions/
  - 001_initial_schema.py
  - 002_add_access_points.py
  - 003_add_indexes.py
  - 004_add_audit_columns.py
```

---

## API Documentation

### OpenAPI/Swagger

**Setup:**
- FastAPI auto-generates OpenAPI schema
- Available at `/docs` (Swagger UI)
- Available at `/redoc` (ReDoc)

**Documentation File:** `docs/API_DOCUMENTATION.md`

### Main API Routes

```
Authentication:
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/logout
  POST   /api/v1/auth/refresh-token
  POST   /api/v1/auth/forgot-password
  POST   /api/v1/auth/reset-password

Users:
  GET    /api/v1/users/me
  PUT    /api/v1/users/me
  GET    /api/v1/users/{id}
  GET    /api/v1/users
  POST   /api/v1/users (admin)
  PUT    /api/v1/users/{id} (admin)
  DELETE /api/v1/users/{id} (admin)

Divisions:
  GET    /api/v1/divisions
  POST   /api/v1/divisions (admin)
  PUT    /api/v1/divisions/{id} (admin)
  DELETE /api/v1/divisions/{id} (admin)
  GET    /api/v1/divisions/{id}/students
  GET    /api/v1/divisions/{id}/timetable

Locations (Geo-fence):
  GET    /api/v1/locations
  POST   /api/v1/locations (admin)
  PUT    /api/v1/locations/{id} (admin)
  DELETE /api/v1/locations/{id} (admin)
  GET    /api/v1/locations/validate-point?lat=X&lon=Y

Timetables:
  GET    /api/v1/timetables
  GET    /api/v1/timetables/my-schedule (student/teacher)
  GET    /api/v1/timetables/today
  POST   /api/v1/timetables (admin)
  PUT    /api/v1/timetables/{id} (admin)
  DELETE /api/v1/timetables/{id} (admin)

Attendance:
  POST   /api/v1/attendance/mark
  GET    /api/v1/attendance/my-records (student)
  GET    /api/v1/attendance/records (teacher/admin)
  GET    /api/v1/attendance/analytics

QR Codes:
  GET    /api/v1/qr/current/{location_id}
  POST   /api/v1/qr/verify

OTP:
  GET    /api/v1/otp/request/{location_id}
  POST   /api/v1/otp/verify

Access Points:
  GET    /api/v1/access-points
  POST   /api/v1/access-points/{location_id} (admin)
  DELETE /api/v1/access-points/{id} (admin)

Reports:
  GET    /api/v1/reports/attendance?division_id=X&date=Y
  GET    /api/v1/reports/student/{student_id}
  GET    /api/v1/reports/export/csv
  GET    /api/v1/reports/export/pdf

WebSocket:
  WS     /ws/attendance/live (real-time updates)
  WS     /ws/notifications (real-time notifications)
```

---

## Security Considerations

### 1. Authentication & Authorization

**Method:** JWT (JSON Web Tokens)

```
- Access Token: 15 minutes expiration
- Refresh Token: 7 days expiration
- Rotate tokens on refresh
- Store refresh token in httpOnly cookie
- Implement token blacklisting for logout
```

**Implementation:**
```python
Dependencies:
  - PyJWT for token generation/validation
  - bcrypt for password hashing
  - python-jose for JWT handling
```

**Roles & Permissions:**
```
Student:
  - View own attendance
  - Mark own attendance
  - View own timetable

Teacher:
  - View division's attendance
  - View live attendance
  - Export reports

Admin:
  - Full system access
  - Manage users, divisions, locations
  - Configure system
```

### 2. Data Protection

**Encryption:**
```
- HTTPS/TLS for all communications
- Database encryption at rest (if using managed DB)
- Sensitive data encryption (passwords, OTPs)
```

**Password Security:**
```
- Minimum 8 characters
- bcrypt hashing with salt rounds: 12
- Password reset via email
- Session timeout: 30 minutes
```

### 3. API Security

**Rate Limiting:**
```
- 100 requests/minute per IP (general)
- 10 requests/minute for login endpoint
- 1000 requests/hour per authenticated user
- Use Redis for rate limit tracking
```

**Input Validation:**
```
- Pydantic schemas for all inputs
- SQLAlchemy ORM to prevent SQL injection
- Sanitize user inputs
- File upload size limits
```

**CORS:**
```
- Allowed origins: specified frontend URLs only
- Allow credentials: true
- Allowed methods: GET, POST, PUT, DELETE
- No wildcard origins in production
```

### 4. Secrets Management

**Environment Variables:**
```
.env file (development only):
  DATABASE_URL
  REDIS_URL
  SECRET_KEY
  JWT_SECRET
  SMTP_PASSWORD
  AWS_ACCESS_KEY (if using AWS)
```

**Production Secrets:**
```
- Docker Secrets (if using Docker Swarm)
- Kubernetes Secrets
- AWS Secrets Manager
- HashiCorp Vault
```

### 5. Location Privacy

**Considerations:**
```
- Collect GPS only during attendance marking
- Delete location data after retention period
- Allow users to review their location history
- Compliance with local privacy laws (GDPR, etc.)
```

### 6. Security Scanning

**Tools:**
```
- Bandit: Python security issues
- Snyk: Dependency vulnerabilities
- OWASP ZAP: API security testing
- SonarQube: Code quality & security
```

---

## Monitoring & Logging

### 1. Application Metrics

**Prometheus Setup:**

```yaml
Metrics to collect:
  - Request count (by endpoint, method, status)
  - Request duration (by endpoint)
  - Active connections
  - Database connection pool usage
  - Redis usage
  - Celery task queue size
  - Error rates
  - Cache hit/miss rates
```

**Python FastAPI Integration:**
```
Library: prometheus-client
- Middleware to track requests automatically
- Custom metrics for business logic
- Export metrics at /metrics endpoint
```

### 2. Centralized Logging

**Development:**
```
- Console output with structured logging
- Log level: DEBUG
- Use Python logging module
```

**Production:**
```
ELK Stack (Elasticsearch, Logstash, Kibana):
  - Elasticsearch: Log storage & indexing
  - Logstash: Log parsing & transformation
  - Kibana: Visualization & search
  
OR

Cloudwatch/CloudLogging (if cloud hosted):
  - Centralized log collection
  - Log analysis & insights
```

**Log Fields:**
```
- timestamp
- level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- logger name
- message
- request_id (correlation ID)
- user_id
- endpoint
- duration_ms
- error_stack_trace (if error)
```

### 3. Alerting

**Prometheus Alert Rules:**

```yaml
Rules to alert on:
  - High error rate (>5%)
  - API latency >1000ms
  - Database connection pool near capacity
  - Redis memory usage >80%
  - Celery queue size >1000
  - Pod crash loops
  - Pod out of memory
```

**Notification Channels:**
```
- Email alerts
- Slack integration
- PagerDuty for critical alerts
- SMS for critical incidents
```

### 4. Health Checks

**Liveness Probe:**
```python
GET /health/live
- Application is running
- Return 200 if OK
```

**Readiness Probe:**
```python
GET /health/ready
- Database connectivity
- Redis connectivity
- All dependencies healthy
- Return 200 if ready to serve traffic
```

### 5. Performance Monitoring

**Key Metrics:**
```
- API response times (p50, p95, p99)
- Database query performance
- Cache hit rates
- Celery task completion times
- Mobile app crash rates
```

**Tools:**
```
- NewRelic
- Datadog
- Grafana (free, self-hosted)
- Sentry (error tracking)
```

---

## Deployment Strategy

### 1. Development Environment

**Local Deployment:**
```bash
docker-compose up -d
```

**Available at:**
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Web Dashboard: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
```

### 2. Staging Environment

**Purpose:** Test all features before production

**Infrastructure:**
```
- 2-3 Backend replicas (load balanced)
- Managed PostgreSQL or dedicated instance
- Redis cache
- Celery workers (2 instances)
- Full monitoring & logging
```

**Deployment Process:**
```
1. Code merged to develop
2. GitHub Actions triggers staging deployment
3. Run database migrations
4. Deploy new containers
5. Run smoke tests
6. Update health checks
7. Notify team of staging update
```

### 3. Production Environment

**Deployment Checklist:**
```
Before Deploy:
  [ ] Code reviewed and merged
  [ ] All tests passing
  [ ] Security scanning passed
  [ ] Staging tested for 24 hours
  [ ] Database backup taken
  [ ] Runbook reviewed
  [ ] Team notified
  [ ] Maintenance window scheduled

Deploy:
  [ ] Stop accepting new requests (graceful shutdown)
  [ ] Run database migrations
  [ ] Deploy new backend version (rolling update)
  [ ] Update frontend assets
  [ ] Verify health checks
  [ ] Run smoke tests
  [ ] Monitor error rates
  [ ] Enable accepting requests

After Deploy:
  [ ] Monitor metrics for 1 hour
  [ ] Check error rates & latency
  [ ] User feedback monitoring
  [ ] Update status page
  [ ] Document deployment
```

### 4. Blue-Green Deployment

**Strategy:**
```
- Maintain two identical production environments (Blue & Green)
- Deploy to inactive environment
- Test thoroughly
- Switch traffic to new environment
- Old environment available for rollback
```

### 5. Canary Deployment

**Strategy:**
```
- Deploy to 5% of production traffic initially
- Monitor error rates & latency
- Gradually increase to 25%, 50%, 100%
- Automatic rollback if errors exceed threshold
```

### 6. Rollback Procedure

**Quick Rollback:**
```bash
# Keep last 3 versions available
docker pull previous-version:tag
docker-compose -f docker-compose.prod.yml up -d
```

**Database Rollback:**
```bash
# Alembic for database version control
alembic downgrade -1
```

---

## Team Collaboration

### 1. Communication

**Tools:**
- Slack for daily communication
- GitHub Issues for task tracking
- Weekly standups
- Code review discussions on PRs

### 2. Code Review Standards

**Checklist:**
```
- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No security issues
- [ ] Performance impact considered
- [ ] Backward compatible
- [ ] Handles edge cases
```

### 3. Documentation Requirements

**For Each Feature:**
```
- API endpoint documentation
- Database schema changes
- Frontend component documentation
- Configuration changes
- Deployment notes
- Breaking changes (if any)
```

### 4. Dependency Management

**Backend (Python):**
```
- Pin major versions in requirements.txt
- Update dependencies monthly
- Test after updates
- Security scanning enabled
```

**Frontend (Node.js):**
```
- package-lock.json always committed
- Automated dependency updates (Dependabot)
- Test before merging
```

**Mobile (Dart/Flutter):**
```
- pubspec.lock always committed
- Major version updates carefully
- Test on real devices
```

### 5. Knowledge Sharing

**Documentation:**
```
- Architecture Decision Records (ADRs)
- Setup guides for new developers
- Common troubleshooting guide
- API documentation
- Database schema documentation
```

**Onboarding:**
```
- 1-hour architecture overview
- Local development setup (30 mins)
- Running tests & building locally
- GitHub workflow tutorial
- Debugging techniques
```

---

## Environment Configuration

### Development (.env)

```env
# Server
DEBUG=true
LOG_LEVEL=DEBUG
API_HOST=localhost
API_PORT=8000
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smartattendance_dev
DATABASE_POOL_SIZE=5

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-for-jwt
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Email (Mailhog for testing)
SMTP_SERVER=mailhog
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Geo-fencing
GEO_FENCE_RADIUS_METERS=50

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# QR Code
QR_REFRESH_INTERVAL_SECONDS=25
OTP_EXPIRATION_SECONDS=60
```

### Production (.env.prod)

```env
# Server
DEBUG=false
LOG_LEVEL=INFO
API_HOST=api.yourdomain.com
API_PORT=8000
ENVIRONMENT=production

# Database
DATABASE_URL=postgresql://prod_user:secure_password@prod-db.service:5432/smartattendance
DATABASE_POOL_SIZE=20
DATABASE_SSL=true

# Redis
REDIS_URL=redis://redis-cluster:6379/0

# JWT
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_MINUTES=10080
JWT_ALGORITHM=HS256
JWT_SECRET=Tuzy$Layki@Nahi!Bhava



# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password

# Celery
CELERY_BROKER_URL=redis://redis-cluster:6379/1
CELERY_RESULT_BACKEND=redis://redis-cluster:6379/2

# Geo-fencing
GEO_FENCE_RADIUS_METERS=50

# CORS
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn

# QR Code
QR_REFRESH_INTERVAL_SECONDS=25
OTP_EXPIRATION_SECONDS=60
```

---

## Maintenance & Operations

### 1. Database Backups

**Strategy:**
```
- Automated daily backups
- Store in separate location (AWS S3, Google Cloud Storage)
- Weekly off-site backups
- Test restore procedure quarterly
- Retention: 30 days for daily, 1 year for monthly
```

### 2. Log Rotation

```
- Daily log rotation
- Compress logs older than 7 days
- Archive to long-term storage after 30 days
- Retention: 6 months for compliance
```

### 3. Performance Optimization

**Regular Tasks:**
```
- Analyze slow queries monthly
- Optimize database indexes
- Review Redis memory usage
- Check API response times
- Monitor celery queue sizes
```

### 4. Security Audits

```
- Monthly dependency vulnerability scan
- Quarterly code security review
- Annual penetration testing
- Review access logs for suspicious activity
```

### 5. Capacity Planning

```
- Monitor database growth rate
- Track API traffic trends
- Plan for storage scaling
- Estimate bandwidth requirements
- Plan infrastructure expansion
```

---

## Success Metrics

### Technical Metrics

```
- API availability: 99.9%+
- API response time (p95): <500ms
- Error rate: <0.5%
- Test coverage: 80%+
- Database query performance
- Cache hit rate: >80%
```

### Functional Metrics

```
- Attendance marking success rate: 99%+
- Geo-fence accuracy: 95%+
- QR code generation reliability: 100%
- User adoption rate
- Daily active users
```

### Operational Metrics

```
- Mean time to recovery (MTTR): <5 minutes
- Mean time between failures (MTBF): >7 days
- Deployment frequency: 2-3 per week
- Change failure rate: <15%
- Incident response time: <15 minutes
```

---

## Development Roadmap & Phase Breakdown

### Phase 1: Database Layer ✅ COMPLETE (Jan 17, 2026)

**Completed Deliverables:**
- ✅ 11 SQLAlchemy ORM models with proper relationships
- ✅ Supabase PostgreSQL database connectivity
- ✅ Enum types: UserRole, EnrollmentStatus, EnrollmentYear, etc.
- ✅ Seed data script with realistic sample data
- ✅ Database verification and testing
- ✅ Import path fixes and standardization

**Time Invested:** Phase 1 Complete
**Status:** All models tested and verified with Supabase

---

## Phase 2: Pydantic Schemas - Completion Report

### ✅ Schemas Implemented & Validated

| Schema Module | Status | Classes | Purpose |
|---------------|--------|---------|---------|
| `user.py` | ✅ Complete | UserBase, UserCreate, UserUpdate, UserOut | User authentication & profile |
| `enrollment.py` | ✅ Complete | EnrollmentBase, EnrollmentCreate, EnrollmentUpdate, EnrollmentOut | Student enrollment tracking |
| `timetable.py` | ✅ Complete | TimeTableBase, TimeTableCreate, TimeTableUpdate, TimeTableOut | Class schedule management |
| `attendance_records.py` | ✅ Complete | AttendanceRecordBase, AttendanceRecordCreate, AttendanceRecordUpdate, AttendanceRecordOut | Attendance marking |
| `locations.py` | ✅ Complete | LocationBase, LocationCreate, LocationUpdate, LocationOut | Geo-fence locations |
| `courses.py` | ✅ Complete | CourseBase, CourseCreate, CourseUpdate, CourseOut | Degree programs |
| `branches.py` | ✅ Complete | BranchBase, BranchCreate, BranchUpdate, BranchOut | Engineering branches |
| `divisions.py` | ✅ Complete | DivisionBase, DivisionCreate, DivisionUpdate, DivisionOut | Class sections |
| `batches.py` | ✅ Complete | BatchBase, BatchCreate, BatchUpdate, BatchOut | Lab batches |
| `qr_code.py` | ✅ Complete | QRCodeBase, QRCodeCreate, QRCodeOut | Dynamic QR codes |
| `otp_code.py` | ✅ Complete | OTPCodeBase, OTPCodeCreate, OTPCodeOut | OTP tokens |

### ✅ Schema Features Implemented

- **Request/Response Pattern**: Base, Create, Update, Out for all entities
- **Type Safety**: EmailStr, date, datetime, time types with proper validation
- **Enum Integration**: Reused ORM enums (UserRole, EnrollmentStatus, etc.)
- **Serialization**: `from_attributes=True` for ORM → Pydantic conversion
- **Validation**: `extra="ignore"` prevents over-posting attacks
- **Optional Fields**: Proper use of Optional with default values

### ✅ Schema Corrections Applied

Fixed 40+ issues across all schema files:
- Type mismatches (str vs int, date vs int, datetime vs time)
- Typos (divison→division, divice→device, logitude→longitude, collage→college)
- Missing imports (date, datetime)
- Syntax errors (`:` vs `=` in type hints)
- ConfigDict errors (missing `extra=`, typo `from_attribute`)
- Missing `= None` on Optional fields
- Removed auto-generated fields from Create schemas

### 📊 Schema Validation

```
✅ All 11 schema modules: IMPORTED SUCCESSFULLY
✅ User schemas: VALIDATED
✅ Enrollment schemas: VALIDATED
✅ Timetable schemas: VALIDATED
✅ Attendance schemas: VALIDATED
✅ Location schemas: VALIDATED
✅ Course schemas: VALIDATED
✅ Branch schemas: VALIDATED
✅ Division schemas: VALIDATED
✅ Batch schemas: VALIDATED
✅ QRCode schemas: VALIDATED✅ COMPLETE (Jan 18, 2026)

**Completed Deliverables:**
- ✅ All 11 Pydantic schema modules created
- ✅ User, Enrollment, Timetable, Attendance, Location schemas
- ✅ Course, Branch, Division, Batch schemas
- ✅ QRCode and OTPCode schemas
- ✅ Request/response validation patterns (Base, Create, Update, Out)
- ✅ Type safety with EmailStr, date, datetime, enums
- ✅ All 40+ schema issues corrected and validated
- ✅ Import testing successful

**Time Invested:** Phase 2 Complete
**Status:** All schemas validated and ready for API integration

---

### Phase 3: Alembic Migrations (NEXTrrors)

**Dependencies:** Phase 1 (Complete)

---

### Phase 3: Authentication & Security (Days 3-4)

**Target Duration:** 2 days

**Deliverables:**
- [ ] JWT token generation and verification
- [ ] Password hashing (bcrypt)
- [ ] Authentication endpoints (login, register, refresh)
- [ ] User roles and permission checks
- [ ] Auth middleware integration
- [ ] Login functionality testing

**Files to Create:**
- `app/api/auth.py` - Auth endpoints
- `app/services/auth_service.py` - Auth business logic
- `app/utils/jwt_utils.py` - JWT utilities
- `app/middleware/auth_middleware.py` - Auth verification

**API Endpoints:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/me` - Current user profile

**Dependencies:** Phase 1, 2 (Pydantic schemas)

---

### Phase 4: Core API Endpoints (Days 5-7)

**Target Duration:** 3 days

**Deliverables:**
- [ ] User management endpoints (CRUD)
- [ ] Enrollment management endpoints
- [ ] Timetable query endpoints
- [ ] Location management endpoints
- [ ] Batch management endpoints
- [ ] Basic attendance endpoints

**Files to Create:**
- `app/api/users.py` - User endpoints
- `app/api/enrollments.py` - Enrollment endpoints
- `app/api/timetables.py` - Timetable endpoints
- `app/api/locations.py` - Location endpoints
- `app/api/batches.py` - Batch endpoints

**API Endpoints (Sample):**
- `GET/POST /api/v1/users` - User list/create
- `GET/PUT /api/v1/users/{id}` - User details/update
- `GET /api/v1/enrollments/{user_id}` - User enrollment
- `GET /api/v1/timetables/division/{div_id}` - Timetable query
- `GET /api/v1/locations` - All locations

**Dependencies:** Phase 1, 2, 3

---

### Phase 5: Attendance & QR/OTP Endpoints (Days 8-9)

**Target Duration:** 2 days

**Deliverables:**
- [ ] Attendance marking endpoints
- [ ] QR code generation/verification
- [ ] OTP generation/verification
- [ ] Geo-fencing validation
- [ ] Device info collection
- [ ] Attendance history queries

**Files to Create:**
- `app/api/attendance.py` - Attendance endpoints
- `app/api/qr_codes.py` - QR code endpoints
- `app/api/otp_codes.py` - OTP endpoints
- `app/services/attendance_service.py` - Attendance logic
- `app/services/geofence_service.py` - Geo-fencing validation

**API Endpoints:**
- `POST /api/v1/attendance/mark` - Mark attendance
- `GET /api/v1/qr-code/current/{timetable_id}` - Get current QR
- `POST /api/v1/attendance/verify-qr` - Verify QR code
- `POST /api/v1/attendance/verify-otp` - Verify OTP
- `GET /api/v1/attendance/history/{user_id}` - Attendance history

**Dependencies:** Phase 1, 2, 3, 4

---

### Phase 6: Background Tasks & Real-time Services (Days 10-11)

**Target Duration:** 2 days

**Deliverables:**
- [ ] Celery setup and configuration
- [ ] QR code refresh task (25-second interval)
- [ ] OTP generation task (60-second interval)
- [ ] WebSocket real-time updates
- [ ] Attendance sync tasks
- [ ] Report generation tasks

**Files to Create:**
- `app/celery_tasks/qr_refresh_task.py` - QR refresh
- `app/celery_tasks/otp_cleanup_task.py` - OTP cleanup
- `app/celery_tasks/attendance_sync_task.py` - Sync tasks
- `app/websocket/attendance_ws.py` - WebSocket handler
- `app/celery_worker.Dockerfile` - Celery container

**Features:**
- QR codes refresh every 25 seconds automatically
- OTP codes refresh every 60 seconds
- Real-time attendance updates via WebSocket
- Background job monitoring

**Dependencies:** Phase 1, 2, 3, 4, 5

---

### Phase 7: Reports & Admin Dashboard APIs (Days 12-13)

**Target Duration:** 2 days

**Deliverables:**
- [ ] Attendance report generation
- [ ] Division-wise attendance analytics
- [ ] Monthly/weekly reports
- [ ] Teacher dashboard APIs
- [ ] Admin management endpoints
- [ ] Batch assignment endpoints

**Files to Create:**
- `app/api/reports.py` - Report endpoints
- `app/api/admin.py` - Admin endpoints
- `app/services/reports_service.py` - Report generation
- `app/celery_tasks/reports_task.py` - Report scheduling

**API Endpoints:**
- `GET /api/v1/reports/attendance/{division_id}` - Division report
- `GET /api/v1/reports/monthly/{user_id}` - Monthly report
- `GET /api/v1/admin/divisions` - Manage divisions
- `GET /api/v1/admin/batch-assignments` - View assignments

**Dependencies:** Phase 1-6

---

### Phase 8: Mobile & Web Frontends (Parallel - Weeks 3-4)

**Dart/Flutter Mobile App:**
- Student attendance marking interface
- QR code scanning
- GPS location verification
- Real-time notifications

**React Admin Dashboard:**
- Timetable management
- Batch assignments
- Attendance reports
- User management

**Dependencies:** All backend APIs (Phases 1-7)

---

### Phase 9: Java Microservices (Parallel - Week 4)

**Spring Boot Services:**
- High-performance attendance validation
- Access point matching
- Batch report generation
- Kafka event streaming

**Dependencies:** All backend APIs, message queues setup

---

### Phase 10: Haskell Validation Engine (Parallel - Week 4)

**Servant Web Framework:**
- Pure functional geo-fencing calculations
- Type-safe validation rules
- Mathematical precision for location algorithms

**Dependencies:** All backend APIs, integration setup

---

### Deployment & DevOps (Week 5)

**Deliverables:**
- [ ] Docker containerization
- [ ] Docker Compose setup
- [ ] GitHub Actions CI/CD pipeline
- [ ] Supabase production setup
- [ ] Production deployment
- [ ] Monitoring and logging

**Timeline Summary:**
```
Phase 1 (Database):     ✅ Complete
Phase 2 (Schemas):      📅 Next
Phase 3 (Auth):         📅 Days 3-4
Phase 4 (API):          📅 Days 5-7
Phase 5 (Attendance):   📅 Days 8-9
Phase 6 (Tasks/RT):     📅 Days 10-11
Phase 7 (Reports):      📅 Days 12-13
Phase 8 (Frontends):    📅 Weeks 3-4 (Parallel)
Phase 9 (Java):         📅 Week 4  (Jan 17)
Phase 2 (Schemas):      ✅ Complete (Jan 18)
Phase 3 (Alembic):      📅 Next
Phase 4 (Auth):         📅 Days 3-4
Phase 5 (API):          📅 Days 5-7
Phase 6 (Attendance):   📅 Days 8-9
Phase 7 (Tasks/RT):     📅 Days 10-11
Phase 8 (Reports):      📅 Days 12-13
Phase 9 (Frontends):    📅 Weeks 3-4 (Parallel)
Phase 10 (Java):        📅 Week 4 (Parallel)
Phase 11usion

This structure provides:

✅ **Scalability** - Horizontal scaling ready
✅ **Maintainability** - Clear separation of concerns
✅ **Security** - Multiple layers of security
✅ **Reliability** - Health checks, monitoring, logging
✅ **Automation** - CI/CD pipelines
✅ **Team Collaboration** - Clear processes & standards
✅ **Industry Standards** - Best practices applied

---

**Next Steps:**

1. ✅ **Phase 2 Complete** - Pydantic schemas all created and validated
3. **Start Phase 3** - Setup Alembic for database migrations
4. **Phase 4** - Implement authentication with JWT
5. **Phase 5** - Build core API endpoints
6. **Phase 6** - Implement attendance marking and QR/OTP verification
7. **Phase 7** - Setup Celery for background tasks and WebSocket for real-time updates
8. **Phase 8** - Create reports and admin dashboard APIs
9. **Parallel Phases 9-11** - Develop frontends (Dart/Flutter, React) and microservices (Java, Haskell)
10. **Phase 12** - DevOps, containerization, and production deployment

**Current Status:** Ready to begin Phase 3 - Alembic Migration
**Current Status:** Ready to begin Phase 2 - Pydantic Schemas

Good luck building your smart attendance system! 🚀
