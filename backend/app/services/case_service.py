from sqlalchemy.orm import Session
from app.models.case import Case

#This will create a new case within db
def create_case(db: Session, title: str, description: str = None, assignee_id: int = None):
    case = Case(title=title, description=description, assignee_id=assignee_id)
    db.add(case)
    db.commit()
    db.refresh(case)
    return case

#This will return cases in list form
def get_cases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Case).offset(skip).limit(limit).all()

#This will return a case via ID
def get_case(db: Session, case_id: int):
    return db.query(Case).filter(Case.id == case_id).first()

#This will update an existing case
def update_case(db: Session, case: Case, updates: dict):
    for key, value in updates.items():
        setattr(case, key, value)
    db.commit()
    db.refresh(case)
    return case
