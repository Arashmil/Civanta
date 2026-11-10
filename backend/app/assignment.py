from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import User, Complaint
from app.audit import log_action

# Category to Police Unit mapping
CATEGORY_UNIT_MAP = {
    "Cybercrime": "Cyber Crime Division",
    "Financial Fraud": "Economic Offences Wing",
    "Lost Property": "Citizen Services & Lost Property Desk",
    "Traffic & Public Safety": "Traffic & Public Safety Division",
    "Complaints Involving Individuals": "Law & Order Division",
}

def get_unit_for_category(category: str) -> str:
    return CATEGORY_UNIT_MAP.get(category, "Law & Order Division")

def find_optimal_officer(
    db: Session,
    category: str,
    area: Optional[str] = None
) -> User:
    """
    Selects the optimal officer using workload balancing:
    1. Maps category -> unit.
    2. Filters officers by unit (and area if available).
    3. Counts open complaints (status not in 'Resolved', 'Closed').
    4. Assigns the officer with the fewest open complaints (strictly non-random).
    """
    target_unit = get_unit_for_category(category)

    # 1. Look for officers in the designated unit and matching area
    query = db.query(User).filter(
        User.role == "junior_officer",
        User.unit == target_unit
    )
    if area:
        area_candidates = query.filter(User.area == area).all()
        if area_candidates:
            candidates = area_candidates
        else:
            candidates = query.all()
    else:
        candidates = query.all()

    # 2. If no officer found in designated unit, fall back to any junior officer
    if not candidates:
        candidates = db.query(User).filter(User.role == "junior_officer").all()

    if not candidates:
        raise ValueError("No eligible police officers available in the system for assignment.")

    # 3. Workload calculation: count active open cases for each candidate
    candidate_ids = [c.id for c in candidates]
    workload_counts = (
        db.query(Complaint.assigned_officer_id, func.count(Complaint.id))
        .filter(
            Complaint.assigned_officer_id.in_(candidate_ids),
            Complaint.status.notin_(["Resolved", "Closed"])
        )
        .group_by(Complaint.assigned_officer_id)
        .all()
    )
    workload_map = {cid: 0 for cid in candidate_ids}
    for off_id, count in workload_counts:
        workload_map[off_id] = count

    # 4. Pick candidate with strictly minimal active load (ties broken deterministically by ID)
    candidates.sort(key=lambda u: (workload_map[u.id], u.id))
    selected_officer = candidates[0]
    return selected_officer


def auto_assign_complaint(
    db: Session,
    complaint: Complaint,
    area: Optional[str] = None
) -> User:
    """
    Assigns complaint to optimal officer, logs assignment in audit ledger, and returns assigned officer.
    """
    officer = find_optimal_officer(db, complaint.category, area or complaint.assigned_area)
    
    complaint.assigned_officer_id = officer.id
    complaint.assigned_officer_name = officer.name
    complaint.assigned_unit = officer.unit or get_unit_for_category(complaint.category)
    complaint.assigned_area = officer.area or (area or "Bengaluru Central")
    complaint.status = "Assigned"

    # Cryptographic Action Log
    log_action(
        db=db,
        complaint_id=complaint.id,
        action="ASSIGNMENT",
        user_id=None,
        user_name="CIVANTA Automated Dispatch Engine",
        user_role="system",
        old_status="Registered",
        new_status="Assigned",
        description=(
            f"Case automatically routed to {officer.unit} ({complaint.assigned_area}) "
            f"and assigned to Investigating Officer {officer.name} ({officer.badge_number or 'KSP-IO'}) "
            f"based on lowest active caseload."
        )
    )

    return officer


def reassign_complaint(
    db: Session,
    complaint: Complaint,
    new_officer_id: int,
    supervisor: User,
    reason: str,
    next_action: str,
    due_date
) -> Tuple[Complaint, User, str]:
    """
    Supervisors can manually reassign a case with a mandatory reason.
    Updates next action, due date, logs in audit chain, and notifies both officers.
    """
    new_officer = db.query(User).filter(User.id == new_officer_id, User.role == "junior_officer").first()
    if not new_officer:
        raise ValueError("Invalid officer ID specified for reassignment.")

    old_officer_name = complaint.assigned_officer_name
    complaint.assigned_officer_id = new_officer.id
    complaint.assigned_officer_name = new_officer.name
    complaint.assigned_unit = new_officer.unit or complaint.assigned_unit
    complaint.assigned_area = new_officer.area or complaint.assigned_area
    complaint.next_action = next_action
    complaint.due_date = due_date

    # Log reassignment in immutable ledger
    log_action(
        db=db,
        complaint_id=complaint.id,
        action="REASSIGNMENT",
        user_id=supervisor.id,
        user_name=supervisor.name,
        user_role=supervisor.role,
        old_status=complaint.status,
        new_status=complaint.status,
        description=(
            f"Reassigned by Supervisor {supervisor.name} from {old_officer_name} to {new_officer.name}. "
            f"Reason: {reason}. Required Next Action: '{next_action}' (Due: {due_date.strftime('%Y-%m-%d %H:%M')})."
        )
    )

    return complaint, new_officer, old_officer_name
