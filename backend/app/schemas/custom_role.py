from pydantic import BaseModel
from datetime import datetime

class RoleCreate(BaseModel):
    name: str

class RoleRead(BaseModel):
    id: int
    name: str
    org_id: int
    created_at: datetime

    model_config = {"from_attributes": True}