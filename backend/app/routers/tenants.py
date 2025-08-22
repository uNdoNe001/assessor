from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models

router = APIRouter(prefix="/tenants", tags=["tenants"])

@router.post("/bootstrap")
def bootstrap(db: Session = Depends(get_db)):
    # Create a default org, user, and a sample client for quick start (idempotent-ish)
    org = db.query(models.Organization).filter_by(name="Point Solutions Security").first()
    if not org:
        org = models.Organization(name="Point Solutions Security")
        db.add(org)
        db.commit()
        db.refresh(org)

    user = db.query(models.User).filter_by(email="owner@pss.local").first()
    if not user:
        user = models.User(email="owner@pss.local", name="PSS Owner", role="pss_owner", organization_id=org.id)
        db.add(user)

    client = db.query(models.Client).filter_by(name="Demo Client").first()
    if not client:
        client = models.Client(name="Demo Client", industry="SaaS", region="US", organization_id=org.id)
        db.add(client)

    db.commit()
    return {"message": "Bootstrap complete", "org_id": org.id}
