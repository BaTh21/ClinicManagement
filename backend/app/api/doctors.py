from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.crud.doctor import doctor
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from app.core.dependencies import get_current_user, require_role

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/", response_model=list[DoctorResponse])
def list_doctors(
    skip: int = 0,
    limit: int = 100,
    specialization: Optional[str] = None,
    order_by: Optional[str] = Query("id", description="Sort by id, first_name, last_name, specialization"),
    desc: bool = Query(False),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if specialization:
        return doctor.get_by_specialization(db, specialization, order_by=order_by, descending=desc)
    return doctor.get_multi(db, skip=skip, limit=limit, order_by=order_by, descending=desc)

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_doctor = doctor.get(db, id=doctor_id)
    if not db_doctor:
        raise HTTPException(404, "Doctor not found")
    return db_doctor

# POST, PUT, DELETE remain with admin only
@router.post("/", response_model=DoctorResponse)
def create_doctor(
    doctor_in: DoctorCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin"))
):
    return doctor.create(db, obj_in=doctor_in)

@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(
    doctor_id: int,
    doctor_in: DoctorUpdate,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin"))
):
    db_doctor = doctor.get(db, id=doctor_id)
    if not db_doctor:
        raise HTTPException(404, "Doctor not found")
    return doctor.update(db, db_obj=db_doctor, obj_in=doctor_in)

@router.delete("/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin"))
):
    db_doctor = doctor.get(db, id=doctor_id)
    if not db_doctor:
        raise HTTPException(404, "Doctor not found")
    doctor.remove(db, id=doctor_id)
    return {"message": "Doctor removed"}