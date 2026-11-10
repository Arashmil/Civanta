from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, UserOut, TokenResponse
from app.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

DEMO_ACCOUNTS = {
    "citizen": "citizen@demo.com",
    "junior_officer": "junior@demo.com",
    "senior_supervisor": "supervisor@demo.com",
    "admin": "admin@demo.com"
}

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Registers a new user (Citizen by default, or officer if specified)."""
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=hash_password(user_in.password),
        role=user_in.role,
        phone=user_in.phone,
        badge_number=user_in.badge_number,
        unit=user_in.unit,
        area=user_in.area
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    """Standard credentials login."""
    user = db.query(User).filter(User.email == creds.email.lower().strip()).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/demo-login", response_model=TokenResponse)
def demo_login(
    role: str = Query("citizen", pattern="^(citizen|junior_officer|senior_supervisor|admin)$"),
    db: Session = Depends(get_db)
):
    """
    1-Click Demo Login switcher for prototype demonstration.
    Logs in as the pre-configured role account without requiring typed credentials.
    """
    email = DEMO_ACCOUNTS.get(role)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid demo role requested.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Fallback to any user matching role
        user = db.query(User).filter(User.role == role).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"Demo account for role '{role}' not found. Please ensure seed data is loaded."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile of currently authenticated user."""
    return current_user
