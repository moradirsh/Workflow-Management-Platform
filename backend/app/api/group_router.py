from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.group import Group
from app.models.group_member import GroupMember
from app.schemas.group import GroupCreate, GroupRead, GroupMemberRead

router = APIRouter(prefix = "/groups", tags = ["Groups"])

# Create a group
@router.post("/", response_model = GroupRead)
def create_group(data: GroupCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code = 403, detail = "Only owner or admin can create groups")
    group = Group(name = data.name, org_id = current_user.org_id)
    db.add(group)
    db.commit()
    db.refresh(group)
    return group

# Get all groups in org
@router.get("/", response_model = List[GroupRead])
def get_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Group).filter(Group.org_id == current_user.org_id).all()

# Get groups the current user belongs to
@router.get("/my-groups", response_model=List[GroupRead])
def get_my_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    groups = db.query(Group).join(GroupMember, GroupMember.group_id == Group.id).filter(GroupMember.user_id == current_user.id).all()
    return groups

# Delete a group
@router.delete("/{group_id}", status_code = 204)
def delete_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code = 403, detail = "Only owner or admin can delete groups")
    group = db.query(Group).filter(Group.id == group_id, Group.org_id == current_user.org_id).first()
    if not group:
        raise HTTPException(status_code = 404, detail = "Group not found")
    db.delete(group)
    db.commit()

# Add user to group
@router.post("/{group_id}/members/{user_id}", status_code = 201)
def add_member(group_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code = 403, detail = "Only owner or admin can manage group members")
    group = db.query(Group).filter(Group.id == group_id, Group.org_id == current_user.org_id).first()
    if not group:
        raise HTTPException(status_code = 404, detail = "Group not found")
    user = db.query(User).filter(User.id == user_id, User.org_id == current_user.org_id).first()
    if not user:
        raise HTTPException(status_code = 404, detail = "User not found")
    existing = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code = 400, detail = "User already in group")
    member = GroupMember(group_id = group_id, user_id = user_id)
    db.add(member)
    db.commit()
    return {"message": "User added to group"}

# Remove user from group
@router.delete("/{group_id}/members/{user_id}", status_code = 204)
def remove_member(group_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code = 403, detail = "Only owner or admin can manage group members")
    member = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code = 404, detail = "Member not found")
    db.delete(member)
    db.commit()

# Get members of a group
@router.get("/{group_id}/members", response_model = List[GroupMemberRead])
def get_members(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    group = db.query(Group).filter(Group.id == group_id, Group.org_id == current_user.org_id).first()
    if not group:
        raise HTTPException(status_code = 404, detail = "Group not found")
    members = db.query(User).join(GroupMember, GroupMember.user_id == User.id).filter(GroupMember.group_id == group_id).all()
    return members