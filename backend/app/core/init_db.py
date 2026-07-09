from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.core.security import get_password_hash


def create_default_admin(db: Session):
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()

    if admin:
        return

    admin = User(
        username="Admin",
        email="admin@gmail.com",
        full_name="Administrator",
        hashed_password=get_password_hash("1234"),
        role=UserRole.ADMIN,
        is_active=1,
    )

    db.add(admin)
    db.commit()

    print("✅ Default admin created")