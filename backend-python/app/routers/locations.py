from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import math

from app.core.dependencies import get_db, require_admin
from app.core.response import success_response
from app.schemas.locations import LocationCreate, LocationOut, LocationUpdate
from app.database.locations import Location

router = APIRouter(prefix="/api/v1/locations", tags=["locations"])


def _serialize_location(location: Location) -> dict:
    return {
        "id": location.id,
        "name": location.name,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "radius": location.radius,
        "room_no": location.room_no,
        "floor": location.floor,
        "room_type": location.room_type.value if location.room_type else None,
        "capacity": location.capacity,
        "created_at": location.created_at.isoformat() if location.created_at else None,
        "updated_at": location.updated_at.isoformat() if location.updated_at else None,
    }


@router.get("/")
def list_locations(db: Session = Depends(get_db)):
    locations = db.query(Location).all()
    return success_response([_serialize_location(l) for l in locations], "Locations retrieved successfully")


@router.get("/{location_id}")
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    return success_response(_serialize_location(location), "Location retrieved successfully")


@router.post("/")
def create_location(location_in: LocationCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(Location).filter(Location.name == location_in.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location with this name already exists",
        )
    new_location = Location(
        name=location_in.name,
        latitude=location_in.latitude,
        longitude=location_in.longitude,
        radius=location_in.radius,
        room_no=location_in.address or location_in.room_no,
        floor=location_in.floor,
        room_type=location_in.room_type,
        capacity=location_in.capacity,
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return success_response(_serialize_location(new_location), "Location created successfully", 201)


@router.put("/{location_id}")
def update_location(
    location_id: int, location_in: LocationUpdate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    update_data = location_in.model_dump(exclude_unset=True)
    address = update_data.pop("address", None)
    if address is not None:
        update_data["room_no"] = address

    for key, value in update_data.items():
        setattr(db_location, key, value)
    db.commit()
    db.refresh(db_location)
    return success_response(_serialize_location(db_location), "Location updated successfully")


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(location_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    db.delete(db_location)
    db.commit()


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/validate-point")
def validate_point(
    lat: float = Query(..., description="Latitude of the point"),
    lon: float = Query(..., description="Longitude of the point"),
    db: Session = Depends(get_db),
):
    locations = db.query(Location).filter(
        Location.latitude.isnot(None),
        Location.longitude.isnot(None),
        Location.radius.isnot(None),
    ).all()

    matching_locations = []
    for loc in locations:
        distance = _haversine_distance(lat, lon, loc.latitude, loc.longitude)
        if distance <= loc.radius:
            matching_locations.append({
                "id": loc.id,
                "name": loc.name,
                "distance_meters": round(distance, 2),
                "radius_meters": loc.radius,
            })

    if matching_locations:
        return success_response(
            {"valid": True, "locations": matching_locations},
            "Point is within valid attendance location(s)",
        )
    return success_response(
        {"valid": False, "locations": []},
        "Point is not within any registered location radius",
    )
