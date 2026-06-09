from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PrescriptionBase(BaseModel):
    patient_id: int
    doctor_id: int
    medication: str
    dosage: str
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionUpdate(BaseModel):
    medication: Optional[str] = None
    dosage: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionResponse(PrescriptionBase):
    id: int
    issue_date: datetime
    class Config:
        from_attributes = True