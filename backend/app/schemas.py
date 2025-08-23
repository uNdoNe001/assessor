from pydantic import BaseModel, Field
from typing import List, Optional
from pydantic import BaseModel, Field
from typing import List, Optional

# --- add these if missing ---
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
# --- end additions ---

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
