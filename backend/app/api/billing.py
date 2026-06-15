from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.invoice import invoice
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from app.core.dependencies import get_current_user, require_role
from app.models.invoice import Invoice

router = APIRouter(prefix="/invoices", tags=["Billing"])

@router.get("", response_model=list[InvoiceResponse])
def list_invoices(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    order_by: str = Query("id", description="id, patient_id, amount, status, created_at"),
    desc: bool = Query(False),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Invoice)
    if patient_id:
        query = query.filter(Invoice.patient_id == patient_id)
    if status:
        query = query.filter(Invoice.status == status)

    # Apply sorting
    if hasattr(Invoice, order_by):
        column = getattr(Invoice, order_by)
        if desc:
            query = query.order_by(desc(column))
        else:
            query = query.order_by(asc(column))
    else:
        # fallback default sort by id ASC
        query = query.order_by(asc(Invoice.id))

    return query.offset(skip).limit(limit).all()

@router.post("", response_model=InvoiceResponse)
def create_invoice(
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):
    return invoice.create(db, obj_in=invoice_in)

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_inv = invoice.get(db, id=invoice_id)
    if not db_inv:
        raise HTTPException(404, "Invoice not found")
    return db_inv

@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_in: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):
    db_inv = invoice.get(db, id=invoice_id)
    if not db_inv:
        raise HTTPException(404, "Invoice not found")
    return invoice.update(db, db_obj=db_inv, obj_in=invoice_in)

@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):
    db_inv = invoice.get(db, id=invoice_id)
    if not db_inv:
        raise HTTPException(404, "Invoice not found")
    invoice.remove(db, id=invoice_id)
    return {"ok": True}