from pydantic import BaseModel

class CaseArchive(BaseModel):
    is_archived: bool = True