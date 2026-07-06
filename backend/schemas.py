import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from models import Role, Severity, Status


# ---- Auth ----

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Role = Role.soc_analyst


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: Role

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- Incidents ----

class IncidentCreate(BaseModel):
    title: str
    description: str = ""
    severity: Severity = Severity.medium
    assigned_to: Optional[uuid.UUID] = None


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[Severity] = None
    status: Optional[Status] = None
    assigned_to: Optional[uuid.UUID] = None


class IncidentOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    severity: Severity
    status: Status
    assigned_to: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
