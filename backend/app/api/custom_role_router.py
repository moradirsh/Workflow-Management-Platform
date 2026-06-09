from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.custom_role import CustomRole
from app.models.user_role import UserRole
from app.schemas.custom_role import RoleCreate, RoleRead
from app.schemas.group import GroupMemberRead

router = APIRouter(prefix = "/custom-roles", tags = ["Custom Roles"])

# Create a custom role
@router.post("/", response_model = RoleRead)
def create_role(data: RoleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code = 403, detail = "Only owner or admin can create roles")
    role = CustomRole(name = data.name, org_id = current_user.org_id)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

# Get all custom roles in org
@router.get("/", response_model = List[RoleRead])
def get_roles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CustomRole).filter(CustomRole.org_id == current_user.org_id).all()

# Get roles the current user has
@router.get("/my-roles", response_model=List[RoleRead])
def get_my_roles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    roles = db.query(CustomRole).join(UserRole, UserRole.role_id == CustomRole.id).filter(UserRole.user_id == current_user.id).all()
    return roles

# Delete a custom role
@router.delete("/{role_id}", status_code = 204)
def delete_role(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code = 403, detail = "Only owner or admin can delete roles")
    role = db.query(CustomRole).filter(CustomRole.id == role_id, CustomRole.org_id == current_user.org_id).first()
    if not role:
        raise HTTPException(status_code = 404, detail = "Role not found")
    db.delete(role)
    db.commit()

# Assign role to user
@router.post("/{role_id}/users/{user_id}", status_code = 201)
def assign_role(role_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code = 403, detail = "Only owner or admin can assign roles")
    role = db.query(CustomRole).filter(CustomRole.id == role_id, CustomRole.org_id == current_user.org_id).first()
    if not role:
        raise HTTPException(status_code = 404, detail = "Role not found")
    user = db.query(User).filter(User.id == user_id, User.org_id == current_user.org_id).first()
    if not user:
        raise HTTPException(status_code = 404, detail = "User not found")
    existing = db.query(UserRole).filter(UserRole.role_id == role_id, UserRole.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code = 400, detail = "User already has this role")
    user_role = UserRole(user_id = user_id, role_id = role_id)
    db.add(user_role)
    db.commit()
    return {"message": "Role assigned to user"}

# Remove role from user
@router.delete("/{role_id}/users/{user_id}", status_code = 204)
def remove_role(role_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code = 403, detail = "Only owner or admin can remove roles")
    user_role = db.query(UserRole).filter(UserRole.role_id == role_id, UserRole.user_id == user_id).first()
    if not user_role:
        raise HTTPException(status_code = 404, detail = "User role not found")
    db.delete(user_role)
    db.commit()

# Get users with a specific role
@router.get("/{role_id}/users", response_model = List[GroupMemberRead])
def get_role_users(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role = db.query(CustomRole).filter(CustomRole.id == role_id, CustomRole.org_id == current_user.org_id).first()
    if not role:
        raise HTTPException(status_code = 404, detail = "Role not found")
    users = db.query(User).join(UserRole, UserRole.user_id == User.id).filter(UserRole.role_id == role_id).all()
    return users

