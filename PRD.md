# Smart Attendance System
# Product Requirements Document (PRD)

**Version:** 2.0.0  
**Status:** Production-Ready  
**Date:** March 25, 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Product Vision](#4-product-vision)
5. [Core Features](#5-core-features)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [User Flows](#7-user-flows)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Success Metrics](#9-success-metrics)

---

## 1. Introduction

### 1.1 Product Overview

The **Smart Attendance System** is a comprehensive multi-platform attendance tracking solution designed for educational institutions. It leverages modern technologies including QR codes, OTPs (One-Time Passwords), GPS geofencing, and WiFi/BSSID verification to automate and secure the student attendance tracking process.

### 1.2 Product Goals

| Goal | Description |
|------|-------------|
| **Automate Attendance** | Eliminate manual paper-based attendance tracking |
| **Prevent Proxy Attendance** | Use multi-factor verification (QR + OTP + GPS + WiFi) |
| **Real-Time Visibility** | Enable teachers to see attendance as it happens |
| **Comprehensive Analytics** | Provide detailed reports and exportable data |
| **Multi-Platform Support** | Serve users via Web Dashboard, Mobile App |

### 1.3 Technology Stack

| Platform | Technology |
|----------|------------|
| **Backend API** | Python 3.12, FastAPI, SQLAlchemy, Alembic |
| **Database** | PostgreSQL 15 |
| **Web Dashboard** | React 18, Vite, Zustand, TanStack Query |
| **Mobile App** | Flutter 3, Dart, Dio |
| **Infrastructure** | Docker Compose, Nginx |

---

## 2. Problem Statement

Educational institutions face significant challenges with traditional attendance methods:

| Problem | Impact |
|---------|--------|
| **Manual Tracking** | Time-consuming, error-prone, and inefficient |
| **Proxy Attendance** | Students mark attendance for absent peers |
| **No Real-Time Data** | Teachers cannot monitor attendance during class |
| **Limited Reporting** | Manual compilation of attendance reports |
| **Lack of Verification** | No mechanism to verify student location |

---

## 3. Target Users

### 3.1 User Personas

| Role | Description | Key Responsibilities |
|------|-------------|---------------------|
| **Admin** | System Administrator | Full system access, user management, configuration |
| **Teacher** | Course Instructor | Manage sessions, generate codes, view attendance |
| **Student** | Enrolled Student | Mark attendance, view personal history |

### 3.2 User Demographics

- **Primary:** Universities, colleges, and educational institutions
- **Secondary:** Training centers, corporate training programs
- **User Count:** Scalable from small (50 users) to large (10,000+ users)

---

## 4. Product Vision

To be the most comprehensive and secure attendance management solution for educational institutions, providing:

- **Multi-factor verification** combining QR, OTP, GPS, and WiFi
- **Real-time updates** via WebSockets
- **Comprehensive reporting** with export capabilities
- **Seamless multi-platform experience** (Web + Mobile)

---

## 5. Core Features

### 5.1 Authentication & Authorization

| Feature | Description | Status |
|---------|-------------|--------|
| **JWT Authentication** | Access + Refresh token mechanism | ✅ Implemented |
| **Role-Based Access Control** | Admin, Teacher, Student roles | ✅ Implemented |
| **Password Reset Flow** | Token-based password recovery | ✅ Implemented |
| **Token Refresh** | Automatic token renewal | ✅ Implemented |
| **Login/Logout** | Session management | ✅ Implemented |

### 5.2 Attendance Methods

#### 5.2.1 QR Code Attendance ⭐ UNIQUE FEATURE

| Feature | Description |
|---------|-------------|
| **QR Generation** | Random 32-character URL-safe tokens |
| **Base64 Image** | PNG QR code generated server-side |
| **Configurable TTL** | 1-120 minutes validity (default: 10 min) |
| **Auto-Invalidation** | New code invalidates all previous codes |
| **Usage Tracking** | Count how many times code was used |
| **Session Cancellation** | Cancel active QR sessions |

#### 5.2.2 OTP (One-Time Password) Attendance ⭐ UNIQUE FEATURE

| Feature | Description |
|---------|-------------|
| **Numeric OTP** | 6-digit random code generation |
| **Configurable TTL** | 1-60 minutes validity (default: 5 min) |
| **Auto-Invalidation** | New OTP invalidates previous ones |
| **Usage Tracking** | Count how many times OTP was used |
| **Session Cancellation** | Cancel active OTP sessions |

#### 5.2.3 GPS Geofencing ⭐ UNIQUE FEATURE

| Feature | Description |
|---------|-------------|
| **Haversine Formula** | Accurate distance calculation in meters |
| **Configurable Radius** | Per-location radius setting |
| **Coordinate Storage** | Latitude/Longitude per location |
| **Real-Time Validation** | GPS check during attendance marking |

#### 5.2.4 WiFi/BSSID Verification ⭐ UNIQUE FEATURE

| Feature | Description |
|---------|-------------|
| **Access Points** | Register WiFi access points per location |
| **BSSID Matching** | Verify student's device MAC address |
| **Multi-AP Support** | Multiple access points per location |
| **Active/Inactive** | Enable/disable access points |

### 5.3 Academic Management

| Feature | Description | CRUD |
|---------|-------------|------|
| **Courses** | Academic programs (name, code, duration) | ✅ |
| **Branches** | Specializations within courses | ✅ |
| **Divisions** | Class groups (year, semester) | ✅ |
| **Batches** | Student subgroups within divisions | ✅ |
| **Subjects** | Course subjects | ✅ |
| **Timetables** | Class schedules with time slots | ✅ |
| **Enrollments** | Student course enrollments | ✅ |
| **Locations** | Physical rooms with geofence | ✅ |

### 5.4 Real-Time Features

#### 5.4.1 WebSocket Updates ⭐ UNIQUE FEATURE

| Feature | Description |
|---------|-------------|
| **Per-Session Rooms** | WebSocket rooms per timetable |
| **Live Broadcast** | Real-time attendance notifications |
| **Auto-Cleanup** | Automatic disconnect handling |
| **Ping/Pong** | Connection health checks |

#### 5.4.2 In-App Notifications

| Feature | Description |
|---------|-------------|
| **Notification Types** | INFO, WARNING, SUCCESS |
| **Read Status** | Mark as read functionality |
| **Unread Count** | Real-time badge updates |
| **Per-User** | User-specific notifications |

### 5.5 Audit & Logging

| Feature | Description |
|---------|-------------|
| **Action Tracking** | Log all sensitive operations |
| **Entity Details** | Track entity type and ID |
| **IP Capture** | Client IP address logging |
| **Non-Blocking** | Failures don't disrupt main operation |

### 5.6 Reporting & Analytics

| Feature | Description |
|---------|-------------|
| **Attendance Summary** | Present/Absent/Late counts |
| **Student Reports** | Per-student attendance percentage |
| **Class Reports** | Per-session attendance list |
| **Division Reports** | Division-level attendance rates |
| **CSV Export** | Download filtered data |
| **Dashboard Charts** | Pie, Line, Bar charts |

### 5.7 User Management

| Feature | Description |
|---------|-------------|
| **User CRUD** | Create, read, update, delete users |
| **Role Assignment** | Assign Admin/Teacher/Student roles |
| **Branch Association** | Link users to branches |
| **Password Management** | Change password functionality |
| **User Preferences** | Theme, notification settings |

### 5.8 Location Management

| Feature | Description |
|---------|-------------|
| **Room Management** | Physical rooms/locations |
| **Geofence Setup** | GPS coordinates + radius |
| **Room Types** | Lab, Classroom, Auditorium, Workshop |
| **Capacity** | Room seating capacity |
| **Floor/Room Number** | Physical location identifiers |

### 5.9 Mass Attendance Operations

| Feature | Description |
|---------|-------------|
| **Mark All Absent** | Automatically mark unenrolled students as absent |
| **Batch Updates** | Update multiple records at once |
| **Status Changes** | Present → Late → Absent transitions |

---

## 6. User Roles & Permissions

### 6.1 Role Matrix

| Permission | Admin | Teacher | Student |
|------------|-------|---------|---------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |
| Manage Courses | ✅ | ❌ | ❌ |
| Manage Branches | ✅ | ❌ | ❌ |
| Manage Divisions | ✅ | ❌ | ❌ |
| Manage Batches | ✅ | ❌ | ❌ |
| Manage Timetables | ✅ | ✅ | ❌ |
| Generate QR/OTP | ✅ | ✅ | ❌ |
| View Class Attendance | ✅ | ✅ | ❌ |
| Mark Attendance | ✅ | ✅ | ✅ |
| View Own History | ✅ | ✅ | ✅ |
| View All Reports | ✅ | ✅ | ❌ |
| Export Reports | ✅ | ✅ | ❌ |

### 6.2 Security Model

- **JWT Tokens:** HS256 algorithm
- **Access Token Expiry:** 30 minutes
- **Refresh Token Expiry:** 7 days
- **Password Hashing:** PBKDF2 with salt (29,000 rounds)

---

## 7. User Flows

### 7.1 Attendance Marking Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ATTENDANCE MARKING FLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [TEACHER/ADMIN]                                                       │
│       │                                                                │
│       ├─ 1. Select Timetable Session                                    │
│       │                                                                │
│       ├─ 2. Generate QR Code OR OTP                                     │
│       │    ├─ System validates timetable exists                         │
│       │    ├─ System invalidates any existing code                     │
│       │    └─ System creates new code with TTL                         │
│       │                                                                │
│       ├─ 3. Display Code to Students                                    │
│       │    ├─ QR: Show Base64 PNG image                                 │
│       │    └─ OTP: Display 6-digit number                               │
│       │                                                                │
│       │                         [STUDENT]                               │
│       │                              │                                  │
│       │                              ├─ 4. Scan QR / Enter OTP         │
│       │                              │                                  │
│       │                              ├─ 5. Provide GPS (if required)   │
│       │                              │                                  │
│       │                              ├─ 6. Provide WiFi (if required)  │
│       │                              │                                  │
│       │                              ├─ 7. System Validates:            │
│       │                              │    ├─ Code validity             │
│       │                              │    ├─ Code expiry               │
│       │                              │    ├─ Enrollment check          │
│       │                              │    ├─ Duplicate check          │
│       │                              │    ├─ GPS distance check        │
│       │                              │    └─ WiFi BSSID check          │
│       │                              │                                  │
│       │                              ├─ 8. Attendance Recorded         │
│       │                              │                                  │
│       │                              │                                  │
│       ├─ ←─ WEBSOCKET ───────────────┼─ Real-time update sent         │
│       │     (attendance_marked)       │                                  │
│       │                              │                                  │
│       ├─ 9. Notification Received     │                                  │
│       │                              │                                  │
│       └─ 10. View Live Attendance    │                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [USER]                                                                 │
│       │                                                                │
│       ├─ 1. POST /api/v1/auth/login                                    │
│       │    Body: { email, password }                                   │
│       │                                                                │
│       ├─ 2. System Validates:                                          │
│       │    ├─ User exists                                              │
│       │    ├─ Password matches                                         │
│       │    └─ User is active                                          │
│       │                                                                │
│       │    ┌──────────────────┐    ┌──────────────────┐               │
│       │    │  SUCCESS         │    │  FAILED         │               │
│       │    ├─ Access Token   │    ├─ 401 Error      │               │
│       │    ├─ Refresh Token  │    └──────────────────┘               │
│       │    ├─ User Data      │                                        │
│       │    └──────────────────┘                                        │
│       │                                                                │
│       ├─ 3. Store Tokens (localStorage / SharedPreferences)            │
│       │                                                                │
│       ├─ 4. Subsequent Requests:                                       │
│       │    Header: Authorization: Bearer <access_token>              │
│       │                                                                │
│       ├─ 5. On 401 Response:                                           │
│       │    ├─ Use Refresh Token                                        │
│       │    ├─ POST /api/v1/auth/refresh                               │
│       │    └─ Update stored tokens                                    │
│       │                                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Admin User Management Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ADMIN USER MANAGEMENT FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [ADMIN]                                                                │
│       │                                                                │
│       ├─ 1. View User List (paginated, searchable)                      │
│       │                                                                │
│       ├─ 2. Create New User:                                           │
│       │    ├─ Enter email, username, password                          │
│       │    ├─ Select role (Admin/Teacher/Student)                      │
│       │    ├─ Assign branch (optional)                                 │
│       │    └─ System creates user with hashed password                │
│       │                                                                │
│       ├─ 3. Edit User:                                                 │
│       │    ├─ Modify details (name, email, role)                      │
│       │    └─ Activate/deactivate account                             │
│       │                                                                │
│       ├─ 4. Delete User:                                               │
│       │    ├─ Confirmation modal                                       │
│       │    └─ Soft/hard delete                                        │
│       │                                                                │
│       └─ 5. Password Reset:                                             │
│            ├─ Generate reset token                                     │
│            └─ Send to user email                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Requirement | Target |
|-------------|--------|
| API Response Time | < 500ms (95th percentile) |
| Page Load Time | < 3 seconds |
| Database Queries | Optimized with indexes |
| Concurrent Users | 500+ |

### 8.2 Security

| Requirement | Implementation |
|------------|----------------|
| Authentication | JWT with HS256 |
| Password Storage | PBKDF2 (29,000 rounds) |
| CORS | Configurable allowed origins |
| Rate Limiting | In-memory per-IP |
| Request Logging | JSON structured logging |
| Audit Trails | All sensitive actions logged |

### 8.3 Scalability

| Requirement | Implementation |
|------------|----------------|
| Stateless API | Horizontal scaling ready |
| Redis Cache | Configured (QR/OTP caching) |
| Database | PostgreSQL with connection pooling |
| Docker Support | Docker Compose deployment |

### 8.4 Reliability

| Requirement | Target |
|------------|--------|
| Uptime | 99.5% |
| Error Handling | Custom exception handlers |
| Logging | Structured JSON logging |
| Health Check | /health endpoint |

### 8.5 Usability

| Requirement | Target |
|------------|--------|
| Responsive Design | Mobile-first |
| User Feedback | Toast notifications |
| Loading States | Skeleton/spinner UI |
| Error Messages | Clear and actionable |

---

## 9. Success Metrics

### 9.1 Key Performance Indicators

| Metric | Target |
|--------|--------|
| Attendance Marking Success Rate | > 98% |
| False Rejection Rate | < 2% |
| Average Marking Time | < 5 seconds |
| Report Generation Time | < 10 seconds |
| User Satisfaction | > 4.5/5 |

### 9.2 Adoption Metrics

| Metric | Target |
|--------|--------|
| Daily Active Users | > 80% of enrolled users |
| QR Usage vs OTP Usage | 70% QR / 30% OTP |
| Mobile App Adoption | > 60% of students |
| Report Exports | > 10 per day |

### 9.3 Technical Metrics

| Metric | Target |
|--------|--------|
| API Uptime | > 99.5% |
| Average Response Time | < 300ms |
| Database Connection Pool | 80% utilization |
| WebSocket Connections | 100+ concurrent |

---

## Appendix A: Feature Comparison

| Feature | Traditional Systems | Smart Attendance System |
|---------|-------------------|------------------------|
| Method | Paper/Manual | QR + OTP + GPS + WiFi |
| Verification | None | Multi-factor |
| Real-Time | No | Yes (WebSocket) |
| Reports | Manual | Automated + Export |
| Mobile | No | Yes |
| Geofencing | No | Yes |
| Audit Trail | No | Yes |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **QR Code** | Quick Response code for attendance marking |
| **OTP** | One-Time Password (6-digit numeric code) |
| **BSSID** | Basic Service Set Identifier (WiFi MAC address) |
| **Geofencing** | GPS-based location boundary verification |
| **WebSocket** | Real-time bidirectional communication |
| **JWT** | JSON Web Token for authentication |
| **RBAC** | Role-Based Access Control |
| **TTL** | Time To Live (code validity duration) |

---

*Document Version: 2.0.0*  
*Last Updated: March 25, 2026*
