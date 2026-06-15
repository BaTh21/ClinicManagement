from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.prescription import prescription 
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate, PrescriptionResponse
from app.core.dependencies import get_current_user, require_role
from app.models.prescription import Prescription

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.get("/", response_model=list[PrescriptionResponse])
def list_prescriptions(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    order_by: str = Query("created_at"),
    desc: bool = Query(False),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if patient_id:
        # Add a method prescription.get_by_patient with sorting
        return prescription.get_by_patient(db, patient_id, order_by=order_by, descending=desc)
    return prescription.get_multi(db, skip=skip, limit=limit, order_by=order_by, descending=desc)

@router.post("/", response_model=PrescriptionResponse)
def create_prescription(
    prescription_in: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("doctor"))
):
    return prescription.create(db, obj_in=prescription_in)

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_pres = prescription.get(db, id=prescription_id)
    if not db_pres:
        raise HTTPException(404, "Prescription not found")
    return db_pres

@router.put("/{prescription_id}", response_model=PrescriptionResponse)
def update_prescription(
    prescription_id: int,
    prescription_in: PrescriptionUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("doctor"))
):
    db_pres = prescription.get(db, id=prescription_id)
    if not db_pres:
        raise HTTPException(404, "Prescription not found")
    return prescription.update(db, db_obj=db_pres, obj_in=prescription_in)

@router.delete("/{prescription_id}")
def delete_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):
    db_pres = prescription.get(db, id=prescription_id)
    if not db_pres:
        raise HTTPException(404, "Prescription not found")
    prescription.remove(db, id=prescription_id)
    return {"ok": True}