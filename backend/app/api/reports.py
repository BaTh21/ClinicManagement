from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
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

@router.get("/appointments-trend")
def appointments_trend(
    range: str = Query("week", pattern="^(day|week|month|year)$"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Returns appointment counts grouped by day, week, month, or year."""
    end_date = datetime.now()
    if range == "day":
        start_date = end_date - timedelta(days=1)
        group_by = func.date_trunc('hour', Appointment.appointment_time)
        label_format = "%Y-%m-%d %H:00"
    elif range == "week":
        start_date = end_date - timedelta(days=7)
        group_by = func.date(Appointment.appointment_time)
        label_format = "%Y-%m-%d"
    elif range == "month":
        start_date = end_date - timedelta(days=30)
        group_by = func.date(Appointment.appointment_time)
        label_format = "%Y-%m-%d"
    else:  # year
        start_date = end_date - timedelta(days=365)
        group_by = func.date_trunc('month', Appointment.appointment_time)
        label_format = "%Y-%m"

    results = db.query(
        group_by.label("period"),
        func.count(Appointment.id).label("count")
    ).filter(
        Appointment.appointment_time >= start_date
    ).group_by("period").order_by("period").all()

    data = [{"period": r.period.strftime(label_format), "count": r.count} for r in results]
    return {"data": data, "range": range}

@router.get("/revenue-trend")
def revenue_trend(
    year: int = Query(default=None),
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):
    """Monthly revenue for a given year (default: current year)."""
    if not year:
        year = datetime.now().year
    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31)
    results = db.query(
        func.date_trunc('month', Invoice.created_at).label("month"),
        func.sum(Invoice.amount).label("total")
    ).filter(
        Invoice.created_at.between(start_date, end_date),
        Invoice.status == "paid"
    ).group_by("month").order_by("month").all()
    
    data = [{"month": r.month.strftime("%Y-%m"), "revenue": float(r.total)} for r in results]
    return {"data": data, "year": year}

@router.get("/patient-growth")
def patient_growth(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Returns cumulative patient count per month (running total)."""
    patients = db.query(Patient.created_at).order_by(Patient.created_at).all()
    if not patients:
        return {"data": []}
    
    from collections import defaultdict
    monthly_new = defaultdict(int)
    for p in patients:
        month_key = p.created_at.strftime("%Y-%m")
        monthly_new[month_key] += 1
    
    months = sorted(monthly_new.keys())
    cumulative = 0
    data = []
    for month in months:
        cumulative += monthly_new[month]
        data.append({"month": month, "cumulative": cumulative})
    
    return {"data": data}

@router.get("/patient-stats")
def patient_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Returns gender distribution, new patients this month, and monthly registrations."""
    gender_counts = db.query(
        Patient.gender,
        func.count(Patient.id).label("count")
    ).filter(Patient.gender.isnot(None)).group_by(Patient.gender).all()
    gender_distribution = [{"name": g.gender, "value": g.count} for g in gender_counts]
    
    today = datetime.now()
    first_day_of_month = datetime(today.year, today.month, 1)
    new_this_month = db.query(func.count(Patient.id)).filter(
        Patient.created_at >= first_day_of_month
    ).scalar() or 0
    
    last_year = first_day_of_month - timedelta(days=365)
    monthly = db.query(
        func.date_trunc('month', Patient.created_at).label("month"),
        func.count(Patient.id).label("count")
    ).filter(Patient.created_at >= last_year)\
     .group_by("month").order_by("month").all()
    
    monthly_registrations = []
    for m in monthly:
        month_str = m.month.strftime("%Y-%m")
        monthly_registrations.append({"month": month_str, "count": m.count})
    
    return {
        "gender_distribution": gender_distribution,
        "new_this_month": new_this_month,
        "monthly_registrations": monthly_registrations
    }