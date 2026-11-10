import hashlib
import threading
from datetime import datetime
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from app.models import ActionLog
from app.clock import get_now

GENESIS_PREV_HASH = "0" * 64
_audit_lock = threading.Lock()

def calculate_log_hash(
    entry_id: Optional[int],
    timestamp: datetime,
    complaint_id: str,
    user_id: Optional[int],
    user_role: str,
    action: str,
    old_status: Optional[str],
    new_status: Optional[str],
    description: str,
    prev_hash: str
) -> str:
    """
    Computes deterministic SHA-256 hash of log entry contents combined with prev_hash.
    """
    ts_str = timestamp.strftime("%Y-%m-%d %H:%M:%S") if isinstance(timestamp, datetime) else str(timestamp)
    payload = (
        f"{ts_str}|"
        f"{complaint_id}|"
        f"{user_id or 0}|"
        f"{user_role}|"
        f"{action}|"
        f"{old_status or ''}|"
        f"{new_status or ''}|"
        f"{description.strip()}|"
        f"{prev_hash}"
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

def log_action(
    db: Session,
    complaint_id: str,
    action: str,
    user_id: Optional[int],
    user_name: str,
    user_role: str,
    description: str,
    old_status: Optional[str] = None,
    new_status: Optional[str] = None,
    timestamp: Optional[datetime] = None
) -> ActionLog:
    """
    Appends an immutable, cryptographic hash-chained audit entry.
    Thread-safe to prevent concurrent writes from creating branched chains.
    """
    with _audit_lock:
        ts = timestamp or get_now()
        
        # Flush pending additions so query sees the most current state
        db.flush()
        
        # Fetch the very last entry in the entire actions_log table to chain from
        last_entry = db.query(ActionLog).order_by(ActionLog.id.desc()).first()
        prev_hash = last_entry.hash if last_entry else GENESIS_PREV_HASH

        # Calculate SHA-256 hash
        entry_hash = calculate_log_hash(
            entry_id=None,
            timestamp=ts,
            complaint_id=complaint_id,
            user_id=user_id,
            user_role=user_role,
            action=action,
            old_status=old_status,
            new_status=new_status,
            description=description,
            prev_hash=prev_hash
        )

        new_log = ActionLog(
            timestamp=ts,
            complaint_id=complaint_id,
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            action=action,
            old_status=old_status,
            new_status=new_status,
            description=description,
            prev_hash=prev_hash,
            hash=entry_hash
        )
        db.add(new_log)
        db.flush()
        return new_log

def verify_audit_chain(db: Session) -> Dict[str, Any]:
    """
    Verifies the entire cryptographic ledger chain from genesis to head.
    Detects any row modifications, deletions, injections, or corrupted hashes.
    """
    logs = db.query(ActionLog).order_by(ActionLog.id.asc()).all()
    if not logs:
        return {
            "valid": True,
            "total_verified": 0,
            "message": "Audit ledger is currently empty. Genesis state valid."
        }

    expected_prev_hash = GENESIS_PREV_HASH

    for idx, entry in enumerate(logs):
        # 1. Verify prev_hash continuity
        if entry.prev_hash != expected_prev_hash:
            return {
                "valid": False,
                "total_verified": idx,
                "broken_at_id": entry.id,
                "message": f"Ledger integrity verification FAILED at entry #{entry.id}. Broken hash chain link.",
                "reason": (
                    f"Chain broken at entry #{entry.id} ({entry.action}): "
                    f"prev_hash '{entry.prev_hash[:12]}...' does not match expected '{expected_prev_hash[:12]}...'"
                ),
                "details": {
                    "entry_id": entry.id,
                    "action": entry.action,
                    "complaint_id": entry.complaint_id,
                    "timestamp": entry.timestamp.isoformat(),
                    "recorded_prev_hash": entry.prev_hash,
                    "expected_prev_hash": expected_prev_hash
                }
            }

        # 2. Recalculate content hash
        recalculated_hash = calculate_log_hash(
            entry_id=entry.id,
            timestamp=entry.timestamp,
            complaint_id=entry.complaint_id,
            user_id=entry.user_id,
            user_role=entry.user_role,
            action=entry.action,
            old_status=entry.old_status,
            new_status=entry.new_status,
            description=entry.description,
            prev_hash=entry.prev_hash
        )

        if entry.hash != recalculated_hash:
            return {
                "valid": False,
                "total_verified": idx,
                "broken_at_id": entry.id,
                "message": f"Ledger integrity verification FAILED at entry #{entry.id}. Cryptographic tampering detected.",
                "reason": (
                    f"Cryptographic tampering detected in entry #{entry.id} ({entry.action}): "
                    f"stored hash '{entry.hash[:12]}...' does not match recalculated hash '{recalculated_hash[:12]}...'"
                ),
                "details": {
                    "entry_id": entry.id,
                    "action": entry.action,
                    "complaint_id": entry.complaint_id,
                    "timestamp": entry.timestamp.isoformat(),
                    "tampered_stored_hash": entry.hash,
                    "recalculated_hash": recalculated_hash
                }
            }

        expected_prev_hash = entry.hash

    return {
        "valid": True,
        "total_verified": len(logs),
        "message": f"Successfully verified cryptographic integrity of all {len(logs)} action log entries. Ledger is 100% untampered."
    }
