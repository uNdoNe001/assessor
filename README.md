# Assessor

Compliance Gap Analysis Tool — multi-tenant, RBAC-enabled micro-assessments (ISO 27001 + SOC 2), policy generation, and reporting.


## Stack
- **Frontend**: Next.js (TypeScript)
- **Backend**: FastAPI (Python 3.11)
- **DB**: PostgreSQL
- **Container**: Docker Compose

> This is an MVP scaffold with a minimal question bank and basic policy generator.
> It’s meant to get you running quickly; we can iterate features, RBAC, and RLS next.

---

## Quick start

1) Copy `.env.example` to `.env` and adjust values.
```bash
cp .env.example .env
```

2) Build and run:
```bash
docker compose up --build
```

3) Visit:
- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs

### Useful commands
```bash
# Stop containers
docker compose down

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild only backend
docker compose build backend && docker compose up backend -d
```

## What’s included
- **Micro-assessment API**: `/api/questions` and `/api/assessments` (stub)
- **Policy generation**: `/api/policies/generate` — fills a Jinja template with variables
- **RBAC primitives**: orgs, users, roles in schema; a simple dependency to enforce role checks
- **Seed data**: minimal ISO/SOC2 micro-questions (edit `/backend/seed/questions.json`)
- **Postgres** with basic org/client tables (create_all for MVP — add Alembic later)
- **Frontend**: placeholder dashboard + assessment card flow mock

## Next steps (suggested)
- Swap `create_all` for **Alembic** migrations and add **Postgres Row-Level Security (RLS)** policies.
- Implement real auth (JWT + password hashing + SSO option) and complete RBAC checks.
- Add evidence upload to S3 (or MinIO in dev).
- Build PDF report generation and DOCX export.
- Expand question bank & control mappings.
- Add task backlog & prioritization heuristics.

---

Licensed: MIT (adjust as needed).
