from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import health, questions, policies, tenants

app = FastAPI(title="PSS Assessor API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(tenants.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(policies.router, prefix="/api")

# Create DB tables at startup (MVP); replace with Alembic migrations later
from .db import Base, engine  # noqa: E402
Base.metadata.create_all(bind=engine)
