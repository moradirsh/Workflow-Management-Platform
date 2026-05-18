from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog

# New activity log entry
def log_activity(db: Session, case_id: int, user_id: int, action: str, details: dict = None):
    log = ActivityLog(case_id = case_id, user_id = user_id, action = action, details = details)
    db.add(log)
    db.commit()
    return log

# get all activity logs for a case ordered by most recent initially
def get_case_activity(db: Session, case_id: int):
    return db.query(ActivityLog).filter(
        ActivityLog.case_id == case_id).order_by(ActivityLog.created_at.desc()).all()