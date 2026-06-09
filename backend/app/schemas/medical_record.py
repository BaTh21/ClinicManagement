from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MedicalRecordBase(BaseModel):
    patient_id: int
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None
    created_by: int

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None

class MedicalRecordResponse(MedicalRecordBase):
    id: int
    record_date: datetime
    class Config:
        from_attributes = True