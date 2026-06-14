from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.group_member import GroupMember
from app.models.user_role import UserRole

def notify_user(db: Session, user_id: int, message: str, case_id: int | None = None):
    notification = Notification(user_id = user_id, message = message,case_id = case_id)
    db.add(notification)
    db.commit()

def notify_assignee(db: Session, case_id: int, assignee_id: int, case_title: str):
    notify_user(db, assignee_id, f"You have been assigned to case: {case_title}", case_id)

def notify_group(db: Session, case_id: int, group_id: int, case_title: str):
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    for member in members:
        notify_user(db, member.user_id, f"A new case has been assigned to your group: {case_title}", case_id)

def notify_role(db: Session, case_id: int, role_id: int, case_title: str):
    user_roles = db.query(UserRole).filter(UserRole.role_id == role_id).all()
    for ur in user_roles:
        notify_user(db, ur.user_id, f"A new case has been assigned to your role: {case_title}", case_id)