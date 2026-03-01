from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.batches import BatchCreate, BatchOut, BatchUpdate
from app.database.batches import Batch

router = APIRouter(prefix="/api/v1/batches", tags=["batches"])


@router.get("/", response_model=list[BatchOut])
def list_all_batches(db: Session = Depends(get_db)):
    return db.query(Batch).all()


@router.get("/division/{division_id}", response_model=list[BatchOut])
def list_batches_by_division(division_id: int, db: Session = Depends(get_db)):
    return db.query(Batch).filter(Batch.division_id == division_id).all()


@router.get("/{batch_id}", response_model=BatchOut)
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found"
        )
    return batch


@router.post("/", response_model=BatchOut, dependencies=[Depends(require_admin)])
def create_batch(batch_in: BatchCreate, db: Session = Depends(get_db)):
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
    return new_batch


@router.put(
    "/{batch_id}", response_model=BatchOut, dependencies=[Depends(require_admin)]
)
def update_batch(batch_id: int, batch_in: BatchUpdate, db: Session = Depends(get_db)):
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
    return db_batch


@router.delete(
    "/{batch_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    db_batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found"
        )
    db.delete(db_batch)
    db.commit()
