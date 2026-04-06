# Smart Attendance System - Complete Use Case Guide

This guide provides step-by-step instructions to start the complete Smart Attendance System and demonstrates login workflows for both **students** and **admin users**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Architecture](#system-architecture)
3. [Quick Start - All Services](#quick-start---all-services)
4. [Manual Setup - Detailed Steps](#manual-setup---detailed-steps)
5. [Use Case 1: Student Login & Attendance](#use-case-1-student-login--attendance)
6. [Use Case 2: Admin Login & Management](#use-case-2-admin-login--management)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ and **npm** (for frontend)
- **Python** 3.12+ (for backend)
- **PostgreSQL** 15+ (or Docker to run database container)
- **Docker** & **Docker Compose** (optional, for containerized setup)
- **Git** (for version control)

### Check Installation

```bash
# Check Node.js version
node --version    # Should be v18+

# Check Python version
python --version  # Should be 3.12+

# Check PostgreSQL (if installed locally)
psql --version

# Check Docker
docker --version
docker-compose --version
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
├──────────────────────┬──────────────────────────────────┤
│   Web Frontend       │   Mobile App (Flutter)           │
│   (React + Vite)     │   (Dart)                         │
│   Port: 5173         │   Port: varies (emulator/device) │
└──────────────┬───────┴──────────────────┬───────────────┘
               │                          │
               └──────────────┬───────────┘
                              │
                    HTTP/REST API Calls
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│               Backend API Layer (FastAPI)               │
│           Port: 8000 | http://localhost:8000            │
├─────────────────────────────────────────────────────────┤
│  - Authentication (JWT)                                 │
│  - User Management (Students, Teachers, Admins)         │
│  - Attendance Tracking                                  │
│  - QR Code Generation                                   │
│  - OTP Verification                                     │
│  - Timetable Management                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ SQL Queries
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Database Layer (PostgreSQL)                │
│         Port: 5432 | smartattendance_db                 │
├─────────────────────────────────────────────────────────┤
│  - Users (Students, Teachers, Admins)                   │
│  - Attendance Records                                   │
│  - Timetables & Courses                                 │
│  - QR Codes & OTP Codes                                 │
│  - Audit Logs                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start - All Services

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd smart-attendece-system

# Start all services (Backend + Frontend + Database)
make dev

# OR manually:
docker-compose -f docker-compose.dev.yml up --build

# Services will be available at:
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
# - Web Frontend: http://localhost:5173
# - Database: localhost:5432
```

**Wait for all 3 services to be healthy:**
- ✅ Database (PostgreSQL) - ready
- ✅ Backend (FastAPI) - running
- ✅ Web (React) - compiled

### Option 2: Running Services Individually (Detailed Control)

Follow the [Manual Setup](#manual-setup---detailed-steps) section below.

---

## Manual Setup - Detailed Steps

### Step 1: Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Run PostgreSQL in Docker
docker run -d \
  --name smartattendance_db \
  -e POSTGRES_USER=smartattendance_user \
  -e POSTGRES_PASSWORD=smartattendance_pass \
  -e POSTGRES_DB=smartattendance \
  -p 5432:5432 \
  postgres:15-alpine

# Verify database is running
docker ps | grep smartattendance_db
```

#### Option B: Using Local PostgreSQL

```bash
# Create database and user
psql -U postgres

# In PostgreSQL CLI:
CREATE USER smartattendance_user WITH PASSWORD 'smartattendance_pass';
CREATE DATABASE smartattendance OWNER smartattendance_user;
GRANT ALL PRIVILEGES ON DATABASE smartattendance TO smartattendance_user;
\q
```

---

### Step 2: Backend API Setup

```bash
# Navigate to backend directory
cd backend-python

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate

# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Edit .env file with your database credentials:
# DATABASE_URL=postgresql://smartattendance_user:smartattendance_pass@localhost:5432/smartattendance
# SECRET_KEY=your-secret-key-here
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30
# REFRESH_TOKEN_EXPIRE_DAYS=7

# Run database migrations
alembic upgrade head

# Seed initial data (users, courses, branches, divisions, etc.)
python app/seed_data.py

# Start the backend server
python run.py

# Backend API will be available at: http://localhost:8000
# API Documentation: http://localhost:8000/docs (Swagger UI)
# Alternative docs: http://localhost:8000/redoc (ReDoc)
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

---

### Step 3: Frontend Setup

```bash
# Navigate to web directory (in a new terminal)
cd web

# Install Node dependencies
npm install

# Start development server
npm run dev

# Frontend will be available at: http://localhost:5173
```

**Expected Output:**
```
  VITE v4.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

### Step 4: Verify All Services

```bash
# Check backend health
curl http://localhost:8000/health

# Expected Response:
# {"status":"ok","message":"Server is running","timestamp":"2024-XX-XX..."}

# Check API documentation
# Open browser: http://localhost:8000/docs

# Check frontend
# Open browser: http://localhost:5173
```

---

## Use Case 1: Student Login & Attendance

### Login Credentials

| Field | Value |
|-------|-------|
| **Email** | `student1@smartattendance.com` |
| **Password** | `student123` |

*Alternative student accounts:*
- `student2@smartattendance.com` / `student123` (Neha Verma)
- `student3@smartattendance.com` / `student123` (Rohan Patel)

---

### Step-by-Step Workflow

#### 1. Access the Application

```
1. Open Web Browser
2. Navigate to: http://localhost:5173
3. You should see the Smart Attendance System login page
```

#### 2. Student Login

```
1. In the "Email" field, enter: student1@smartattendance.com
2. In the "Password" field, enter: student123
3. Click "Login" button
4. Wait for authentication and redirection

✓ Success: You'll see the Student Dashboard
✗ Error: Check backend logs for issues
```

#### 3. Student Dashboard Features

Once logged in, students can access:

```
📊 Dashboard
  └─ Attendance Summary
     - Current attendance percentage
     - Lectures attended
     - Lectures missed
     - Upcoming classes

📋 My Timetable
  └─ View scheduled classes
     - Course name
     - Division
     - Time and location
     - Instructor details

📍 Mark Attendance
  └─ Methods to mark attendance:
     1. QR Code Scanning
        - Use camera to scan QR code displayed in classroom
        - Automatically records attendance
     
     2. OTP Verification
        - Enter OTP provided by instructor
        - Authenticates location and time

📈 Attendance Report
  └─ View detailed attendance history
     - Dates and times marked
     - Class details
     - Monthly summaries

👤 Profile
  └─ View and edit personal information
     - Name
     - Email
     - Phone
     - Profile picture
```

#### 4. Example Student Workflow

**Scenario:** Student marks attendance for a class using QR Code

```
1. Go to Dashboard
   └─ See upcoming classes in "Today's Schedule"

2. Go to Mark Attendance
   └─ Click on a class or course

3. Scan QR Code
   └─ Camera opens
   └─ QR code appears on classroom screen
   └─ Student scans with mobile camera
   └─ Toast notification: "✓ Attendance Marked Successfully"

4. View Attendance Report
   └─ Go to "Attendance Report"
   └─ See marked attendance with timestamp
   └─ Current attendance percentage: 85%
```

**Scenario:** Student marks attendance using OTP

```
1. Go to Mark Attendance
   └─ View list of active classes

2. Select OTP Method
   └─ Enter OTP provided by teacher (e.g., "A7K9")
   └─ Toast notification: "✓ OTP Verified, Attendance Recorded"

3. Check attendance immediately
   └─ Attendance appears in report within seconds
```

---

## Use Case 2: Admin Login & Management

### Login Credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@smartattendance.com` |
| **Password** | `admin123` |

---

### Step-by-Step Workflow

#### 1. Access the Admin Dashboard

```
1. Open Web Browser
2. Navigate to: http://localhost:5173/admin (or /login and select admin role)
3. You should see the Admin Login page
```

#### 2. Admin Login

```
1. In the "Email" field, enter: admin@smartattendance.com
2. In the "Password" field, enter: admin123
3. Click "Login" button
4. Wait for authentication

✓ Success: Admin Dashboard with full management features
✗ Error: Check backend logs, verify admin account exists
```

#### 3. Admin Dashboard Overview

```
🏠 Dashboard
  └─ Key Metrics
     - Total Students: 3
     - Total Teachers: 2
     - Today's Classes: X
     - Average Attendance: XX%
  
  └─ Charts & Analytics
     - Attendance trends (weekly/monthly)
     - Class-wise attendance
     - Student-wise attendance
     - Top performing divisions
```

#### 4. User Management

**Create a New Teacher Account:**

```
1. Click "Users" in sidebar
2. Click "Add User" button
3. Fill in the form:
   Email: teacher3@smartattendance.com
   Username: teacher3
   Password: SecurePass123
   First Name: Vikram
   Last Name: Dubey
   Phone: 9876543223
   Role: Teacher
   Active: Yes

4. Click "Save"
   └─ Toast: "✓ User created successfully"
   └─ New teacher appears in users list
```

**Edit User Details:**

```
1. In Users list, find a user (e.g., "Student1")
2. Click "Edit" button
3. Modify fields as needed
4. Click "Save Changes"
   └─ Toast: "✓ User updated successfully"
```

**Deactivate/Delete User:**

```
1. In Users list, find a user
2. Click "Delete" or "Deactivate" button
3. Confirm in dialog
   └─ User status changes to inactive
```

---

#### 5. Course & Academic Structure Management

**Manage Courses:**

```
1. Click "Courses" in sidebar
2. View all courses:
   - Bachelor of Engineering (BE)
   - Master of Engineering (ME)

3. Add New Course:
   - Click "Add Course"
   - Enter details (name, code, duration, semesters)
   - Click "Save"

4. Edit/Delete courses as needed
```

**Manage Branches:**

```
1. Click "Branches" in sidebar
2. View all branches by course:
   BE:
   ├─ Computer Engineering (COMP)
   ├─ Information Technology (IT)
   └─ Mechanical Engineering (MECH)

3. Add branch to IT course:
   - Select "IT" course
   - Click "Add Branch"
   - Enter: Name: "Electronics Engineering", Code: "ELEC"
   - Confirm

4. Edit/Delete branches as needed
```

**Manage Divisions:**

```
1. Click "Divisions" in sidebar
2. View divisions by branch and year:
   IT > Year 2 > Semester 4:
   ├─ Division A
   └─ Division B

3. Create new division:
   - Select "IT" course
   - Select Year: 2, Semester: 4
   - Enter Division: "C"
   - Set batch size: 60 students
   - Click "Save"
```

---

#### 6. Timetable Management

**Create a Class Schedule:**

```
1. Click "Timetables" in sidebar
2. Click "Add Timetable"
3. Fill in details:
   Course: IT
   Branch: IT
   Division: A
   Year: 2
   Semester: 4
   Course Code: cs201
   Subject: Data Structures
   Day: Monday
   Start Time: 09:00 AM
   End Time: 10:30 AM
   Lecture Type: Lecture
   Room: Lab-101
   Teacher: Rajesh Kumar

4. Click "Save"
   └─ Toast: "✓ Timetable entry created"
   └─ Class scheduled for students

5. Add more entries for other days/times
```

**View Class Schedule:**

```
1. In Timetables list, search by division or day
2. See full week schedule
3. Edit or delete classes as needed
```

---

#### 7. Location & Geofence Management

**Configure Classroom Location:**

```
1. Click "Locations" in sidebar
2. Click "Add Location"
3. Enter details:
   Building: "Main Building"
   Floor: "2"
   Room Name: "Lab-101"
   Room Type: "Lab"
   Latitude: 28.5355
   Longitude: 77.3910
   Geofence Radius: 50 (meters)

4. Click "Save Location"
   └─ Location pinned on map
   └─ Geofence radius shown as circle
```

**Set Up Attendance Verification Point:**

```
1. Click "Access Points" in sidebar
2. Click "Add Access Point"
3. Configure:
   Name: "Main Gate"
   Location: Select from dropdown
   Verification Method: Geolocation
   QR Code: Auto-generated (or upload custom)
   Active: Yes

4. Click "Save"
   └─ QR code available for scanning
   └─ Geofence active for location-based attendance
```

---

#### 8. Attendance Monitoring & Reports

**View Class Attendance Report:**

```
1. Click "Reports" in sidebar
2. Click "Class Report"
3. Filter by:
   - Course: IT
   - Division: A
   - Date Range: Last 7 days

4. View results:
   ┌──────────────────────────────────────────┐
   │ Date     │ Class           │ Attendance  │
   ├──────────────────────────────────────────┤
   │ 2024-XX-XX │ Data Structures │ 45/60 (75%)│
   │ 2024-XX-XX │ Database Design │ 50/60 (83%)│
   └──────────────────────────────────────────┘

5. Click on a row to see individual student attendance
```

**View Student Attendance Report:**

```
1. Click "Reports" in sidebar
2. Click "Student Report"
3. Select student: "Aditya Singh" (student1@smartattendance.com)
4. View attendance details:
   - Total Lectures: 20
   - Present: 17
   - Absent: 3
   - Attendance %: 85%
   
5. Download as PDF/Excel for records
```

**Generate Analytics:**

```
1. Click "Analytics" in sidebar
2. View charts:
   - Overall attendance trends
   - Division-wise comparison
   - Subject-wise attendance
   - Monthly performance

3. Filter by:
   - Date range
   - Course/Branch/Division
   - Teacher
   
4. Export data for reports
```

---

#### 9. Settings & Profile

**Admin Profile:**

```
1. Click "Profile" in sidebar (or top-right menu)
2. View personal details:
   Name: Admin User
   Email: admin@smartattendance.com
   Phone: 9999999999
   
3. Edit profile:
   - Click "Edit Profile"
   - Change name, phone, or password
   - Click "Save"
```

**System Settings:**

```
1. Click "Settings" in sidebar
2. Configure:
   - Access token expiry time
   - Refresh token validity
   - OTP validity duration
   - Geofence radius for all locations
   - Allowed origins for API
   
3. Save changes
```

---

## Troubleshooting

### Backend Won't Start

**Problem:** Backend crashes or won't connect to database

```bash
# 1. Check if database is running
docker ps | grep smartattendance_db

# 2. Check database logs
docker logs smartattendance_db

# 3. Verify database credentials in .env
cat backend-python/.env

# 4. Test database connection
psql -U smartattendance_user -d smartattendance -h localhost

# 5. Run migrations
cd backend-python
alembic upgrade head

# 6. Restart backend
python run.py
```

### Frontend Won't Load

**Problem:** Cannot access http://localhost:5173

```bash
# 1. Check if Node is installed
node --version

# 2. Check if npm dependencies are installed
cd web
npm list

# 3. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Start dev server
npm run dev

# 5. Check firewall/port availability
netstat -an | grep 5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows
```

### Login Fails

**Problem:** Can't login with provided credentials

```bash
# 1. Check backend logs
# Look for auth-related errors

# 2. Verify database has seeded data
cd backend-python
python -c "
from sqlalchemy import create_engine
engine = create_engine('postgresql://smartattendance_user:smartattendance_pass@localhost:5432/smartattendance')
with engine.connect() as conn:
    result = conn.execute('SELECT COUNT(*) FROM users')
    print(f'Users in database: {result.fetchone()[0]}')
"

# 3. Re-seed data if needed
python app/seed_data.py

# 4. Check JWT secret key is set correctly
grep SECRET_KEY backend-python/.env
```

### Can't Mark Attendance

**Problem:** QR code scanning or OTP entry fails

```bash
# 1. Verify timetables exist
# Check via Admin > Timetables

# 2. Verify student is enrolled
# Check via Admin > Users > Select Student

# 3. Check backend logs for errors
# Look for attendance service logs

# 4. Verify location/geofence is configured
# Admin > Locations > Check geofence radius

# 5. Restart backend and try again
```

### API Documentation Not Accessible

**Problem:** http://localhost:8000/docs returns 404

```bash
# 1. Check backend is running
curl http://localhost:8000/health

# 2. Check FastAPI app is configured correctly
# In backend-python/app/main.py, ensure:
# - app = FastAPI()
# - All routes registered
# - OpenAPI docs enabled (default: True)

# 3. Try alternative docs
curl http://localhost:8000/redoc

# 4. Restart backend
python run.py
```

---

## Quick Reference: Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Web Frontend | `http://localhost:5173` | Student/Admin portal |
| Backend API | `http://localhost:8000` | REST API server |
| API Docs (Swagger) | `http://localhost:8000/docs` | Interactive API documentation |
| API Docs (ReDoc) | `http://localhost:8000/redoc` | Alternative API documentation |
| Database | `localhost:5432` | PostgreSQL database |
| Health Check | `http://localhost:8000/health` | Server status |

---

## Summary

✅ **Complete workflow:**
1. Start database (Docker or local PostgreSQL)
2. Start backend API (Python/FastAPI)
3. Start frontend (React/Vite)
4. Login as student or admin
5. Perform respective operations

✅ **Student workflow:** Login → View timetable → Mark attendance (QR/OTP) → Check report

✅ **Admin workflow:** Login → Manage users/courses → Create timetables → Monitor attendance → Generate reports

For more details, see individual service READMEs in `backend-python/`, `web/`, and `mobile/` directories.
