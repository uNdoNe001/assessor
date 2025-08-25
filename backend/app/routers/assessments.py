from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List

from ..db import get_db
from .. import models, schemas
from ..deps import require_role

router = APIRouter(prefix="/assessments", tags=["assessments"])

@router.post("", response_model=schemas.AssessmentSummary)
def create_assessment(payload: schemas.AssessmentCreate, db: Session = Depends(get_db), user=Depends(require_role(["pss_owner","pss_analyst","client_admin"]))):
    assessment = models.Assessment(client_id=payload.client_id, framework=payload.framework)
    db.add(assessment); db.commit(); db.refresh(assessment)
    return schemas.AssessmentSummary(assessment_id=assessment.id, avg_maturity=0.0, top_gaps=[])

@router.post("/{assessment_id}/answers")
def submit_answers(assessment_id: int, answers: List[schemas.AnswerIn], db: Session = Depends(get_db), user=Depends(require_role(["pss_owner","pss_analyst","client_admin","client_contributor"]))):
    for a in answers:
        existing = db.execute(select(models.Answer).where(models.Answer.assessment_id==assessment_id, models.Answer.question_id==a.question_id)).scalar_one_or_none()
        if existing:
            existing.maturity = a.maturity
            existing.risk_impact = a.risk_impact
            existing.risk_likelihood = a.risk_likelihood
            existing.notes = a.notes
        else:
            db.add(models.Answer(
                assessment_id=assessment_id,
                question_id=a.question_id,
                maturity=a.maturity,
                risk_impact=a.risk_impact,
                risk_likelihood=a.risk_likelihood,
                notes=a.notes
            ))
    db.commit()
    return {"status": "ok"}

@router.get("/{assessment_id}/summary", response_model=schemas.AssessmentSummary)
def get_summary(assessment_id: int, db: Session = Depends(get_db), user=Depends(require_role(["pss_owner","pss_analyst","client_admin","client_readonly","auditor_readonly"]))):
    q = select(func.sum(models.Answer.maturity * models.Question.weight).label("weighted_sum"),
               func.sum(models.Question.weight).label("w_sum")).join(models.Question, models.Question.id==models.Answer.question_id).where(models.Answer.assessment_id==assessment_id)
    row = db.execute(q).first()
    avg = 0.0
    if row and row.w_sum:
        avg = float(row.weighted_sum or 0)/float(row.w_sum or 1)

    gap_q = select(models.Question.qid).join(models.Answer, models.Answer.question_id==models.Question.id).where(models.Answer.assessment_id==assessment_id, models.Answer.maturity<=1).limit(10)
    top_gaps = [r[0] for r in db.execute(gap_q).all()]
    return schemas.AssessmentSummary(assessment_id=assessment_id, avg_maturity=avg, top_gaps=top_gaps)

@router.get("/{assessment_id}/backlog")
def prioritized_backlog(assessment_id: int, db: Session = Depends(get_db), user=Depends(require_role(["pss_owner","pss_analyst","client_admin"]))):
    q = select(
        models.Question.qid,
        ( (3 - models.Answer.maturity) * ( (func.coalesce(models.Answer.risk_impact,3)) + (func.coalesce(models.Answer.risk_likelihood,3)) ) * models.Question.weight ).label("score")
    ).join(models.Question, models.Question.id==models.Answer.question_id).where(models.Answer.assessment_id==assessment_id)
    rows = db.execute(q).all()
    items = [{"qid": r.qid, "priority_score": float(r.score)} for r in rows]
    items.sort(key=lambda x: x["priority_score"], reverse=True)
    return {"items": items[:20]}
