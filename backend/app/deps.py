from fastapi import Depends, HTTPException, status
from typing import Literal

# Placeholder role check; extend with JWT auth & org scoping
Role = Literal["pss_owner","pss_analyst","client_admin","client_contributor","client_readonly","auditor_readonly"]

def require_role(allowed: list[Role]):
    def checker():
        # MVP allows all; replace with real auth (JWT) and role extraction
        # Raise if not authorized:
        # raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return True
    return checker
