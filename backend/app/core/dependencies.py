from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# Dependency to get the current user from the token
bearer_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), 
                     db: Session = Depends(get_db)) -> User:
    
    # Extract the token from the credentials
    token = credentials.credentials
    
    # Decode the token to get the payload
    # If invalid or expired itll return none, raising exception
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
        
    # Extract user ID from the payload and fetch the user from the database
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    # The case that the token is valid but user no longer exists in the database
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
        
    return user