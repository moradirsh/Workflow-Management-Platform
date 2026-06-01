# Case defines the primary workflow item, its state, assignee, and related AI and activity records.
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

# CASE MODEL
class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key = True, index = True)
    title = Column(String, nullable = False)
    description = Column(Text)
    status = Column(String, default = "open")  # open, in progress, resolved
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable = True)
    created_at = Column(DateTime(timezone = True), server_default = func.now())
    updated_at = Column(DateTime(timezone = True), server_default = func.now(), onupdate = func.now())
    priority = Column(String, default = "low")   # low, medium, high
    category = Column(String, nullable = True)       # Haiku handles this
    summary = Column(String, nullable = True)        # Haiku also handles this
    recommendation = Column(String, nullable = True) # Haiku also handles this
    created_by = Column(Integer, ForeignKey("users.id"), nullable = True)
    file_path = Column(String, nullable = True)
    file_name = Column(String, nullable = True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable = True)

    # Will point to assigned user
    assignee = relationship("User", back_populates = "cases", foreign_keys = [assignee_id], uselist = False)
    ai_analysis = relationship("AIAnalysis", back_populates = "case", uselist = False, cascade = "all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates = "case", cascade = "all, delete-orphan")
    comments = relationship("Comment", back_populates = "case", cascade = "all, delete-orphan")