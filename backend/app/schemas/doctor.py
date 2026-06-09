from pydantic import BaseModel, EmailStr
from typing import Optional

class DoctorBase(BaseModel):
    first_name: str
    last_name: str
    specialization: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    qualification: Optional[str] = None
    user_id: Optional[int] = None

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialization: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    qualification: Optional[str] = None
    user_id: Optional[int] = None

class DoctorResponse(DoctorBase):
    id: int
    class Config:
        from_attributes = True