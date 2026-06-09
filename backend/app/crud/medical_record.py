from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.medical_record import MedicalRecord
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate

class CRUDMedicalRecord(CRUDBase[MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate]):
    def get_by_patient(self, db: Session, patient_id: int):
        return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).all()

medical_record = CRUDMedicalRecord(MedicalRecord)