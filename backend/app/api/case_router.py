from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.case import CaseCreate, CaseRead, CaseUpdate
from app.services.case_service import create_case, get_cases, get_case, update_case
from app.core.database import get_db

router = APIRouter(prefix = "/cases", tags = ["Cases"])

#Create a new case
@router.post("/", response_model = CaseRead)
def create_case_endpoint(case: CaseCreate, db: Session = Depends(get_db)):
    return create_case(db, case.title, case.description, case.assignee_id)

#List all cases
@router.get("/", response_model = List[CaseRead])
def list_cases(db: Session = Depends(get_db)):
    return get_cases(db)

#Get a single case by ID
@router.get("/{case_id}", response_model = CaseRead)
def get_case_endpoint(case_id: int, db: Session = Depends(get_db)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code = 404, detail = "Case not found")
    return case

#Update a case by ID
@router.put("/{case_id}", response_model = CaseRead)
def update_case_endpoint(case_id: int, updates: CaseUpdate, db: Session = Depends(get_db)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code = 404, detail = "Case not found")
    return update_case(db, case, updates.dict(exclude_unset = True))
