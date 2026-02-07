from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_admin
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.database.user import User
from app.security.password import hash_password


router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/", response_model=list[UserOut], dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


@router.get("/{user_id}",response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), curr_user=Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="User not found")
    if curr_user.role.value != "ADMIN" or curr_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this user")
    return user

@router.post("/", response_model=UserOut, dependencies=[Depends(require_admin)])
def create_user(user: UserCreate, db: Session= Depends(get_db)):
    db_user =  db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email Already registered")
    new_user = User(
        email=user.email,
        username = user.username,
        password_hash = hash_password(user.password, user.username),
        first_name = user.first_name,
        last_name = user.last_name,
        phone = user.phone,
        role = user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id:int, user_in: UserUpdate, db: Session = Depends(get_db),curr_user=Depends(get_current_user)):
    db_user = db.query(User).filter(User.id == user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if curr_user.role.value != "ADMIN" or curr_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Access denied")
    

    for var, value in vars(user_in).items():
        if value is not None:
            if var == "password" :
                db_user.password_hash = hash_password(value, db_user.username)
            else:
                setattr(db_user, var, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id:int, db: Session = Depends(get_db), curr_user=Depends(get_current_user)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if curr_user.role.value != "ADMIN" or curr_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    db.delete(db_user)
    db.commit()
