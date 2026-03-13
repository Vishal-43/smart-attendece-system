from fastapi import status


def test_get_my_schedule_teacher(client, teacher_token, timetable):
    response = client.get(
        "/api/v1/timetables/my-schedule",
        headers={"Authorization": f"Bearer {teacher_token}"},
    )

    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["success"] is True
    assert any(item["id"] == timetable.id for item in payload["data"])


def test_get_my_schedule_student(client, student_token, timetable, enrollment):
    response = client.get(
        "/api/v1/timetables/my-schedule",
        headers={"Authorization": f"Bearer {student_token}"},
    )

    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["success"] is True
    assert isinstance(payload["data"], list)


def test_get_today_timetable(client, teacher_token):
    response = client.get(
        "/api/v1/timetables/today",
        headers={"Authorization": f"Bearer {teacher_token}"},
    )

    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["success"] is True
    assert isinstance(payload["data"], list)
