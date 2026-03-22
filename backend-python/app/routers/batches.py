from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.core.response import success_response
from app.schemas.batches import BatchCreate, BatchOut, BatchUpdate
from app.database.batches import Batch

router = APIRouter(prefix="/api/v1/batches", tags=["batches"])


def _serialize_batch(batch: Batch) -> dict:
    return {
        "id": batch.id,
        "division_id": batch.division_id,
        "name": batch.name,
        "batch_number": batch.batch_number,
        "semester": batch.semester,
        "academic_year": batch.academic_year,
        "created_at": batch.created_at.isoformat() if batch.created_at else None,
        "updated_at": batch.updated_at.isoformat() if batch.updated_at else None,
    }


@router.get("")
def list_all_batches(db: Session = Depends(get_db)):
    batches = db.query(Batch).all()
    return success_response([_serialize_batch(b) for b in batches], "Batches retrieved successfully")


@router.get("/division/{division_id}")
def list_batches_by_division(division_id: int, db: Session = Depends(get_db)):
    batches = db.query(Batch).filter(Batch.division_id == division_id).all()
    return success_response([_serialize_batch(b) for b in batches], "Batches retrieved successfully")


@router.get("/{batch_id}")
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found"
        )
    return success_response(_serialize_batch(batch), "Batch retrieved successfully")


@router.post("")
def create_batch(batch_in: BatchCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    new_batch = Batch(
        division_id=batch_in.division_id,
        name=batch_in.name,
        batch_number=batch_in.batch_number,
        semester=batch_in.semester,
        academic_year=batch_in.academic_year,
    )
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return success_response(_serialize_batch(new_batch), "Batch created successfully", 201)


@router.put("/{batch_id}")
def update_batch(batch_id: int, batch_in: BatchUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    db_batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found"
        )
    update_data = batch_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_batch, key, value)
    db.commit()
    db.refresh(db_batch)
    return success_response(_serialize_batch(db_batch), "Batch updated successfully")


@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_batch(batch_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    db_batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found"
        )
    db.delete(db_batch)
    db.commit()
