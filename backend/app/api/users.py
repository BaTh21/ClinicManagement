from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from typing import List
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

# GET all users (admin only)
@router.get("/", response_model=List[UserResponse])
def get_users(
    order_by: str = Query("id", description="id, username, email, role"),
    desc: bool = Query(False),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Only admin can list users")
    query = db.query(User)
    if hasattr(User, order_by):
        column = getattr(User, order_by)
        if desc:
            query = query.order_by(desc(column))
        else:
            query = query.order_by(asc(column))
    else:
        query = query.order_by(asc(User.id))
    return query.all()

# CREATE user (admin only)
@router.post("/", response_model=UserResponse)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Only admin can create users")
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(400, "Username or email already exists")
    hashed = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# UPDATE user (admin only)
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Only admin can update users")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user_in.username:
        user.username = user_in.username
    if user_in.email:
        user.email = user_in.email
    if user_in.full_name:
        user.full_name = user_in.full_name
    if user_in.role:
        user.role = user_in.role
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)
    db.commit()
    db.refresh(user)
    return user

# DELETE user (admin only)
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Only admin can delete users")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.id == current_user.id:
        raise HTTPException(400, "You cannot delete your own account")
    db.delete(user)
    db.commit()
    return {"ok": True}

@router.get("/counts")
def get_user_counts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    counts = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    result = {"admin": 0, "doctor": 0, "receptionist": 0}
    for role, count in counts:
        result[role] = count
    return result