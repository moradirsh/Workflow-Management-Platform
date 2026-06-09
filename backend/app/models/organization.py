# Represents an organization that users belong to; ths consists of users, owner, admins, groups, cases, and custome roles
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, nullable = True, unique = True)
    created_at = Column(DateTime(timezone = True), server_default = func.now())  
    
    # All users belong to x org
    users = relationship("User", back_populates = "organization", cascade = "all, delete-orphan")
    cases = relationship("Case", back_populates = "organization", cascade = "all, delete-orphan", passive_deletes = True)
    groups = relationship("Group", back_populates = "organization", cascade = "all, delete-orphan")
    custom_roles = relationship("CustomRole", back_populates = "organization", cascade = "all, delete-orphan")