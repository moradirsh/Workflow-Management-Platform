from binascii import Error
from pydantic import BaseModel, field_validator, EmailStr
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
    
# Update self user data
class UserUpdate(BaseModel):
    name: str | None = None
    current_password: str | None = None
    new_password: str | None = None
    
# Admin creating new user
class AdminUserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "member"
    
    # Validate role
    @field_validator("role")
    def validate_role(cls, v):
        if v not in ["admin", "member"]:
            raise ValueError("Role must be admin or member")
        return v
    
    # Add password strength validation
    @field_validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise Error("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise Error("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise Error("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;':,.<>?/" for c in v):
            raise Error("Password must contain at least one special character")
        return v
    
class AdminUserUpdate(BaseModel):
    name: str
    email: str
    role: str = "member"
    password: str | None = None

    @field_validator("email")
    def validate_email(cls, v):
        import re
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("password")
    def password_strength(cls, v):
        if v is None:
            return v
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;':,.<>?/" for c in v):
            raise ValueError("Password must contain at least one special character")
        return v

# Registration of org, creates admin in process
class OrgRegister(BaseModel):
    org_name: str
    name: str
    email: str
    password: str
    
    # Same idea as above, org reg should be more than 1 char
    @field_validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise Error("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise Error("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise Error("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;':,.<>?/" for c in v):
            raise Error("Password must contain at least one special character")
        return v

    @field_validator("org_name")
    def org_name_length(cls, v):
        if len(v) < 2:
            raise Error("Organization name must be at least 2 characters")
        return v.strip()
    
    model_config = {
        "from_attributes": True
        }