from pydantic import BaseModel
from datetime import datetime

class NotificationRead(BaseModel):
    id: int
    message: str
    case_id: int | None = None
    is_read: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
        }