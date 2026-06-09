# Represents the association between users and custom roles in which each entry represents a specific role assigned to a user within an organization
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete = "CASCADE"), nullable = False)
    role_id = Column(Integer, ForeignKey("custom_roles.id", ondelete = "CASCADE"), nullable = False)

    user = relationship("User", back_populates = "user_roles")
    role = relationship("CustomRole", back_populates = "user_roles")