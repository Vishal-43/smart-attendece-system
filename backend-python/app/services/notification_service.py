from sqlalchemy.orm import Session

from app.database.notifications import Notification, NotificationType


def create_notification(
    db: Session,
    *,
    user_id: int,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.INFO,
    commit: bool = True,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
    )
    db.add(notification)
    if commit:
        db.commit()
        db.refresh(notification)
    return notification
