# tests/test_auth.py
# Authentication endpoint tests

import pytest
from fastapi import status


def test_login_success(client, student_user):
    """Test successful login with valid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "student",
            "password": "student123"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"


def test_login_invalid_username(client):
    """Test login with non-existent username."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "nonexistent",
            "password": "wrong123"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_invalid_password(client, student_user):
    """Test login with wrong password."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "student",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_inactive_user(client, db, student_user):
    """Test login with inactive user account."""
    # Deactivate user
    student_user.is_active = False
    db.commit()
    
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "student",
            "password": "student123"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_token_refresh(client, student_user):
    """Test token refresh with valid refresh token."""
    # First, login to get tokens
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "student",
            "password": "student123"
        }
    )
    
    refresh_token = login_response.json()["data"]["refresh_token"]
    
    # Now refresh
    response = client.post(
        "/api/v1/auth/refresh",
        json={
            "refresh_token": refresh_token
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]


def test_get_current_user(client, student_token, student_user):
    """Test getting current user profile."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    user_data = data["data"]
    assert user_data["email"] == student_user.email
    assert user_data["username"] == student_user.username
    assert user_data["role"] == "student"


def test_get_current_user_no_token(client):
    """Test getting current user without token."""
    response = client.get("/api/v1/auth/me")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_get_current_user_invalid_token(client):
    """Test getting current user with invalid token."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_token_here"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_is_admin_endpoint_admin(client, admin_token):
    """Test is_admin endpoint with admin user."""
    response = client.post(
        "/api/v1/auth/is-admin",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data.get("is_admin") is True


def test_is_admin_endpoint_non_admin(client, student_token):
    """Test is_admin endpoint with non-admin user."""
    response = client.post(
        "/api/v1/auth/is-admin",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data.get("is_admin") is False
