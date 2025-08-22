from fastapi import Depends, HTTPException, status
from typing import Literal
from fastapi.security import OAuth2PasswordBearer
import jwt
from .config import settings
from sqlalchemy.orm import Session
from .db import get_db
from . import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

Role = Literal["pss_owner","pss_analyst","client_admin","client_contributor","client_readonly","auditor_readonly"]

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    if token in (None, "", "dev") and settings.SECRET_KEY.startswith("dev-"):
        user = db.query(models.User).first()
        if not user:
            raise HTTPException(status_code=401, detail="No users exist; register first")
        return user
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = db.query(models.User).get(int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(allowed: list[Role]):
    def checker(user: models.User = Depends(get_current_user)):
        if user.role not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return user
    return checker
