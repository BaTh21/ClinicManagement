from app.crud.base import CRUDBase
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import Optional, List
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate

class CRUDPatient(CRUDBase[Patient, PatientCreate, PatientUpdate]):
    def search_by_name(
        self,
        db: Session,
        name: str,
        order_by: Optional[str] = "id",        # default sort column = id
        descending: bool = False               # ASC by default
    ) -> List[Patient]:
        query = db.query(Patient).filter(
            Patient.first_name.ilike(f"%{name}%") | Patient.last_name.ilike(f"%{name}%")
        )
        # Apply sorting
        if order_by:
            column = getattr(Patient, order_by, None)
            if column is None:
                column = Patient.id      # safe fallback
            if descending:
                query = query.order_by(desc(column))
            else:
                query = query.order_by(asc(column))
        else:
            query = query.order_by(asc(Patient.id))
        return query.all()

patient = CRUDPatient(Patient)