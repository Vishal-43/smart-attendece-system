from fastapi import status


def test_update_password_success(client, student_token, student_user):
    response = client.put(
        f"/api/v1/users/{student_user.id}/password",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"old_password": "student123", "new_password": "newpass123"},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["success"] is True


def test_update_password_wrong_old_password(client, student_token, student_user):
    response = client.put(
        f"/api/v1/users/{student_user.id}/password",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"old_password": "badpass", "new_password": "newpass123"},
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_preferences_create_and_update(client, student_token, student_user):
    get_response = client.get(
        f"/api/v1/users/{student_user.id}/preferences",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert get_response.status_code == status.HTTP_200_OK

    update_response = client.put(
        f"/api/v1/users/{student_user.id}/preferences",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"theme": "dark", "notification_email": False, "language": "en"},
    )
    assert update_response.status_code == status.HTTP_200_OK
    body = update_response.json()
    assert body["theme"] == "dark"
    assert body["notification_email"] is False
