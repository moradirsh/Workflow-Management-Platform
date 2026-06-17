from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.group_member import GroupMember
from app.models.user_role import UserRole
from app.schemas.case import CaseRead
from sqlalchemy import or_

router = APIRouter(prefix = "/archive", tags = ["Archive"])

# Archive a case for admin/owner only
@router.put("/{case_id}", status_code = 204)
def archive_case(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "owner"]:
        raise HTTPException(status_code = 403, detail = "Only admins and owners can archive cases")
    
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code = 404, detail = "Case not found")
    if case.is_archived:
        raise HTTPException(status_code = 400, detail = "Case is already archived")
    
    case.is_archived = True
    db.commit()

# Get all archived cases
@router.get("/", response_model = List[CaseRead])
def get_archived_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Case).filter(Case.org_id == current_user.org_id, Case.is_archived == True)

    # Members only see archived cases they were involved in
    if current_user.role == "member":
        user_group_ids = [gm.group_id for gm in db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all()]
        user_role_ids = [ur.role_id for ur in db.query(UserRole).filter(UserRole.user_id == current_user.id).all()]

        query = query.filter(
            or_(
                Case.assignee_id == current_user.id,
                Case.created_by == current_user.id,
                Case.group_id.in_(user_group_ids) if user_group_ids else False,
                Case.custom_role_id.in_(user_role_ids) if user_role_ids else False
            )
        )

    return query.order_by(Case.created_at.desc()).all()