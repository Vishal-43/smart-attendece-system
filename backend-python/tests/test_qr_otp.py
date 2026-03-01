# tests/test_qr_otp.py
# QR Code and OTP generation/management tests

import pytest
from fastapi import status
from datetime import datetime


# ----- QR Code Tests -----

def test_generate_qr_code_teacher(client, teacher_token, timetable):
    """Test teacher can generate QR code for their timetable."""
    response = client.post(
        f"/api/v1/qr/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={"ttl_minutes": 10}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    qr_data = data["data"]
    assert qr_data["timetable_id"] == timetable.id
    assert "code" in qr_data
    assert "qr_image_base64" in qr_data
    assert "expires_at" in qr_data
    assert qr_data["is_active"] is True


def test_generate_qr_code_admin(client, admin_token, timetable):
    """Test admin can generate QR code for any timetable."""
    response = client.post(
        f"/api/v1/qr/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        params={"ttl_minutes": 15}
    )
    
    assert response.status_code == status.HTTP_200_OK


def test_generate_qr_code_student_forbidden(client, student_token, timetable):
    """Test student cannot generate QR codes."""
    response = client.post(
        f"/api/v1/qr/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_generate_qr_code_invalid_timetable(client, teacher_token):
    """Test generating QR for non-existent timetable."""
    response = client.post(
        "/api/v1/qr/generate/99999",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_generate_qr_code_ttl_validation(client, teacher_token, timetable):
    """Test TTL validation (must be between 1 and 120 minutes)."""
    # TTL too short
    response1 = client.post(
        f"/api/v1/qr/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={"ttl_minutes": 0}
    )
    assert response1.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    # TTL too long
    response2 = client.post(
        f"/api/v1/qr/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={"ttl_minutes": 121}
    )
    assert response2.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_get_current_qr_code(client, teacher_token, timetable):
    """Test retrieving current active QR code."""
    # First generate a QR code
    client.post(
        f"/api/v1/qr/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    # Now get current QR
    response = client.get(
        f"/api/v1/qr/current/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    assert data["data"]["timetable_id"] == timetable.id


def test_get_current_qr_code_with_image(client, teacher_token, timetable):
    """Test retrieving current QR code with image."""
    # Generate QR
    client.post(
        f"/api/v1/qr/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    # Get with image
    response = client.get(
        f"/api/v1/qr/current/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={"with_image": True}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "qr_image_base64" in data["data"]


def test_get_current_qr_code_none_exists(client, teacher_token, timetable):
    """Test getting current QR when none exists."""
    response = client.get(
        f"/api/v1/qr/current/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_refresh_qr_code(client, teacher_token, timetable, db):
    """Test refreshing QR code invalidates old and creates new."""
    # Generate initial QR
    response1 = client.post(
        f"/api/v1/qr/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    old_code = response1.json()["data"]["code"]
    
    # Refresh QR
    response2 = client.post(
        f"/api/v1/qr/refresh/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response2.status_code == status.HTTP_200_OK
    new_code = response2.json()["data"]["code"]
    
    # Codes should be different
    assert old_code != new_code


# ----- OTP Code Tests -----

def test_generate_otp_teacher(client, teacher_token, timetable):
    """Test teacher can generate OTP for their timetable."""
    response = client.post(
        f"/api/v1/otp/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={"ttl_minutes": 5}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    otp_data = data["data"]
    assert otp_data["timetable_id"] == timetable.id
    assert "code" in otp_data
    assert len(otp_data["code"]) == 6
    assert otp_data["code"].isdigit()
    assert "expires_at" in otp_data
    assert otp_data["is_active"] is True


def test_generate_otp_admin(client, admin_token, timetable):
    """Test admin can generate OTP for any timetable."""
    response = client.post(
        f"/api/v1/otp/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK


def test_generate_otp_student_forbidden(client, student_token, timetable):
    """Test student cannot generate OTPs."""
    response = client.post(
        f"/api/v1/otp/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_generate_otp_ttl_validation(client, teacher_token, timetable):
    """Test OTP TTL validation (must be between 1 and 60 minutes)."""
    # TTL too short
    response1 = client.post(
        f"/api/v1/otp/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={"ttl_minutes": 0}
    )
    assert response1.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    # TTL too long
    response2 = client.post(
        f"/api/v1/otp/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
        params={"ttl_minutes": 61}
    )
    assert response2.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_get_current_otp(client, teacher_token, timetable):
    """Test retrieving current active OTP."""
    # Generate OTP
    client.post(
        f"/api/v1/otp/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    # Get current OTP
    response = client.get(
        f"/api/v1/otp/current/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    assert data["data"]["timetable_id"] == timetable.id


def test_get_current_otp_none_exists(client, teacher_token, timetable):
    """Test getting current OTP when none exists."""
    response = client.get(
        f"/api/v1/otp/current/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_refresh_otp(client, teacher_token, timetable):
    """Test refreshing OTP invalidates old and creates new."""
    # Generate initial OTP
    response1 = client.post(
        f"/api/v1/otp/generate/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    old_code = response1.json()["data"]["code"]
    
    # Refresh OTP
    response2 = client.post(
        f"/api/v1/otp/refresh/{timetable.id}",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    assert response2.status_code == status.HTTP_200_OK
    new_code = response2.json()["data"]["code"]
    
    # Codes should be different
    assert old_code != new_code
    assert len(new_code) == 6
    assert new_code.isdigit()


def test_mark_attendance_with_valid_otp(
    client, student_token, timetable, valid_otp_code, enrollment
):
    """Test marking attendance with valid OTP."""
    response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "otp",
            "code": valid_otp_code.code
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["method"] == "otp"


def test_mark_attendance_with_expired_otp(
    client, student_token, timetable, expired_otp_code, enrollment
):
    """Test that expired OTP is rejected."""
    response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "otp",
            "code": expired_otp_code.code
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
