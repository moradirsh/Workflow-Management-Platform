# Represents a custom role within an organization so custom roles can be created by the organization owner or admins to define specific permissions for users
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class CustomRole(Base):
    __tablename__ = "custom_roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete = "CASCADE"), nullable = False)
    created_at = Column(DateTime(timezone = True), server_default = func.now())

    organization = relationship("Organization", back_populates = "custom_roles")
    user_roles = relationship("UserRole", back_populates = "role", cascade = "all, delete-orphan")