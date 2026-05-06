from fastapi import APIRouter, Depends, HTTPException #type: ignore
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserRead
from app.models.user import User
from app.core.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model = UserRead)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(name = user.name, email = user.email, role = user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/", response_model=list[UserRead])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()