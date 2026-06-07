# Alter user info, login, register/org
from fastapi import APIRouter, Depends, HTTPException 
from sqlalchemy.orm import Session
from typing import List
from app.schemas.user import UserCreate, UserRead, UserLogin, TokenResponse, UserUpdate, AdminUserCreate, OrgRegister
from app.models.user import User
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token 
from app.core.dependencies import get_current_user
from app.models.organization import Organization
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func = get_remote_address)
router = APIRouter(prefix = "/users", tags = ["Users"])

# Register a new org and admin user
@router.post("/register", response_model = UserRead)
def register_user(data: OrgRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code = 400, detail = "Email already registered")
    
    # Now we check if org name already exists
    existing_org = db.query(Organization).filter(Organization.name == data.org_name).first()
    if existing_org:
        raise HTTPException(status_code = 400, detail = "Organization name already taken")
    
    # Create org
    org = Organization(name = data.org_name)
    db.add(org)
    db.commit()
    db.refresh(org)
    
    new_user = User(name = data.name, email = data.email, role = "admin", hashed_password = hash_password(data.password), org_id = org.id)
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

# Get all users in same org (for admin only)
@router.get("/", response_model=List[UserRead])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).filter(User.org_id == current_user.org_id).all()

# Admin creates a new user in their org
@router.post("/create", response_model=UserRead)
def admin_create_user(data: AdminUserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only admins can create users
    if current_user.role != "admin":
        raise HTTPException(status_code = 403, detail = "Only admins can create users")  
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code = 400, detail = "Email already registered")
    new_user = User(name = data.name, email = data.email, role = data.role, hashed_password = hash_password(data.password), org_id = current_user.org_id)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Admin deletes a user
@router.delete("/{user_id}", status_code = 204)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only admins can delete users
    if current_user.role != "admin":
        raise HTTPException(status_code = 403, detail = "Only admins can delete users")
    user = db.query(User).filter(User.id == user_id, User.org_id == current_user.org_id).first()
    if not user:
        raise HTTPException(status_code = 404, detail = "User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code = 400, detail = "Cannot delete yourself")
    db.delete(user)
    db.commit()

# Limit login attempts
@router.post("/login", response_model = TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code = 401, detail = "Invalid credentials")
    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}