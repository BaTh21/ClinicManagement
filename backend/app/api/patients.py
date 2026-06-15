from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.crud.patient import patient
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.core.dependencies import get_current_user, require_role

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/", response_model=list[PatientResponse])
def list_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    order_by: Optional[str] = Query("id", description="Sort by id, first_name, last_name, email"),
    desc: bool = Query(False, description="True for descending order"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if search:
        return patient.search_by_name(db, search, order_by=order_by, descending=desc)
    return patient.get_multi(db, skip=skip, limit=limit, order_by=order_by, descending=desc)

# ✅ Allow any authenticated user to get a single patient
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

# POST, PUT, DELETE remain with role restrictions (receptionist for create, admin for update/delete)
@router.post("/", response_model=PatientResponse)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("receptionist"))
):
    return patient.create(db, obj_in=patient_in)

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
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