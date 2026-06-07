from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.organization import Organization

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.delete("/me", status_code=204)
def delete_organization(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    # Only admins can delete the org
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete the organization")
    
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    db.delete(org)
    db.commit()