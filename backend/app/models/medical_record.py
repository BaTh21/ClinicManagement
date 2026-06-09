from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import func
from app.core.database import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    diagnosis = Column(Text)
    treatment = Column(Text)
    notes = Column(Text)
    record_date = Column(DateTime, server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))

    patient = relationship("Patient", back_populates="medical_records")