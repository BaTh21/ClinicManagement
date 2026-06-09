from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import func
from app.core.database import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    medication = Column(String(200))
    dosage = Column(String(100))
    instructions = Column(Text)
    issue_date = Column(DateTime, server_default=func.now()) 

    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor")