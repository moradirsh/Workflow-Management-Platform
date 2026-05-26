# Alter user info, login, register
from fastapi import APIRouter, Depends, HTTPException #type: ignore
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserRead, UserLogin, TokenResponse, UserUpdate
from app.models.user import User
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token 
from app.core.dependencies import get_current_user

router = APIRouter(prefix = "/users", tags = ["Users"])

# Register user
@router.post("/register", response_model = UserRead)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code = 400, detail = "Email already registered")
    new_user = User(
        name = user.name,
        email = user.email,
        role = user.role,
        hashed_password = hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Handle login
@router.post("/login", response_model = TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code = 401, detail = "Invalid credentials")
    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}

# Get a user
@router.get("/", response_model = list[UserRead])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Get curr user
@router.get("/me", response_model = UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# For changing user's role, name, pass
@router.put("/me", response_model = UserRead)
def update_me(updates: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if updates.name:
        current_user.name = updates.name
    if updates.role: 
        current_user.role = updates.role
    if updates.new_password:
        if not updates.current_password or not verify_password(updates.current_password, current_user.hashed_password):
            raise HTTPException(status_code = 400, detail = "Current password is incorrect")
        current_user.hashed_password = hash_password(updates.new_password)
    db.commit()
    db.refresh(current_user)
    return current_user