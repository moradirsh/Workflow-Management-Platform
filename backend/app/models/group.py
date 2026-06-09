# Represents a group within an organization. Groups can be used to manage permissions for multiple users at once
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, nullable = False)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete = "CASCADE"), nullable = False)
    created_at = Column(DateTime(timezone = True), server_default = func.now())

    organization = relationship("Organization", back_populates = "groups")
    members = relationship("GroupMember", back_populates = "group", cascade = "all, delete-orphan")