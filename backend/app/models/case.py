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
    priority = Column(String, default = "medium")   # low, medium, high
    category = Column(String, nullable = True)       # contract, billing, FUTURE HYPOTHETICAL RIGHT NOW
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    #Will point to assigned user
    assignee = relationship("User", back_populates = "cases", uselist=False)
    ai_analysis = relationship("AIAnalysis", back_populates = "case", uselist=False)
