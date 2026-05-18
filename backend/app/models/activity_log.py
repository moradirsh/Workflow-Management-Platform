# Records meaningful actions and context for cases,
# This includes who performed them and when.
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key = True, index = True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete = "CASCADE"), nullable = False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable = True)
    action = Column(String, nullable = False)  # Case created part for status changes
    details = Column(JSON, nullable = True)    # Extra content based on if case gets updated
    created_at = Column(DateTime(timezone = True), server_default = func.now())

    case = relationship("Case", back_populates = "activity_logs")
    user = relationship("User", back_populates = "activity_logs")