from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user, require_admin
from app.schemas.qr_code import QRCodeCreate, QRCodeOut
from app.database.qr_codes import QRCode
from app.schemas.otp_code import OTPCodeCreate, OTPCodeOut
from app.database.otp_code import OTPCode

router = APIRouter(prefix="/api/v1/codes", tags=["codes"])

@router.get("/",response_model=list[list[QRCodeOut],list[OTPCodeOut]])
def list_qr_codes(db: Session = Depends(get_db)):
    qr_codes = db.query(QRCode).all()
    otp_codes = db.query(OTPCode).all()
    return [qr_codes, otp_codes]

@router.get("/timetable_id:{id}", response_model=list[list[QRCodeOut],list[OTPCodeOut]])
def get_codes_by_timetable_id(id: int, db: Session = Depends(get_db)):
    qr_codes = db.query(QRCode).filter(QRCode.timetable_id == id).all()
    otp_codes = db.query(OTPCode).filter(OTPCode.timetable_id == id).all()
    return [qr_codes, otp_codes]

@router.post("/qr_code", response_model=QRCodeOut, dependencies=[Depends(require_admin)])
def create_qr_code(qr_code: QRCodeCreate, db: Session = Depends(get_db)):
    new_qr_code = QRCode(**qr_code.dict())
    db.add(new_qr_code)
    db.commit()
    db.refresh(new_qr_code)
    return new_qr_code

@router.post("/otp_code", response_model=OTPCodeOut, dependencies=[Depends(require_admin)])
def create_otp_code(otp_code: OTPCodeCreate, db: Session = Depends(get_db)):
    new_otp_code = OTPCode(**otp_code.dict())
    db.add(new_otp_code)
    db.commit()
    db.refresh(new_otp_code)
    return new_otp_code 

@router.delete("/qr_code/{code_id}", response_model=QRCodeOut, dependencies=[Depends(require_admin)])
def delete_qr_code(code_id: int, db: Session = Depends(get_db)):                    
    db_qr_code = db.query(QRCode).filter(QRCode.id == code_id).first()
    if not db_qr_code:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR code not found")
    db.delete(db_qr_code)
    db.commit()
      

@router.delete("/otp_code/{code_id}", response_model=OTPCodeOut, dependencies=[Depends(require_admin)])
def delete_otp_code(code_id: int, db: Session = Depends(get_db)):       
    db_otp_code = db.query(OTPCode).filter(OTPCode.id == code_id).first()
    if not db_otp_code:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OTP code not found")
    db.delete(db_otp_code)
    db.commit()
    
