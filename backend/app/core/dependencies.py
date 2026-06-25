from fastapi import Depends, HTTPException, status, Cookie, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM


def get_current_user(access_token: str = Cookie(None), db = Depends(get_db)):
    if not access_token:
        raise HTTPException(status_code = 401, detail = "Not authenticated")
    
    # Try to decode JWT token
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms = [ALGORITHM])
        
        # Extract subject field from token
        user_id = payload.get("sub")
        
        # If sub is invalid, then fail
        if not user_id:
            raise HTTPException(status_code = 401, detail = "Invalid token")
    except JWTError:
        raise HTTPException(status_code = 401, detail = "Invalid token")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code = 401, detail = "User not found")
    return user