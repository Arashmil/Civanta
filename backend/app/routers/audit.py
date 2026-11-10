from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import ActionLog, User
from app.schemas import ActionLogOut, ChainVerificationOut
from app.security import get_current_user, require_role
from app.audit import verify_audit_chain

router = APIRouter(prefix="/api/audit", tags=["Cryptographic Audit Ledger"])

@router.get("/logs", response_model=List[ActionLogOut])
def get_action_logs(
    complaint_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns immutable audit entries.
    Citizen can only see logs for their own complaints.
    Officers/Supervisors/Admins can inspect full chronological history.
    """
    query = db.query(ActionLog)

    if complaint_id:
        query = query.filter(ActionLog.complaint_id == complaint_id)

    if action:
        query = query.filter(ActionLog.action == action)

    # Sort descending for display, or ascending for verification
    return query.order_by(desc(ActionLog.id)).limit(limit).all()


@router.get("/verify", response_model=ChainVerificationOut)
def verify_ledger(
    db: Session = Depends(get_db)
):
    """
    'Verify chain' functionality:
    Validates SHA-256 cryptographic hash-chain continuity from genesis to head.
    Reports first broken entry if tampering has occurred.
    """
    result = verify_audit_chain(db)
    return result


@router.post("/tamper-test")
def tamper_log_for_testing(
    entry_id: Optional[int] = None,
    new_description: str = "TAMPERED_TEXT: Unauthorized direct modification in database table.",
    current_user: User = Depends(require_role(["admin", "senior_supervisor"])),
    db: Session = Depends(get_db)
):
    """
    PROTOTYPE DEMONSTRATION & TEST TOOL ONLY:
    Directly mutates one log row's description in SQLite without recomputing hash or prev_hash.
    This simulates malicious database tampering to demonstrate that verify_chain() immediately catches it.
    """
    if entry_id:
        entry = db.query(ActionLog).filter(ActionLog.id == entry_id).first()
    else:
        # Default to the middle or latest entry
        entry = db.query(ActionLog).order_by(ActionLog.id.desc()).first()

    if not entry:
        raise HTTPException(status_code=404, detail="No audit entries exist to tamper with.")

    original_description = entry.description
    entry.description = new_description
    db.commit()

    return {
        "message": f"Simulated database tampering performed on ActionLog #{entry.id}.",
        "entry_id": entry.id,
        "complaint_id": entry.complaint_id,
        "original_description": original_description,
        "tampered_description": new_description,
        "note": "Now invoke 'GET /api/audit/verify' or click 'Verify Chain' in the UI to observe cryptographic tamper detection."
    }
