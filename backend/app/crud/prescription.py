from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.prescription import Prescription
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate

# Use generic CRUDBase directly
prescription = CRUDBase(Prescription)