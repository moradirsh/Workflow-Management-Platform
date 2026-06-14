# Represents a person in the system who can own cases, log activity, and receive assignments.
from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

# USERS MODEL
class User(Base):
    __tablename__ = "users"
    hashed_password = Column(String, nullable = True)
    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, nullable = False)
    email = Column(String, unique = True, nullable = False)
    role = Column(String, nullable = False)  
    created_at = Column(DateTime(timezone = True), server_default = func.now())
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable = True)

    # Cases assigned to the user based on org
    cases = relationship("Case", back_populates = "assignee", foreign_keys = "[Case.assignee_id]")
    activity_logs = relationship("ActivityLog", back_populates = "user")
    comments = relationship("Comment", back_populates = "author", cascade = "all, delete-orphan")
    organization = relationship("Organization", back_populates = "users")
    group_memberships = relationship("GroupMember", back_populates = "user", cascade = "all, delete-orphan")
    user_roles = relationship("UserRole", back_populates = "user", cascade = "all, delete-orphan")
    notifications = relationship("Notification", back_populates = "user", cascade = "all, delete-orphan")