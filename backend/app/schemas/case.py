from pydantic import BaseModel
from datetime import datetime

# Data coming in from frontend to create a case
class CaseCreate(BaseModel):
    title: str
    description: str | None = None
    assignee_id: int | None = None

# Same here, but to update
class CaseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    assignee_id: int | None = None

# Data going out from database to frontend
class CaseRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    status: str
    assignee_id: int | None = None
    category: str | None = None
    summary: str | None = None
    created_at: datetime
    updated_at: datetime 

    # Look at objects attributes instead of relying on dict
    model_config = {
        "from_attributes": True
    }