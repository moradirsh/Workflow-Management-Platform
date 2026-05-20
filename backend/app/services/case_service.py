# Contains the core CRUD logic for case records,
# Keeps database operations separate from API routing.
from typing import Any
from sqlalchemy.orm import Session
from app.models.case import Case
from app.ai.classification import classify_case
from app.ai.summarization import summarize_case
from app.ai.recommendations import get_recommendation


# Create a new case within db
def create_case(db: Session, title: str, description: str | None = None, assignee_id: int | None = None, priority: str | None = None, file_content: str | None = None, file_path: str | None = None, file_name: str | None = None):
    case = Case(title = title, description = description, assignee_id = assignee_id, priority = priority, file_path = file_path, file_name = file_name)
    db.add(case)
    db.commit()
    db.refresh(case)
    
    # To auto classify category, summary, and recommendation after creation: Added on file content
    if description or file_content:
        combined_content = ""
        if description:
            combined_content += description
        if file_content:
            combined_content += f"\n\nFile content: \n{file_content}"
        
        category = classify_case(title, combined_content)
        summary = summarize_case(title, combined_content)
        recommendation = get_recommendation(title, category, summary)
        case.category = category
        case.summary = summary
        case.recommendation = recommendation
        db.commit()
        db.refresh(case)
    
    return case

# Return cases in list form
def get_cases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Case).order_by(Case.created_at.desc()).offset(skip).limit(limit).all()

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

# Remove case from db
def delete_case(db: Session, case: Case):
    db.delete(case)
    db.commit()
