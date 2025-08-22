import json, os
from sqlalchemy.orm import Session
from app.db import SessionLocal, engine
from app.models import Question
from sqlalchemy import select
from app.db import Base

def main():
    Base.metadata.create_all(bind=engine)
    path = os.path.join(os.path.dirname(__file__), "questions.json")
    with open(path) as f:
        data = json.load(f)
    db: Session = SessionLocal()
    try:
        for item in data:
            exists = db.execute(select(Question).where(Question.qid == item["qid"])).scalar_one_or_none()
            if exists:
                continue
            q = Question(
                qid=item["qid"],
                text=item["text"],
                help=item.get("help"),
                answers=json.dumps(item.get("answers", [])),
                weight=item.get("weight", 1),
                iso_refs=json.dumps(item.get("iso_refs", [])),
                soc2_refs=json.dumps(item.get("soc2_refs", [])),
                evidence_required=bool(item.get("evidence_required", False)),
            )
            db.add(q)
        db.commit()
        print("Seeded questions.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
