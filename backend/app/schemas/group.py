from pydantic import BaseModel
from datetime import datetime

# Im tired of writing comments 25/8 this is self explanatory
class GroupCreate(BaseModel):
    name: str

class GroupRead(BaseModel):
    id: int
    name: str
    org_id: int
    created_at: datetime

    model_config = {"from_attributes": True}

class GroupMemberRead(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = {"from_attributes": True}