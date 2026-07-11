import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.database import get_db
from backend.auth import get_current_user

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("/", response_model=List[schemas.IncidentOut])
def list_incidents(
    status: Optional[models.Status] = None,
    severity: Optional[models.Severity] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Incident)
    if status:
        query = query.filter(models.Incident.status == status)
    if severity:
        query = query.filter(models.Incident.severity == severity)
    return query.order_by(models.Incident.created_at.desc()).all()


@router.get("/summary")
def incidents_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    incidents = db.query(models.Incident).all()
    summary = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for i in incidents:
        summary[i.severity.value] += 1
    summary["total"] = len(incidents)
    return summary


@router.post("/", response_model=schemas.IncidentOut, status_code=201)
def create_incident(
    payload: schemas.IncidentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    incident = models.Incident(**payload.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.patch("/{incident_id}", response_model=schemas.IncidentOut)
def update_incident(
    incident_id: uuid.UUID,
    payload: schemas.IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)

    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}", status_code=204)
def delete_incident(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(incident)
    db.commit()
