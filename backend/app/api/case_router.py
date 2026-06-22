# REST endpoints for creating, listing, retrieving, and updating cases.
# It handles request validation and delegates business logic to case_service.
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from sqlalchemy import or_
import os
import uuid
import csv
import io


from app.models.user import User
from app.models.case import Case
from app.schemas.case import CaseCreate, CaseRead, CaseUpdate
from app.schemas.activity_log import ActivityLogRead
from app.services.case_service import create_case, get_cases, get_case, update_case, delete_case
from app.core.database import get_db
from app.services.activity_service import log_activity, get_case_activity
from app.ai.file_extractor import extract_file_content
from app.models.group_member import GroupMember
from app.models.user_role import UserRole
from app.services.notification_service import notify_assignee, notify_group, notify_role
from app.core.dependencies import get_current_user



router = APIRouter(prefix = "/cases", tags = ["Cases"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok = True)

# Create a new case
@router.post("/", response_model = CaseRead)
async def create_case_endpoint(title: str = Form(...), description: str | None = Form(None), assignee_id: int | None = Form(None), priority: str | None = Form(None), file: UploadFile | None = File(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user), group_id: int | None = Form(None), custom_role_id: int | None = Form(None)):
    file_path = None
    file_name = None
    file_content = None
    MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB

    if file:
        file_bytes = await file.read()
        
        # Reject files over 10MB
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code = 400, detail = "File size exceeds 10MB limit")
        file_content = extract_file_content(file_bytes, file.filename)
        file_name = file.filename
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    
    # Now pass in new case with file components
    new_case = create_case(db, title, description, assignee_id, priority, file_content, file_path, file_name, current_user.org_id, created_by = current_user.id, group_id = group_id, custom_role_id = custom_role_id)
    log_activity(db, new_case.id, current_user.id, "case_created", {"title": new_case.title})
        
    # Now notify the user
    if assignee_id:
        notify_assignee(db, new_case.id, assignee_id, title)
    if group_id:
        notify_group(db, new_case.id, group_id, title)
    if custom_role_id:
        notify_role(db, new_case.id, custom_role_id, title)
    return new_case

# List all cases based on org (now uses backend search instead of frontend)
@router.get("/", response_model = List[CaseRead])
def list_cases(db: Session = Depends(get_db), assigned_to_me: bool = False, search: str | None = None, priority: str | None = None, status: str | None = None, group_id: List[int] = Query(default = []), custom_role_id: List[int] = Query(default = []), current_user: User = Depends(get_current_user)):
    query = db.query(Case).filter(Case.org_id == current_user.org_id, Case.is_archived == False)
    
    # Members only see cases relevant to them
    if current_user.role == "member":
        
        # Get user's group IDs and role IDs
        user_group_ids = [gm.group_id for gm in db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all()]
        user_role_ids = [ur.role_id for ur in db.query(UserRole).filter(UserRole.user_id == current_user.id).all()]

        # Show cases assigned to them, their group, or their role
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Case.assignee_id == current_user.id, Case.created_by == current_user.id, Case.group_id.in_(user_group_ids) if user_group_ids else False, Case.custom_role_id.in_(user_role_ids) if user_role_ids else False
            )
        )

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
    if group_id:
        query = query.filter(Case.group_id.in_(group_id))
    if custom_role_id:
        query = query.filter(Case.custom_role_id.in_(custom_role_id))

    return query.order_by(Case.created_at.desc()).all()

# Export cases to CSV
@router.get("/export/csv")
def export_cases_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), assigned_to_me: bool = False, search: str | None = None, priority: str | None = None, status: str | None = None, group_id: List[int] = Query(default = []), custom_role_id: List[int] = Query(default = [])):
    query = db.query(Case).filter(Case.org_id == current_user.org_id)
    
    # Members only see cases relevant to them
    if current_user.role == "member":
        
        # Get user's group IDs and role IDs
        user_group_ids = [gm.group_id for gm in db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all()]
        user_role_ids = [ur.role_id for ur in db.query(UserRole).filter(UserRole.user_id == current_user.id).all()]

        # Show cases assigned to them, their group, or their role
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Case.assignee_id == current_user.id, Case.created_by == current_user.id, Case.group_id.in_(user_group_ids) if user_group_ids else False, Case.custom_role_id.in_(user_role_ids) if user_role_ids else False
            )
        )

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
    if group_id:
        query = query.filter(Case.group_id.in_(group_id))
    if custom_role_id:
        query = query.filter(Case.custom_role_id.in_(custom_role_id))
        
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
    
    # Return as file response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type = "text/csv",
        headers = {"Content-Disposition": f"attachment; filename=cases_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

# Get activity
@router.get("/{case_id}/activity", response_model = List[ActivityLogRead])
def get_actvitiy_endpoint(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return get_case_activity(db, case_id)

# Certain statistics invoving opened cases, unassigned cases, and overdue cases
@router.get("/stats")
def get_case_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    base_query = db.query(Case).filter(Case.org_id == current_user.org_id, Case.is_archived == False)

    # Member scoping
    if current_user.role == "member":
        from app.models.group_member import GroupMember
        from app.models.user_role import UserRole
        from sqlalchemy import or_
        user_group_ids = [gm.group_id for gm in db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all()]
        user_role_ids = [ur.role_id for ur in db.query(UserRole).filter(UserRole.user_id == current_user.id).all()]
        base_query = base_query.filter(or_(Case.assignee_id == current_user.id, Case.created_by == current_user.id,
                Case.group_id.in_(user_group_ids) if user_group_ids else False,
                Case.custom_role_id.in_(user_role_ids) if user_role_ids else False))

    # Total open cases
    total_open = base_query.filter(Case.status == "open").count()

    # Unassigned cases
    unassigned = base_query.filter(Case.assignee_id == None).count()

    # Overdue cases (open for 7+ days)
    cutoff = datetime.utcnow() - timedelta(days = 7)
    overdue = base_query.filter(
        Case.status != "resolved",
        Case.created_at < cutoff
    ).count()

    # Avg resolution time in days based on x cases in the "resolved"
    resolved_cases = base_query.filter(Case.status == "resolved").all()
    if resolved_cases:
        total_days = sum(
            (c.updated_at - c.created_at).days for c in resolved_cases if c.updated_at and c.created_at
        )
        avg_resolution = round(total_days / len(resolved_cases), 1)
    else:
        avg_resolution = 0

    # Workload by assignee
    from sqlalchemy import func
    workload = db.query(User.name, func.count(Case.id).label("count")).join(Case, Case.assignee_id == User.id
    ).filter(Case.org_id == current_user.org_id, Case.is_archived == False, Case.status != "resolved").group_by(User.name).all()

    return {
        "total_open": total_open, "unassigned": unassigned, "overdue": overdue, "avg_resolution_days": avg_resolution,
        "workload": [{"name": w.name, "count": w.count} for w in workload]
    }

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

# Update a case only to change assignee, status, group, role
@router.put("/{case_id}", response_model = CaseRead)
def update_case_endpoint(case_id: int, updates: CaseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.is_archived:
        raise HTTPException(status_code = 403, detail = "Cannot update an archived case")
    changes = {}
    if updates.status and updates.status != case.status:
        changes["previous_status"] = case.status
        changes["status"] = updates.status
    if "assignee_id" in updates.model_fields_set:
        assignee_name = "Unassigned"
        if updates.assignee_id:
            user = db.query(User).filter(User.id == updates.assignee_id).first()
            assignee_name = user.name if user else "Unknown"
            notify_assignee(db, case_id, updates.assignee_id, case.title)
        changes["assignee_id"] = updates.assignee_id
        changes["assignee_name"] = assignee_name
    if "group_id" in updates.model_fields_set:
        group_name = "None"
        if updates.group_id:
            from app.models.group import Group
            group = db.query(Group).filter(Group.id == updates.group_id).first()
            group_name = group.name if group else "Unknown"
        changes["group_id"] = updates.group_id
        changes["group_name"] = group_name
    if "custom_role_id" in updates.model_fields_set:
        role_name = "None"
        if updates.custom_role_id:
            from app.models.custom_role import CustomRole
            role = db.query(CustomRole).filter(CustomRole.id == updates.custom_role_id).first()
            role_name = role.name if role else "Unknown"
        changes["custom_role_id"] = updates.custom_role_id
        changes["role_name"] = role_name
    updated = update_case(db, case, updates.model_dump(exclude_unset=True))
    if changes:
        log_activity(db, case_id, current_user.id, "case_updated", {
            "changed_by": current_user.name,
            "changes": changes
        })
    return updated


# Del case
@router.delete("/{case_id}", status_code = 204)
def delete_case_endpoint(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "owner"]:
        raise HTTPException(status_code = 403, detail = "Only admins and owners can delete cases")
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
