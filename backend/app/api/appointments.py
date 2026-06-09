from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.crud.appointment import appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.core.dependencies import get_current_user, require_role

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("/", response_model=list[AppointmentResponse])
def list_appointments(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if patient_id:
        return appointment.get_by_patient(db, patient_id)
    if doctor_id and date:
        return appointment.get_by_doctor_and_date(db, doctor_id, date)
    return appointment.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    appointment_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("receptionist"))
):
    return appointment.create(db, obj_in=appointment_in)

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_appt = appointment.get(db, id=appointment_id)
    if not db_appt:
        raise HTTPException(404, "Appointment not found")
    return db_appt

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    appointment_in: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("receptionist"))
):
    db_appt = appointment.get(db, id=appointment_id)
    if not db_appt:
        raise HTTPException(404, "Appointment not found")
    return appointment.update(db, db_obj=db_appt, obj_in=appointment_in)

@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):
    db_appt = appointment.get(db, id=appointment_id)
    if not db_appt:
        raise HTTPException(404, "Appointment not found")
    appointment.remove(db, id=appointment_id)
    return {"ok": True}