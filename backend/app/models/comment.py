# Under each case, user can leave a comment to facilitate feedback; linked to both case and user
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key = True, index = True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete = "CASCADE"), nullable = False)
    author_id = Column(Integer, ForeignKey("users.id", ondelete = "CASCADE"), nullable = False)
    body = Column(Text, nullable = False)
    created_at = Column(DateTime(timezone = True), server_default = func.now())
    
    case = relationship("Case", back_populates = "comments")
    author = relationship("User", back_populates = "comments")
    