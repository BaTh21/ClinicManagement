from sqlalchemy.orm import Session
from datetime import datetime
from app.crud.base import CRUDBase
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate

class CRUDAppointment(CRUDBase[Appointment, AppointmentCreate, AppointmentUpdate]):
    def get_by_doctor_and_date(self, db: Session, doctor_id: int, date: datetime):
        start = datetime(date.year, date.month, date.day, 0, 0, 0)
        end = datetime(date.year, date.month, date.day, 23, 59, 59)
        return db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_time.between(start, end)
        ).all()

    def get_by_patient(self, db: Session, patient_id: int):
        return db.query(Appointment).filter(Appointment.patient_id == patient_id).all()

appointment = CRUDAppointment(Appointment)