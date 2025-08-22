from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import json

from ..db import get_db
from .. import models, schemas

router = APIRouter(prefix="/questions", tags=["questions"])

@router.get("", response_model=List[schemas.QuestionOut])
def list_questions(db: Session = Depends(get_db)):
    qs = db.query(models.Question).limit(200).all()
    # Convert JSON strings to lists for response model
    out = []
    for q in qs:
        out.append(schemas.QuestionOut(
            id=q.id,
            qid=q.qid,
            text=q.text,
            help=q.help,
            answers=json.loads(q.answers) if q.answers else [],
            weight=q.weight or 1,
            iso_refs=json.loads(q.iso_refs) if q.iso_refs else [],
            soc2_refs=json.loads(q.soc2_refs) if q.soc2_refs else [],
            evidence_required=bool(q.evidence_required),
        ))
    return out
