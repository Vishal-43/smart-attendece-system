# tests/test_attendance.py
# Attendance marking and management tests

import pytest
from fastapi import status
from datetime import datetime


def test_mark_attendance_with_valid_qr(
    client, student_token, student_user, timetable, valid_qr_code, enrollment
):
    """Test marking attendance with valid QR code."""
    response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    attendance = data["data"]
    assert attendance["student_id"] == student_user.id
    assert attendance["timetable_id"] == timetable.id
    assert attendance["status"] in ["present", "late"]
    assert attendance["method"] == "qr"


def test_mark_attendance_duplicate_prevention(
    client, student_token, timetable, valid_qr_code, enrollment, db
):
    """Test that duplicate attendance on same day is prevented."""
    # Mark attendance first time
    response1 = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code
        }
    )
    assert response1.status_code == status.HTTP_200_OK
    
    # Try to mark again (should fail)
    response2 = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code
        }
    )
    
    assert response2.status_code == status.HTTP_409_CONFLICT


def test_mark_attendance_expired_qr_code(
    client, student_token, timetable, expired_qr_code, enrollment
):
    """Test that expired QR codes are rejected."""
    response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": expired_qr_code.code
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    data = response.json()
    assert "expired" in data.get("message", "").lower()


def test_mark_attendance_invalid_code(
    client, student_token, timetable, enrollment
):
    """Test that invalid codes are rejected."""
    response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": "invalid_code_12345"
        }
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_mark_attendance_not_enrolled(
    client, student_token, timetable, valid_qr_code, student_user
):
    """Test that non-enrolled students cannot mark attendance."""
    # Note: no enrollment fixture passed, so student is not enrolled
    response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code
        }
    )
    
    # Should fail because student is not enrolled in this division
    assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]


def test_mark_attendance_unauthorized(client, timetable, valid_qr_code):
    """Test that unauthenticated users cannot mark attendance."""
    response = client.post(
        "/api/v1/attendance/mark",
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_get_attendance_history_own_records(
    client, student_token, student_user, db
):
    """Test student can view their own attendance history."""
    response = client.get(
        f"/api/v1/attendance/history/{student_user.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data


def test_get_attendance_history_other_student_forbidden(
    client, student_token, teacher_user
):
    """Test student cannot view other student's history."""
    response = client.get(
        f"/api/v1/attendance/history/{teacher_user.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_get_attendance_history_teacher_can_view_all(
    client, teacher_token, student_user
):
    """Test teacher can view any student's history."""
    response = client.get(
        f"/api/v1/attendance/history/{student_user.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK


def test_get_session_attendance_teacher_own_timetable(
    client, teacher_token, timetable
):
    """Test teacher can view attendance for their own timetable."""
    response = client.get(
        f"/api/v1/attendance/session/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data


def test_update_attendance_status_teacher(
    client, teacher_token, student_token, timetable, valid_qr_code, enrollment, db
):
    """Test teacher can update attendance status."""
    # First, student marks attendance
    mark_response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code
        }
    )
    
    attendance_id = mark_response.json()["data"]["id"]
    
    # Teacher updates status to late
    response = client.put(
        f"/api/v1/attendance/{attendance_id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
        json={
            "status": "late"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["status"] == "late"


def test_update_attendance_status_student_forbidden(
    client, student_token, teacher_token, timetable, valid_qr_code, enrollment
):
    """Test student cannot update attendance status."""
    # First, mark attendance
    mark_response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code
        }
    )
    
    attendance_id = mark_response.json()["data"]["id"]
    
    # Student tries to update (should fail)
    response = client.put(
        f"/api/v1/attendance/{attendance_id}",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "status": "late"
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_all_attendance_admin_only(client, admin_token):
    """Test that only admin can list all attendance records."""
    response = client.get(
        "/api/v1/attendance/",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK


def test_list_all_attendance_non_admin_forbidden(client, student_token):
    """Test that non-admin cannot list all attendance records."""
    response = client.get(
        "/api/v1/attendance/",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
