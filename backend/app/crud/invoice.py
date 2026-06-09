from app.crud.base import CRUDBase
from sqlalchemy.orm import Session 
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate

class CRUDInvoice(CRUDBase[Invoice, InvoiceCreate, InvoiceUpdate]):
    def get_by_patient(self, db: Session, patient_id: int):
        return db.query(Invoice).filter(Invoice.patient_id == patient_id).all()

invoice = CRUDInvoice(Invoice)