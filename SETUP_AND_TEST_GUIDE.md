# Complete Setup & Testing Guide

## **Step 1: Start Backend Server**
```bash
cd backend-python
python run.py
```
Server runs on: `http://localhost:8000`

## **Step 2: Start Web Admin Dashboard**
```bash
cd web
npm run dev
```
Access at: `http://localhost:5173`

## **Step 3: Create Initial Data via Web Admin**

### Login
- Email: `admin@test.com`
- Password: `admin123`

### Create Test Data
1. **Create Course**
   - Go to: Management → Courses
   - Click "Add Course"
   - Name: "Computer Science"
   - Code: "CS"
   - Duration: 4 years
   - Click Save

2. **Create Branch**
   - Go to: Management → Branches
   - Click "Add Branch"
   - Select Course: "Computer Science"
   - Name: "CSE-A"
   - Code: "CSE"
   - Branch Code: "CSE-A"
   - Click Save

3. **Create Division**
   - Go to: Management → Divisions
   - Click "Add Division"
   - Select Branch: "CSE-A"
   - Name: "A1"
   - Year: 1
   - Semester: 1
   - Capacity: 50
   - Click Save

4. **Add Locations (Classrooms)**
   - Go to: Management → Access Points
   - Click "Add Location"
   - Name: "Lab-101"
   - Room: "101"
   - Type: "LAB"
   - Click Save

5. **Create Timetable**
   - Go to: Management → Timetables
   - Click "Add Timetable"
   - Division: "A1"
   - Teacher: (Select any teacher from dropdown)
   - Subject: "Data Structures"
   - Day: "monday"
   - Time: 10:00 - 11:00
   - Semester: 1
   - Academic Year: "2025-2026"
   - Location: "Lab-101"
   - Click Save

6. **Enroll Student in Division**
   - Go to: Management → Enrollments
   - Click "Add Enrollment"
   - Select Student: "student@test.com"
   - Course: "Computer Science"
   - Branch: "CSE-A"
   - Division: "A1"
   - Status: "active"
   - Click Save

## **Step 4: Start Mobile App**
```bash
cd mobile
flutter run
```

### Update API URL (if needed)
If running on a physical device or different machine:
1. Open `mobile/lib/services/dio_client.dart`
2. Update `_localBackendUrl` to your machine's IP:
   ```dart
   static const String _localBackendUrl = 'http://192.168.1.100:8000/api/v1';
   ```

## **Step 5: Test the Application**

### Test Scenario 1: Student Login & View Schedule
1. Click "Login" on mobile app
2. Email: `student@test.com`
3. Password: `student123`
4. Should see dashboard with the timetable created above

### Test Scenario 2: Student Marks Attendance
1. In mobile app, click "Mark Attendance"
2. Click "Scan QR Code" or "Enter Code"
3. Wait for code to load

### Test Scenario 3: Teacher Generates QR Code
1. Login as teacher: `teacher@test.com` / `teacher123`
2. Click "Generate QR"
3. Select the timetable created
4. QR code should display
5. Student scans it to mark attendance

### Test Scenario 4: View Reports (Admin)
1. Login as admin: `admin@test.com` / `admin123`
2. Click "Reports"
3. Should show attendance summary

## **Troubleshooting**

| Issue | Solution |
|-------|----------|
| **"Server is not responding..."** | Make sure backend is running with `python run.py` |
| **"No sessions available"** | Create timetables in the web admin first |
| **Mobile app won't connect** | Update IP address in `dio_client.dart` |
| **Database locked error** | Close other terminal running database, clear cache with `flutter clean` |
| **Web admin won't load** | Run `npm install` in web folder first |

## **Default Test Credentials**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `admin123` |
| Teacher | `teacher@test.com` | `teacher123` |
| Student | `student@test.com` | `student123` |

## **Key Improvements Made**

✅ **Increased timeout** from 10s to 30s in mobile app  
✅ **Better error messages** - Users see helpful text instead of raw exceptions  
✅ **Created error handler utility** - Reusable across the app  
✅ **Improved AuthService** - Now uses consistent DioClient  
✅ **Fixed backend imports** - All database modules correctly imported

## **Next Steps**

1. Create test data in web admin
2. Test mobile app login
3. Generate QR codes
4. Scan and mark attendance
5. View reports
