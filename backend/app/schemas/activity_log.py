from pydantic import BaseModel
from datetime import datetime

class ActivityLogRead(BaseModel):
    id: int
    case_id: int
    user_id: int | None = None
    action: str
    details: dict | None = None
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }