from pydantic import BaseModel
from datetime import datetime

# Data from frontend to create a user
class UserCreate(BaseModel):
    name: str
    email: str
    role: str
    password: str

# Data from frontend to login
class UserLogin(BaseModel):
    email: str
    password: str  
    
# Data returned to frontend after login to represent the token
class TokenResponse(BaseModel):
    access_token: str
    token_type: str

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
    
# Update user data
class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    current_password: str | None = None
    new_password: str | None = None
    
# Admin creating new user
class AdminUserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "member"

# Registration of org, creates admin in process
class OrgRegister(BaseModel):
    org_name: str
    name: str
    email: str
    password: str