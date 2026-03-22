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
    today = date.today()
    start_day = today - timedelta(days=6)
    
    # Base query for all time
    base_query = db.query(AttendanceRecord)
    if current_user.role.value == "STUDENT":
        base_query = base_query.filter(AttendanceRecord.student_id == current_user.id)
    
    # Today's stats
    today_query = base_query.filter(func.date(AttendanceRecord.marked_at) == today)
    today_total = today_query.count()
    today_present = today_query.filter(AttendanceRecord.status == AttendanceStatus.PRESENT).count()
    today_absent = today_query.filter(AttendanceRecord.status == AttendanceStatus.ABSENT).count()
    today_late = today_query.filter(AttendanceRecord.status == AttendanceStatus.LATE).count()
    
    # All time stats
    total = base_query.count()
    present = base_query.filter(AttendanceRecord.status == AttendanceStatus.PRESENT).count()
    absent = base_query.filter(AttendanceRecord.status == AttendanceStatus.ABSENT).count()
    late = base_query.filter(AttendanceRecord.status == AttendanceStatus.LATE).count()

    attendance_rate = round((today_present / today_total) * 100, 2) if today_total else 0.0

    trend_query = db.query(
        func.date(AttendanceRecord.marked_at).label("day"),
        func.count(AttendanceRecord.id).label("count"),
    ).filter(func.date(AttendanceRecord.marked_at) >= start_day)

    if current_user.role.value == "STUDENT":
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
            "total": today_total,
            "present": today_present,
            "absent": today_absent,
            "late": today_late,
            "all_time_total": total,
            "all_time_present": present,
            "all_time_absent": absent,
            "all_time_late": late,
            "attendance_rate": attendance_rate,
            "trend": trend,
            "generated_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
        },
        "Dashboard stats retrieved successfully",
    )
