from typing import Any
from sqlalchemy.orm import Session
from app.models.case import Case


# Create a new case within db
def create_case(db: Session, title: str, description: str | None = None, assignee_id: int | None = None):
    case = Case(title=title, description=description, assignee_id=assignee_id)
    db.add(case)
    db.commit()
    db.refresh(case)
    return case

# Return cases in list form
def get_cases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Case).offset(skip).limit(limit).all()

# Return a case via ID
def get_case(db: Session, case_id: int):
    return db.query(Case).filter(Case.id == case_id).first()

# Update an existing case
def update_case(db: Session, case: Case, updates: dict[str, Any]):
    for key, value in updates.items():
        setattr(case, key, value)
    db.commit()
    db.refresh(case)
    return case
