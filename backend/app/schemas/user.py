from pydantic import BaseModel
from datetime import datetime

# Data from frontend to create a user
class UserCreate(BaseModel):
    name: str
    email: str
    role: str

# Data out from database to frontend
class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }