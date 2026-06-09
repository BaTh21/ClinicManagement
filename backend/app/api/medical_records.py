from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.medical_record import medical_record
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse
from app.core.dependencies import get_current_user, require_role

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])

@router.get("/", response_model=list[MedicalRecordResponse])
def list_medical_records(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if patient_id:
        return medical_record.get_by_patient(db, patient_id)
    return medical_record.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=MedicalRecordResponse)
def create_medical_record(
    record_in: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("doctor"))
):
    # Force created_by to current user's id
    record_in.created_by = current_user.id
    return medical_record.create(db, obj_in=record_in)

@router.get("/{record_id}", response_model=MedicalRecordResponse)
def get_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_record = medical_record.get(db, id=record_id)
    if not db_record:
        raise HTTPException(404, "Medical record not found")
    return db_record

@router.put("/{record_id}", response_model=MedicalRecordResponse)
def update_medical_record(
    record_id: int,
    record_in: MedicalRecordUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("doctor"))
):
    db_record = medical_record.get(db, id=record_id)
    if not db_record:
        raise HTTPException(404, "Medical record not found")
    return medical_record.update(db, db_obj=db_record, obj_in=record_in)

@router.delete("/{record_id}")
def delete_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):
    db_record = medical_record.get(db, id=record_id)
    if not db_record:
        raise HTTPException(404, "Medical record not found")
    medical_record.remove(db, id=record_id)
    return {"ok": True}