from pydantic import BaseModel
from typing import Optional

#This will help create a case
class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assignee_id: Optional[int] = None

#This will help update a case
class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[int] = None

#This will help read a case
class CaseRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    assignee_id: Optional[int]

class CaseSchema(BaseModel):
    id: int
    title: str
        
    model_config = {
        "from_attributes": True
    }  