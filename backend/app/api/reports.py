from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.appointment import Appointment
from app.models.invoice import Invoice
from app.models.patient import Patient
from app.models.doctor import Doctor

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/appointments-by-date")
def appointment_report(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin"))
):
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    results = db.query(
        func.date(Appointment.appointment_time).label("date"),
        func.count(Appointment.id).label("count")
    ).filter(Appointment.appointment_time.between(start_date, end_date))\
     .group_by(func.date(Appointment.appointment_time)).all()
    return [{"date": r.date, "count": r.count} for r in results]

@router.get("/revenue")
def revenue_report(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin"))
):
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    total = db.query(func.sum(Invoice.amount)).filter(
        Invoice.created_at.between(start_date, end_date),
        Invoice.status == "paid"
    ).scalar() or 0.0
    return {"total_revenue": float(total), "start_date": start_date, "end_date": end_date}

@router.get("/new-patients")
def new_patients_report(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin"))
):
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    results = db.query(
        func.date(Patient.created_at).label("date"),
        func.count(Patient.id).label("count")
    ).filter(Patient.created_at.between(start_date, end_date))\
     .group_by(func.date(Patient.created_at)).all()
    return [{"date": r.date, "new_patients": r.count} for r in results]

@router.get("/top-doctors")
def top_doctors(limit: int = 5, db: Session = Depends(get_db), _ = Depends(require_role("admin"))):
    results = db.query(
        Doctor.id, Doctor.first_name, Doctor.last_name,
        func.count(Appointment.id).label("appointment_count")
    ).join(Appointment, Doctor.id == Appointment.doctor_id)\
     .group_by(Doctor.id)\
     .order_by(func.count(Appointment.id).desc())\
     .limit(limit).all()
    return [{"id": r.id, "name": f"{r.first_name} {r.last_name}", "appointments": r.appointment_count} for r in results]