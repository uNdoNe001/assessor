from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid, os, shutil
from itsdangerous import TimestampSigner, BadSignature, SignatureExpired

from ..db import get_db
from .. import models
from ..deps import require_role

router = APIRouter(prefix="/evidence", tags=["evidence"])

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
signer = TimestampSigner("evidence-secret-dev")

@router.post("/upload")
def upload_evidence(
    client_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user = Depends(require_role(["pss_owner","pss_analyst","client_admin","client_contributor"]))
):
    uid = str(uuid.uuid4())
    dest_path = os.path.join(UPLOAD_DIR, uid + "_" + file.filename)
    with open(dest_path, "wb") as out:
        shutil.copyfileobj(file.file, out)
    rec = models.Evidence(client_id=client_id, filename=file.filename, stored_path=dest_path)
    db.add(rec); db.commit(); db.refresh(rec)
    token = signer.sign(dest_path).decode()
    return {"evidence_id": rec.id, "download_token": token}

@router.get("/download")
def download(token: str,
    user = Depends(require_role(["pss_owner","pss_analyst","client_admin","client_readonly","auditor_readonly"]))
):
    try:
        path = signer.unsign(token, max_age=3600).decode()
    except SignatureExpired:
        raise HTTPException(status_code=401, detail="Link expired")
    except BadSignature:
        raise HTTPException(status_code=400, detail="Invalid token")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    # For now, just return the path (reports.py has a FileResponse)
    return {"path": path}
