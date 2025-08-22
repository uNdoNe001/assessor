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
