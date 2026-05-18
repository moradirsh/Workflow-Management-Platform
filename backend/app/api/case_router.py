# REST endpoints for creating, listing, retrieving, and updating cases.
# It handles request validation and delegates business logic to case_service.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.case import Case

from app.schemas.case import CaseCreate, CaseRead, CaseUpdate
from app.schemas.activity_log import ActivityLogRead
from app.services.case_service import create_case, get_cases, get_case, update_case, delete_case
from app.core.database import get_db
from app.services.activity_service import log_activity, get_case_activity

router = APIRouter(prefix = "/cases", tags = ["Cases"])

# Create a new case
@router.post("/", response_model = CaseRead)
def create_case_endpoint(case: CaseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_case = create_case(db, case.title, case.description, case.assignee_id, case.priority)
    log_activity(db, new_case.id, current_user.id, "case_created", {"title": new_case.title})
    return new_case

# List all cases
@router.get("/", response_model = List[CaseRead])
def list_cases(db: Session = Depends(get_db), assigned_to_me: bool = False, current_user: User = Depends(get_current_user)):
    
    # If assigned is true, only return cases assigned to curr user
    if assigned_to_me:
        return db.query(Case).filter(Case.assignee_id == current_user.id).all()
    return db.query(Case).all()

# Get activity
@router.get("/{case_id}/activity", response_model = List[ActivityLogRead])
def get_actvitiy_endpoint(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return get_case_activity(db, case_id)

# Get a single case by ID
@router.get("/{case_id}", response_model = CaseRead)
def get_case_endpoint(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code = 404, detail = "Case not found")
    return case

# Update a case by ID
@router.put("/{case_id}", response_model = CaseRead)
def update_case_endpoint(case_id: int, updates: CaseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code = 404, detail = "Case not found")
    updated = update_case(db, case, updates.model_dump(exclude_unset=True))
    log_activity(db, case_id, current_user.id, "case_updated", updates.model_dump(exclude_unset=True))
    return updated


# Del case
@router.delete("/{case_id}", status_code = 204)
def delete_case_endpoint(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code = 404, detail = "Case not found")
    log_activity(db, case_id, current_user.id, "case_deleted", {"title": case.title})
    delete_case(db, case)
