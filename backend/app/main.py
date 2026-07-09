import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal
from app.core.init_db import create_default_admin

from app.core.database import engine, Base
from app.api import (
    auth,
    patients,
    doctors,
    appointments,
    medical_records,
    prescriptions,
    billing,
    reports,
    users,
)

import app.models

app = FastAPI(title="Clinic Management System")


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        create_default_admin(db)
    finally:
        db.close()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(medical_records.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(billing.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Clinic Management API"}