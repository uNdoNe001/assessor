from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jinja2 import Environment, FileSystemLoader, select_autoescape
import os

from ..db import get_db

router = APIRouter(prefix="/policies", tags=["policies"])

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "policy_templates")
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape()
)

class PolicyGenIn(BaseModel):
    company_name: str
    policy_name: str  # e.g., "infosec", "access_control", "incident_response"
    scope: str | None = None
    owner: str | None = "CISO"
    review_cycle: str | None = "Annual"
    region: str | None = "US"

@router.post("/generate")
def generate_policy(payload: PolicyGenIn, db: Session = Depends(get_db)):
    filename = f"{payload.policy_name}.md.j2"
    template = env.get_template(filename)
    rendered = template.render(
        CompanyName=payload.company_name,
        Scope=payload.scope or "Organization-wide",
        Owner=payload.owner,
        ReviewCycle=payload.review_cycle,
        Region=payload.region
    )
    return {"policy_markdown": rendered}
