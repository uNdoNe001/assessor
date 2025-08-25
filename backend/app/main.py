from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import health, questions, policies, tenants, auth, assessments, evidence, reports
from .db import Base, engine

app = FastAPI(title="Assessor API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,     prefix="/api")
app.include_router(auth.router,       prefix="/api")   # <-- mounts /api/auth/login + /register
app.include_router(tenants.router,    prefix="/api")
app.include_router(questions.router,  prefix="/api")
app.include_router(policies.router,   prefix="/api")
app.include_router(assessments.router,prefix="/api")
app.include_router(evidence.router,   prefix="/api")
app.include_router(reports.router,    prefix="/api")

Base.metadata.create_all(bind=engine)

# Optional: apply RLS SQL if present
try:
    with engine.connect() as conn:
        sql = open("/app/db_sql/rls.sql","r").read()
        conn.exec_driver_sql(sql)
except Exception as e:
    print("RLS setup skipped:", e)
