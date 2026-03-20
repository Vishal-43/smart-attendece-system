from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.dependencies import get_db, require_admin
from app.core.response import success_response
from app.schemas.access_points import AccessPointCreate, AccessPointOut, AccessPointUpdate
from app.database.access_points import AccessPoint
from app.database.locations import Location

router = APIRouter(prefix="/api/v1/access-points", tags=["access-points"])


def _serialize_access_point(ap: AccessPoint) -> dict:
    return {
        "id": ap.id,
        "location_id": ap.location_id,
        "name": ap.name,
        "mac_address": ap.mac_address,
        "ip_address": ap.ip_address,
        "is_active": ap.is_active,
        "created_at": ap.created_at.isoformat() if ap.created_at else None,
        "updated_at": ap.updated_at.isoformat() if ap.updated_at else None,
        "location_name": ap.location.name if ap.location else None,
    }


@router.get("/")
def list_access_points(
    location_id: int | None = None,
    is_active: bool | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(AccessPoint)
    if location_id is not None:
        query = query.filter(AccessPoint.location_id == location_id)
    if is_active is not None:
        query = query.filter(AccessPoint.is_active == is_active)
    access_points = query.all()
    return success_response([_serialize_access_point(ap) for ap in access_points], "Access points retrieved successfully")


@router.get("/{access_point_id}")
def get_access_point(access_point_id: int, db: Session = Depends(get_db)):
    ap = db.query(AccessPoint).filter(AccessPoint.id == access_point_id).first()
    if not ap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Access point not found"
        )
    return success_response(_serialize_access_point(ap), "Access point retrieved successfully")


@router.post("/")
def create_access_point(
    ap_in: AccessPointCreate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    if not db.query(Location).filter(Location.id == ap_in.location_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location not found",
        )
    if db.query(AccessPoint).filter(AccessPoint.mac_address == ap_in.mac_address).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Access point with this MAC address already exists",
        )
    new_ap = AccessPoint(
        location_id=ap_in.location_id,
        name=ap_in.name,
        mac_address=ap_in.mac_address,
        ip_address=ap_in.ip_address,
        is_active=ap_in.is_active,
    )
    db.add(new_ap)
    db.commit()
    db.refresh(new_ap)
    return success_response(_serialize_access_point(new_ap), "Access point created successfully", 201)


@router.put("/{access_point_id}")
def update_access_point(
    access_point_id: int,
    ap_in: AccessPointUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    db_ap = db.query(AccessPoint).filter(AccessPoint.id == access_point_id).first()
    if not db_ap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Access point not found"
        )
    update_data = ap_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ap, key, value)
    db.commit()
    db.refresh(db_ap)
    return success_response(_serialize_access_point(db_ap), "Access point updated successfully")


@router.delete("/{access_point_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_access_point(
    access_point_id: int, db: Session = Depends(get_db), _=Depends(require_admin)
):
    db_ap = db.query(AccessPoint).filter(AccessPoint.id == access_point_id).first()
    if not db_ap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Access point not found"
        )
    db.delete(db_ap)
    db.commit()
