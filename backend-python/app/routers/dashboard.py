from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.core.response import success_response
from app.database.attendance_records import AttendanceRecord, AttendanceStatus
from app.database.user import User

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base_query = db.query(AttendanceRecord)
    if current_user.role.value == "student":
        base_query = base_query.filter(AttendanceRecord.student_id == current_user.id)

    total = base_query.count()
    present = base_query.filter(AttendanceRecord.status == AttendanceStatus.PRESENT).count()
    absent = base_query.filter(AttendanceRecord.status == AttendanceStatus.ABSENT).count()
    late = base_query.filter(AttendanceRecord.status == AttendanceStatus.LATE).count()

    attendance_rate = round((present / total) * 100, 2) if total else 0.0

    today = date.today()
    start_day = today - timedelta(days=6)

    trend_query = db.query(
        func.date(AttendanceRecord.marked_at).label("day"),
        func.count(AttendanceRecord.id).label("count"),
    ).filter(func.date(AttendanceRecord.marked_at) >= start_day)

    if current_user.role.value == "student":
        trend_query = trend_query.filter(AttendanceRecord.student_id == current_user.id)

    trend_rows = trend_query.group_by(func.date(AttendanceRecord.marked_at)).all()
    trend_map = {str(row.day): row.count for row in trend_rows}

    trend = []
    for offset in range(7):
        day = start_day + timedelta(days=offset)
        iso_day = day.isoformat()
        trend.append({"date": iso_day, "count": trend_map.get(iso_day, 0)})

    return success_response(
        {
            "total": total,
            "present": present,
            "absent": absent,
            "late": late,
            "attendance_rate": attendance_rate,
            "trend": trend,
            "generated_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
        },
        "Dashboard stats retrieved successfully",
    )
