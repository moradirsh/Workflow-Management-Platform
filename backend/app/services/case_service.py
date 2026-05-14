# Contains the core CRUD logic for case records,
# Keeps database operations separate from API routing.
from typing import Any
from sqlalchemy.orm import Session
from app.models.case import Case
from app.ai.classification import classify_case
from app.ai.summarization import summarize_case
from app.ai.recommendations import get_recommendation


# Create a new case within db
def create_case(db: Session, title: str, description: str | None = None, assignee_id: int | None = None, priority: str | None = None):
    case = Case(title = title, description = description, assignee_id = assignee_id, priority = priority)
    db.add(case)
    db.commit()
    db.refresh(case)
    
    # To auto classify category, summary, and recommendation after creation
    if description:
        category = classify_case(title, description)
        summary = summarize_case(title, description)
        recommendation = get_recommendation(title, category, summary)
        case.category = category
        case.summary = summary
        case.recommendation = recommendation
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

def delete_case(db: Session, case: Case):
    db.delete(case)
    db.commit()
