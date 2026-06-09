# Represents the association between users and custom roles where each entry represents a specific role assigned to a user within an organization
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class GroupMember(Base):
    __tablename__ = "group_members"
    id = Column(Integer, primary_key = True, index = True)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete = "CASCADE"), nullable = False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete = "CASCADE"), nullable = False)

    group = relationship("Group", back_populates = "members")
    user = relationship("User", back_populates = "group_memberships")