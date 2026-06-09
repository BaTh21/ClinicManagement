from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    specialization = Column(String(100))
    phone = Column(String(20))
    email = Column(String(100), unique=True)
    qualification = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    appointments = relationship("Appointment", back_populates="doctor")