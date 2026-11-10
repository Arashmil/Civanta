from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.database import get_db
from app.models import Complaint, User, ActionLog, DailySupervisorSummary
from app.schemas import ComplaintOut, DailySummaryOut
from app.security import require_role
from app.clock import get_now
from app.scheduler import generate_daily_supervisor_summary

router = APIRouter(prefix="/api/supervisor", tags=["Supervisor Command"])

@router.get("/needs-attention", response_model=List[ComplaintOut])
def get_needs_attention(
    current_user: User = Depends(require_role(["senior_supervisor", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Supervisor 'Needs Attention Now' queue:
    Returns overdue and escalated complaints sorted by highest severity:
    1. Overdue >= 7 days (Red flag, level 2)
    2. Overdue >= 3 days (Escalated, level 1)
    3. Urgent priority overdue
    4. General overdue
    """
    cases = db.query(Complaint).filter(
        Complaint.status.notin_(["Resolved", "Closed"]),
        (Complaint.is_overdue == True) | (Complaint.is_escalated == True)
    ).all()

    # Sort severity function
    def severity_rank(c: Complaint):
        score = 0
        if c.escalation_level >= 2:  # 7-day red flag
            score += 1000
        elif c.is_escalated:  # 3-day escalation
            score += 500
        elif c.is_overdue:
            score += 100

        priority_weight = {"Urgent": 50, "High": 30, "Medium": 10, "Low": 0}
        score += priority_weight.get(c.priority, 0)
        return -score

    cases.sort(key=severity_rank)
    return cases


@router.get("/escalations", response_model=List[ComplaintOut])
def get_escalations(
    current_user: User = Depends(require_role(["senior_supervisor", "admin"])),
    db: Session = Depends(get_db)
):
    """Returns all escalated complaints under active supervisory review."""
    return db.query(Complaint).filter(
        Complaint.is_escalated == True,
        Complaint.status.notin_(["Resolved", "Closed"])
    ).order_by(desc(Complaint.escalated_at)).all()


@router.get("/workload")
def get_officer_workload(
    current_user: User = Depends(require_role(["senior_supervisor", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns active officer workload breakdown:
    Officer name, unit, area, open cases, overdue cases, resolved count.
    """
    officers = db.query(User).filter(User.role == "junior_officer").all()
    results = []

    for off in officers:
        total_assigned = db.query(Complaint).filter(Complaint.assigned_officer_id == off.id).count()
        open_cases = db.query(Complaint).filter(
            Complaint.assigned_officer_id == off.id,
            Complaint.status.notin_(["Resolved", "Closed"])
        ).count()
        overdue_cases = db.query(Complaint).filter(
            Complaint.assigned_officer_id == off.id,
            Complaint.is_overdue == True,
            Complaint.status.notin_(["Resolved", "Closed"])
        ).count()
        resolved_cases = db.query(Complaint).filter(
            Complaint.assigned_officer_id == off.id,
            Complaint.status.in_(["Resolved", "Closed"])
        ).count()

        results.append({
            "officer_id": off.id,
            "officer_name": off.name,
            "badge_number": off.badge_number or f"KSP-{off.id:04d}",
            "unit": off.unit or "Law & Order",
            "area": off.area or "Central",
            "total_assigned": total_assigned,
            "open_cases": open_cases,
            "overdue_cases": overdue_cases,
            "resolved_cases": resolved_cases,
            "capacity_status": "Overloaded" if open_cases >= 8 else "Optimal" if open_cases >= 3 else "Underutilized"
        })

    return results


@router.get("/daily-summary", response_model=List[DailySummaryOut])
def get_daily_summaries(
    limit: int = 7,
    current_user: User = Depends(require_role(["senior_supervisor", "admin"])),
    db: Session = Depends(get_db)
):
    """Standout Feature 4: Returns list of daily supervisory summaries."""
    summaries = db.query(DailySupervisorSummary).order_by(desc(DailySupervisorSummary.date)).limit(limit).all()
    if not summaries:
        # Generate summary for current simulated date
        sim_now = get_now()
        s = generate_daily_supervisor_summary(db, sim_now)
        if s:
            db.commit()
            return [s]
    return summaries


@router.post("/generate-summary", response_model=DailySummaryOut)
def force_generate_summary(
    current_user: User = Depends(require_role(["senior_supervisor", "admin"])),
    db: Session = Depends(get_db)
):
    """Triggers generation of daily summary for current simulated clock date."""
    sim_now = get_now()
    summary = generate_daily_supervisor_summary(db, sim_now)
    db.commit()
    return summary
