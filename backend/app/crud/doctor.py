from app.crud.base import CRUDBase
from sqlalchemy.orm import Session 
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorUpdate

class CRUDDoctor(CRUDBase[Doctor, DoctorCreate, DoctorUpdate]):
    def get_by_specialization(self, db: Session, specialization: str):
        return db.query(Doctor).filter(Doctor.specialization == specialization).all()

doctor = CRUDDoctor(Doctor)