from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.locations import LocationCreate, LocationOut, LocationUpdate
from app.database.locations import Location

router = APIRouter(prefix="/api/v1/locations", tags=["locations"])


@router.get("/", response_model=list[LocationOut])
def list_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()


@router.get("/{location_id}", response_model=LocationOut)
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    return location


@router.post("/", response_model=LocationOut, dependencies=[Depends(require_admin)])
def create_location(location_in: LocationCreate, db: Session = Depends(get_db)):
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
        room_no=location_in.room_no,
        floor=location_in.floor,
        room_type=location_in.room_type,
        capacity=location_in.capacity,
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location


@router.put(
    "/{location_id}", response_model=LocationOut, dependencies=[Depends(require_admin)]
)
def update_location(
    location_id: int, location_in: LocationUpdate, db: Session = Depends(get_db)
):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    update_data = location_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_location, key, value)
    db.commit()
    db.refresh(db_location)
    return db_location


@router.delete(
    "/{location_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_location(location_id: int, db: Session = Depends(get_db)):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    db.delete(db_location)
    db.commit()
