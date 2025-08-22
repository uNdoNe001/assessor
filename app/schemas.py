from pydantic import BaseModel, Field
from typing import List, Optional

class QuestionOut(BaseModel):
    id: int
    qid: str
    text: str
    help: Optional[str] = None
    answers: List[str] = Field(default_factory=list)
    weight: int = 1
    iso_refs: List[str] = Field(default_factory=list)
    soc2_refs: List[str] = Field(default_factory=list)
    evidence_required: bool = False
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    organization_id: int
    class Config:
        from_attributes = True

class AssessmentCreate(BaseModel):
    client_id: int
    framework: str

class AnswerIn(BaseModel):
    question_id: int
    maturity: int
    risk_impact: int | None = None
    risk_likelihood: int | None = None
    notes: str | None = None

class AssessmentSummary(BaseModel):
    assessment_id: int
    avg_maturity: float
    top_gaps: List[str] = Field(default_factory=list)
