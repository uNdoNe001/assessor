from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
import jwt, datetime

from ..db import get_db
from .. import models
from ..config import settings
from ..schemas import Token, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterIn(BaseModel):
    email: str
    name: str
    password: str
    role: str = "pss_owner"
    organization_name: str = "Point Solutions Security"

@router.post("/register", response_model=UserOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter_by(name=payload.organization_name).first()
    if not org:
        org = models.Organization(name=payload.organization_name)
        db.add(org); db.commit(); db.refresh(org)
    exists = db.query(models.User).filter_by(email=payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="User already exists")
    user = models.User(
        email=payload.email,
        name=payload.name,
        role=payload.role,
        organization_id=org.id,
        password_hash=bcrypt.hash(payload.password)
    )
    db.add(user); db.commit(); db.refresh(user)
    return user

class LoginIn(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=Token)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(email=payload.email).first()
    if not user or not user.password_hash or not (bcrypt.verify(payload.password, user.password_hash)):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    now = datetime.datetime.utcnow()
    exp = now + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode({"sub": str(user.id), "role": user.role, "org_id": user.organization_id, "exp": exp}, settings.SECRET_KEY, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}
