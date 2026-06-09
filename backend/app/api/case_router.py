# REST endpoints for creating, listing, retrieving, and updating cases.
# It handles request validation and delegates business logic to case_service.
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.case import Case
import os
import uuid
import csv
import io

from app.schemas.case import CaseCreate, CaseRead, CaseUpdate
from app.schemas.activity_log import ActivityLogRead
from app.services.case_service import create_case, get_cases, get_case, update_case, delete_case
from app.core.database import get_db
from app.services.activity_service import log_activity, get_case_activity
from app.ai.file_extractor import extract_file_content

router = APIRouter(prefix = "/cases", tags = ["Cases"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok = True)

# Create a new case
@router.post("/", response_model = CaseRead)
async def create_case_endpoint(title: str = Form(...), description: str | None = Form(None), assignee_id: int | None = Form(None), priority: str | None = Form(None), file: UploadFile | None = File(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    file_path = None
    file_name = None
    file_content = None
    MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB

    if file:
        file_bytes = await file.read()
        
        # Reject files over 10MB
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
        file_content = extract_file_content(file_bytes, file.filename)
        file_name = file.filename
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    
    # Now pass in new case with file components
    new_case = create_case(db, title, description, assignee_id, priority, file_content, file_path, file_name, current_user.org_id, created_by = current_user.id)
    log_activity(db, new_case.id, current_user.id, "case_created", {"title": new_case.title})
    return new_case

# List all cases based on org (now uses backend search instead of frontend)
@router.get("/", response_model = List[CaseRead])
def list_cases(db: Session = Depends(get_db), assigned_to_me: bool = False, search: str | None = None, priority: str | None = None, status: str | None = None, current_user: User = Depends(get_current_user)):
    query = db.query(Case).filter(Case.org_id == current_user.org_id)

    # If assigned is true, only return cases assigned to curr user
    if assigned_to_me:
        query = query.filter(Case.assignee_id == current_user.id)
    if search:
        query = query.filter(Case.title.ilike(f"%{search}%") | Case.description.ilike(f"%{search}%"))
    if priority:
        query = query.filter(Case.priority == priority)
    if status:
        query = query.filter(Case.status == status)
    return query.order_by(Case.created_at.desc()).all()

# Export cases to CSV
@router.get("/export/csv")
def export_cases_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), assigned_to_me: bool = False, search: str | None = None, priority: str | None = None, status: str | None = None):
    query = db.query(Case).filter(Case.org_id == current_user.org_id)
    
    if assigned_to_me:
        query = query.filter(Case.assignee_id == current_user.id)
    if search:
        query = query.filter(
            Case.title.ilike(f"%{search}%") |
            Case.description.ilike(f"%{search}%")
        )
    if priority:
        query = query.filter(Case.priority == priority)
    if status:
        query = query.filter(Case.status == status)
        
    # Get case based on query params to export only what user is looking at
    cases = query.order_by(Case.created_at.desc()).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row
    writer.writerow(["ID", "Title", "Description", "Status", "Priority", "Category", "Summary", "Assignee ID", "Created At"])
    
    # Data rows
    for case in cases:
        writer.writerow([case.id, case.title, case.description or "", case.status, case.priority or "", case.category or "", case.summary or "", case.assignee_id or "", case.created_at.strftime("%Y-%m-%d %H:%M") if case.created_at else ""
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type = "text/csv",
        headers = {"Content-Disposition": "attachment; filename=cases.csv"}
    )

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
    
    # Get creator name of case
    creator = db.query(User).filter(User.id == case.created_by).first()
    case_data = CaseRead.model_validate(case)
    case_data.created_by_name = creator.name if creator else "Unknown"
    return case_data

# Update a case only to change assignee and status
@router.put("/{case_id}", response_model = CaseRead)
def update_case_endpoint(case_id: int, updates: CaseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code = 404, detail = "Case not found")
    details = updates.model_dump(exclude_unset = True)
    if "status" in details:
        details["previous_status"] = case.status
    if "assignee_id" in details and details["assignee_id"]:
        assignee = db.query(User).filter(User.id == details["assignee_id"]).first()
        if assignee:
            details["assignee_name"] = assignee.name
    updated = update_case(db, case, updates.model_dump(exclude_unset=True))
    log_activity(db, case_id, current_user.id, "case_updated", { 
                                                                "changed_by": current_user.name, "changes": details})
    return updated


# Del case
@router.delete("/{case_id}", status_code = 204)
def delete_case_endpoint(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code = 404, detail = "Case not found")
    delete_case(db, case)

# Download file when user attaches file creating a case
@router.get("/{case_id}/file")
def download_file(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code = 404, detail="Case not found")
    if not case.file_path or not os.path.exists(case.file_path):
        raise HTTPException(status_code = 404, detail = "No file attached to this case")
    return FileResponse(case.file_path, filename = case.file_name)