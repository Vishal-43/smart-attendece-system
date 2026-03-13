from fastapi import status


def test_notifications_empty_list(client, teacher_token):
    response = client.get(
        "/api/v1/notifications/",
        headers={"Authorization": f"Bearer {teacher_token}"},
    )

    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["items"] == []


def test_notifications_unread_count(client, teacher_token, timetable, student_token, valid_qr_code, enrollment):
    mark_response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code,
            "latitude": 12.9716,
            "longitude": 77.5946,
        },
    )
    assert mark_response.status_code == status.HTTP_200_OK

    count_response = client.get(
        "/api/v1/notifications/unread-count",
        headers={"Authorization": f"Bearer {teacher_token}"},
    )
    assert count_response.status_code == status.HTTP_200_OK
    assert count_response.json()["data"]["unread_count"] >= 1


def test_mark_notification_as_read(client, teacher_token, timetable, student_token, valid_qr_code, enrollment):
    mark_response = client.post(
        "/api/v1/attendance/mark",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "timetable_id": timetable.id,
            "method": "qr",
            "code": valid_qr_code.code,
            "latitude": 12.9716,
            "longitude": 77.5946,
        },
    )
    assert mark_response.status_code == status.HTTP_200_OK

    list_response = client.get(
        "/api/v1/notifications/",
        headers={"Authorization": f"Bearer {teacher_token}"},
    )
    items = list_response.json()["data"]["items"]
    assert len(items) > 0

    notification_id = items[0]["id"]
    read_response = client.put(
        f"/api/v1/notifications/{notification_id}/read",
        headers={"Authorization": f"Bearer {teacher_token}"},
    )
    assert read_response.status_code == status.HTTP_200_OK
    assert read_response.json()["data"]["is_read"] is True
