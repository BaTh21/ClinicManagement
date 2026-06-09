from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class InvoiceBase(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    amount: Decimal
    status: str = "unpaid"
    description: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    amount: Optional[Decimal] = None
    status: Optional[str] = None
    description: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True