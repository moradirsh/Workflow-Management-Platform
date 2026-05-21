from pydantic import BaseModel
from datetime import datetime

# Sends to db body as str
class CommentCreate(BaseModel):
    body: str

# Retrieve comment details from db
class CommentRead(BaseModel):
    id: int
    case_id: int
    author_id: int
    body: str
    created_at: datetime
    author_name: str | None = None
    
    model_config = {
        "from_attributes": True
    }