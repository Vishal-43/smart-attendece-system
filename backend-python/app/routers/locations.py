from fastapi import APIRouter, Depends, HTTPException,status 
from app.core.dependencies import get_db, require_admin
from sqlalchemy.orm import Session
from app.schemas.locations import LocationCreate, LocationOut, LocationUpdate
from app.database.locations import Location 

router = APIRouter(prefix="/api/v1/locations", tags=["locations"])


@router.get("/", response_model=list[LocationOut])
def list_locations(db: Session = Depends(get_db)):
    locations = db.query(Location).all()
    return locations

@router.get("/{location_id}",response_model=LocationOut)
def get_location(location_id: int, db: Session = Depends(get_db)):
    return db.query(Location).filter(Location.id == location_id).first()


@router.post("/", response_model=LocationOut, dependencies=[Depends(require_admin)])
def create_location(location:LocationCreate, db:Session = Depends(get_db)):
    db_location = db.query(Location).filter(Location.name == location.name).first()
    if db_location:
        raise HTTPException(status_code=status.HTTo_400_BAD_REQUEST, details="Location with this name already Exists")
    new_location = Location(
        name = location.name,
        latitude = location.latitude,
        longitude = location.longitude,
        radius = location.radius,
        room_no = location.room_no,
        floor = location.floor,
        room_type = location.room_type,
        capacity = location.capacity 

    )

    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location


@router.put("/{location_id}",response_model=LocationOut, dependencies=[Depends(require_admin)])
def update_location(location_id: int, location_in: LocationUpdate, db: Session = Depends(get_db)):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail="Location not found")
    for var, value in vars(location_in).items():
        if value is not None:
            setattr(db_location, var, value)
   
    db.commit()
    db.refresh(db_location)
    return db_location

@router.delete("/{location_id}", dependencies=[Depends(require_admin)])
def delete_location(location_id: int, db: Session = Depends(get_db)):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    db.delete(db_location)
    db.commit()

