from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.patient import patient
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.core.dependencies import get_current_user, require_role

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/", response_model=list[PatientResponse])
def list_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(require_role("receptionist"))  # receptionist or higher
):
    if search:
        return patient.search_by_name(db, search)
    return patient.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=PatientResponse)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("get_current_user"))
):
    return patient.create(db, obj_in=patient_in)

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_patient = patient.get(db, id=patient_id)
    if not db_patient:
        raise HTTPException(404, "Patient not found")
    return db_patient

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))   # only admin
):
    db_patient = patient.get(db, id=patient_id)
    if not db_patient:
        raise HTTPException(404, "Patient not found")
    return patient.update(db, db_obj=db_patient, obj_in=patient_in)

@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):
    db_patient = patient.get(db, id=patient_id)
    if not db_patient:
        raise HTTPException(404, "Patient not found")
    patient.remove(db, id=patient_id)
    return {"ok": True}