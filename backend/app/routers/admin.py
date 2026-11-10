from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, SystemConfig, Complaint
from app.schemas import UserOut, UserRegister
from app.security import require_role, hash_password
from app.clock import get_clock_status, fast_forward, reset_clock, set_clock_offset, get_now
from app.scheduler import run_scheduler_cycle

router = APIRouter(prefix="/api/admin", tags=["Admin Control"])

class RuleUpdate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class FastForwardReq(BaseModel):
    days: int = 1
    hours: int = 0

# Default configuration rules
DEFAULT_CONFIGS = [
    {"key": "reminder_hours_before", "value": "24", "description": "Hours before deadline to dispatch proactive officer reminder"},
    {"key": "overdue_escalation_days", "value": "3", "description": "Overdue days before auto-escalation to Senior Police Supervisor"},
    {"key": "overdue_redflag_days", "value": "7", "description": "Overdue days before Red Flag marker on Command Console"},
    {"key": "silent_complaint_days", "value": "4", "description": "Days of zero officer activity before flagging silent complaint"},
]

@router.get("/clock")
def get_clock():
    """Returns current simulated clock time, offset, and real time."""
    return get_clock_status()


@router.post("/clock/fast-forward")
def admin_fast_forward_clock(
    req: FastForwardReq,
    current_user: User = Depends(require_role(["admin", "senior_supervisor"])),
    db: Session = Depends(get_db)
):
    """
    Fast-forwards simulated demo clock by specified days and/or hours.
    AFTER EACH FAST-FORWARD, THE SCHEDULER RUNS IMMEDIATELY.
    """
    new_sim_time = fast_forward(days=req.days, hours=req.hours, db=db)
    
    # Run scheduler cycle immediately
    scheduler_result = run_scheduler_cycle(db=db)

    return {
        "message": f"Demo clock fast-forwarded by {req.days} days and {req.hours} hours.",
        "simulated_time": new_sim_time.isoformat(),
        "scheduler_run": scheduler_result
    }


@router.post("/clock/reset")
def admin_reset_clock(
    current_user: User = Depends(require_role(["admin", "senior_supervisor"])),
    db: Session = Depends(get_db)
):
    """
    Resets simulated demo clock back to real-time (offset=0).
    Runs scheduler immediately.
    """
    reset_time = reset_clock(db=db)
    scheduler_result = run_scheduler_cycle(db=db)

    return {
        "message": "Demo clock reset to real-time.",
        "simulated_time": reset_time.isoformat(),
        "scheduler_run": scheduler_result
    }


@router.post("/scheduler/run")
def trigger_scheduler(
    current_user: User = Depends(require_role(["admin", "senior_supervisor"])),
    db: Session = Depends(get_db)
):
    """Manually triggers one complete scheduler evaluation cycle."""
    result = run_scheduler_cycle(db=db)
    return {"message": "Accountability scheduler cycle completed successfully.", "details": result}


@router.get("/rules")
def get_rules(
    current_user: User = Depends(require_role(["admin", "senior_supervisor"])),
    db: Session = Depends(get_db)
):
    """Returns all configurable SLA and escalation rules."""
    rules = db.query(SystemConfig).filter(SystemConfig.key != "clock_offset_seconds").all()
    if not rules:
        # Seed defaults
        for dc in DEFAULT_CONFIGS:
            sc = SystemConfig(key=dc["key"], value=dc["value"], description=dc["description"])
            db.add(sc)
        db.commit()
        rules = db.query(SystemConfig).filter(SystemConfig.key != "clock_offset_seconds").all()
    return rules


@router.put("/rules")
def update_rule(
    rule_data: RuleUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Updates an SLA / escalation rule in the configuration table."""
    cfg = db.query(SystemConfig).filter(SystemConfig.key == rule_data.key).first()
    if not cfg:
        cfg = SystemConfig(key=rule_data.key, value=rule_data.value, description=rule_data.description)
        db.add(cfg)
    else:
        cfg.value = rule_data.value
        if rule_data.description:
            cfg.description = rule_data.description
    db.commit()
    return {"message": f"Rule '{rule_data.key}' updated to '{rule_data.value}'.", "rule": cfg}


@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[str] = None,
    current_user: User = Depends(require_role(["admin", "senior_supervisor"])),
    db: Session = Depends(get_db)
):
    """Lists users with optional role filtering."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.id).all()


@router.post("/users", response_model=UserOut)
def create_user(
    user_in: UserRegister,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin creates a new user/officer."""
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    new_user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=hash_password(user_in.password),
        role=user_in.role,
        phone=user_in.phone,
        badge_number=user_in.badge_number,
        unit=user_in.unit,
        area=user_in.area
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
