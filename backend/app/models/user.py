# User represents a person in the system who can own cases, log activity, and receive assignments.
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

# USERS MODEL
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, nullable = False)
    email = Column(String, unique = True, nullable = False)
    role = Column(String, nullable = False)  
    created_at = Column(DateTime(timezone = True), server_default = func.now())

    #Cases assigned to the user
    cases = relationship("Case", back_populates="assignee", foreign_keys="Case.assignee_id")
    activity_logs = relationship("ActivityLog", back_populates="user")
