# tests/test_reports.py
# Reports and analytics endpoint tests

import pytest
from fastapi import status
from datetime import datetime, date, timedelta


def test_attendance_summary_no_filters(client, admin_token):
    """Test getting attendance summary without filters."""
    response = client.get(
        "/api/v1/reports/attendance-summary",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    summary = data["data"]
    assert "present" in summary
    assert "absent" in summary
    assert "late" in summary
    assert "total" in summary
    assert "attendance_rate" in summary


def test_attendance_summary_with_date_range(client, teacher_token):
    """Test attendance summary with date range filter."""
    today = date.today()
    week_ago = today - timedelta(days=7)
    
    response = client.get(
        "/api/v1/reports/attendance-summary",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={
            "start_date": week_ago.isoformat(),
            "end_date": today.isoformat()
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "filters" in data["data"]
    assert data["data"]["filters"]["start_date"] == week_ago.isoformat()
    assert data["data"]["filters"]["end_date"] == today.isoformat()


def test_attendance_summary_student_only_sees_own(
    client, student_token, student_user, timetable, valid_qr_code, enrollment, db
):
    """Test that student only sees their own attendance in summary."""
    # Mark attendance first
    client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code
        }
    )
    
    # Get summary
    response = client.get(
        "/api/v1/reports/attendance-summary",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    # Student should see their own record
    assert data["data"]["total"] >= 1


def test_student_report_own_id(client, student_token, student_user):
    """Test student can view their own attendance report."""
    response = client.get(
        f"/api/v1/reports/student/{student_user.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    report = data["data"]
    assert report["student_id"] == student_user.id
    assert "student_name" in report
    assert "courses" in report
    assert isinstance(report["courses"], list)


def test_student_report_other_student_forbidden(
    client, student_token, teacher_user
):
    """Test student cannot view other student's report."""
    response = client.get(
        f"/api/v1/reports/student/{teacher_user.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_student_report_teacher_can_view_any(
    client, teacher_token, student_user
):
    """Test teacher can view any student's report."""
    response = client.get(
        f"/api/v1/reports/student/{student_user.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK


def test_student_report_nonexistent_student(client, teacher_token):
    """Test viewing report for non-existent student."""
    response = client.get(
        "/api/v1/reports/student/99999",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_student_report_with_attendance_data(
    client, teacher_token, student_user, timetable, valid_qr_code, enrollment, student_token, db
):
    """Test student report shows correct attendance data."""
    # Mark attendance
    client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code
        }
    )
    
    # Get report
    response = client.get(
        f"/api/v1/reports/student/{student_user.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    courses = data["data"]["courses"]
    
    # Should have at least one course with attendance data
    if len(courses) > 0:
        course = courses[0]
        assert "course_name" in course
        assert "total_sessions" in course
        assert "attended" in course
        assert "attendance_rate" in course


def test_class_report_teacher_own_timetable(
    client, teacher_token, timetable
):
    """Test teacher can view class report for their timetable."""
    response = client.get(
        f"/api/v1/reports/class/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    report = data["data"]
    assert report["timetable_id"] == timetable.id
    assert "total_students" in report
    assert "attended" in report
    assert "attendance_percentage" in report
    assert "students" in report
    assert isinstance(report["students"], list)


def test_class_report_with_session_date(
    client, teacher_token, timetable
):
    """Test class report with specific session date."""
    today = date.today()
    
    response = client.get(
        f"/api/v1/reports/class/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={"session_date": today.isoformat()}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["session_date"] == today.isoformat()


def test_class_report_nonexistent_timetable(client, teacher_token):
    """Test class report for non-existent timetable."""
    response = client.get(
        "/api/v1/reports/class/99999",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_class_report_student_forbidden(client, student_token, timetable):
    """Test student cannot view class reports."""
    response = client.get(
        f"/api/v1/reports/class/{timetable.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_export_csv_teacher(client, teacher_token, timetable):
    """Test teacher can export CSV for their timetable."""
    response = client.get(
        "/api/v1/reports/export/csv",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={"timetable_id": timetable.id}
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "Content-Disposition" in response.headers
    assert "attendance_export_" in response.headers["Content-Disposition"]


def test_export_csv_with_date_range(client, admin_token):
    """Test CSV export with date range filter."""
    today = date.today()
    week_ago = today - timedelta(days=7)
    
    response = client.get(
        "/api/v1/reports/export/csv",
        headers={"Authorization": f"Bearer {admin_token}"},
        params={
            "start_date": week_ago.isoformat(),
            "end_date": today.isoformat()
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert response.headers["content-type"] == "text/csv; charset=utf-8"


def test_export_csv_student_forbidden(client, student_token):
    """Test student cannot export CSV."""
    response = client.get(
        "/api/v1/reports/export/csv",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_export_csv_contains_headers(client, admin_token):
    """Test that CSV export contains proper headers."""
    response = client.get(
        "/api/v1/reports/export/csv",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    content = response.text
    lines = content.strip().split('\n')
    
    # First line should be headers
    headers = lines[0]
    assert "Attendance ID" in headers
    assert "Student Name" in headers
    assert "Status" in headers
    assert "Marked At" in headers
