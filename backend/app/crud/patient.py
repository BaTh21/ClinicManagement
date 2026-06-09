from app.crud.base import CRUDBase
from sqlalchemy.orm import Session 
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate

class CRUDPatient(CRUDBase[Patient, PatientCreate, PatientUpdate]):
    # Add custom methods if needed (e.g., search by name)
    def search_by_name(self, db: Session, name: str):
        return db.query(Patient).filter(
            Patient.first_name.ilike(f"%{name}%") | Patient.last_name.ilike(f"%{name}%")
        ).all()

patient = CRUDPatient(Patient)