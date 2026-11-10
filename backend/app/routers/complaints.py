import os
import uuid
import shutil
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.database import get_db
from app.models import (
    Complaint, ComplaintDocument, User, ActionLog, Feedback
)
from app.schemas import (
    ComplaintCreate, ComplaintOut, ComplaintTrackOut,
    StatusUpdateReq, ReassignReq, ResolutionReq, CloseReq,
    ReopenReq, FeedbackReq, CorrectionReq
)
from app.security import get_current_user, require_role
from app.clock import get_now
from app.config import (
    UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE, SLA_DURATIONS, CATEGORIES
)
from app.ai_service import analyze_complaint
from app.assignment import auto_assign_complaint, reassign_complaint
from app.audit import log_action
from app.notifier import notify_case_assigned, notify_reopened

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

CATEGORY_PREFIX_MAP = {
    "Cybercrime": "CYB",
    "Financial Fraud": "FIN",
    "Lost Property": "LST",
    "Traffic & Public Safety": "TRF",
    "Complaints Involving Individuals": "IND",
}

def generate_unique_complaint_id(db: Session, category: str) -> str:
    """Generates sequential ID in required format: KA-CYB-2026-0001."""
    year = get_now().year
    prefix = CATEGORY_PREFIX_MAP.get(category, "GEN")
    code_pattern = f"KA-{prefix}-{year}-%"
    
    # Count existing cases for this category & year
    count = db.query(Complaint).filter(Complaint.id.like(code_pattern)).count()
    return f"KA-{prefix}-{year}-{count + 1:04d}"


@router.post("", response_model=ComplaintOut)
async def submit_complaint(
    title: str = Form(...),
    description: str = Form(...),
    area: str = Form("Bengaluru Central"),
    phone: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Registers a new complaint:
    1. Single AI analysis call (detects language kn/en, translates if API available, categorizes, flags duplicate).
    2. Intelligent workload-balanced officer assignment (never random).
    3. Mandates initial assigned officer, next action and statutory due date.
    4. Handles optional evidence document/image upload.
    5. Appends immutable entry to cryptographic audit chain.
    """
    sim_now = get_now()
    image_bytes = None
    mime_type = None

    # Process file if provided
    doc_info = None
    if file:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{file_ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds maximum 10MB limit.")

        if file_ext in [".jpg", ".jpeg", ".png"]:
            image_bytes = contents
            mime_type = file.content_type

        # Save file to disk
        unique_filename = f"{uuid.uuid4().hex}{file_ext}"
        save_path = UPLOAD_DIR / unique_filename
        with open(save_path, "wb") as f:
            f.write(contents)

        doc_info = {
            "filename": unique_filename,
            "original_filename": file.filename,
            "file_type": file.content_type or "application/octet-stream",
            "file_size": len(contents),
            "file_path": str(save_path)
        }

    # 1. AI Analysis & Triage (single call at registration)
    ai_result = analyze_complaint(
        text=description,
        title=title,
        image_bytes=image_bytes,
        mime_type=mime_type,
        db=db
    )

    category = ai_result.get("category", "Complaints Involving Individuals")
    priority = ai_result.get("priority", "Medium")
    complaint_id = generate_unique_complaint_id(db, category)

    # 2. SLA Duration & Initial Due Date Calculation
    sla_hours = SLA_DURATIONS.get(priority, 72)
    initial_due_date = sim_now + timedelta(hours=sla_hours)
    initial_next_action = f"Preliminary intake verification of complaint statement and evidence ({priority} priority standard SLA)"

    # Create complaint instance
    complaint = Complaint(
        id=complaint_id,
        complainant_id=current_user.id,
        complainant_name=current_user.name,
        complainant_phone=phone or current_user.phone or "N/A",
        title=title.strip(),
        original_text=description.strip(),
        english_text=ai_result.get("english_text", description),
        language=ai_result.get("language", "en"),
        category=category,
        priority=priority,
        ai_confidence=ai_result.get("confidence", 0.85),
        ai_summary=ai_result.get("summary", ""),
        duplicate_of=ai_result.get("duplicate_of"),
        ai_flag_banner=ai_result.get("ai_flag_banner", False),
        status="Registered",
        assigned_officer_id=current_user.id,  # Temporary placeholder before auto-assignment
        assigned_officer_name="Pending Assignment",
        assigned_unit="Police Dispatch Pool",
        assigned_area=area,
        next_action=initial_next_action,
        due_date=initial_due_date,
        created_at=sim_now,
        updated_at=sim_now,
        last_activity_at=sim_now
    )

    db.add(complaint)
    db.flush()

    # 3. Workload-Balanced Officer Assignment
    assigned_officer = auto_assign_complaint(db, complaint, area=area)

    # 4. Save evidence document if uploaded
    if doc_info:
        doc = ComplaintDocument(
            complaint_id=complaint.id,
            filename=doc_info["filename"],
            original_filename=doc_info["original_filename"],
            file_type=doc_info["file_type"],
            file_size=doc_info["file_size"],
            file_path=doc_info["file_path"],
            uploaded_by=current_user.id,
            created_at=sim_now
        )
        db.add(doc)

    # 5. Cryptographic Action Log (Registration)
    log_action(
        db=db,
        complaint_id=complaint.id,
        action="REGISTRATION",
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        old_status=None,
        new_status="Assigned",
        description=(
            f"Citizen grievance registered under '{category}' ({priority} Priority). "
            f"Bilingual Analysis: Language={complaint.language}. Assigned to {assigned_officer.name} ({assigned_officer.unit}). "
            f"Initial Due Date: {initial_due_date.strftime('%Y-%m-%d %H:%M')}. "
            f"Next Action: '{initial_next_action}'."
        ),
        timestamp=sim_now
    )

    # 6. In-App Notification to Assigned Officer
    notify_case_assigned(db, complaint, assigned_officer)

    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("", response_model=List[ComplaintOut])
def get_complaints(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    overdue_only: Optional[bool] = False,
    escalated_only: Optional[bool] = False,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns complaints filtered by role and criteria:
    - Citizen: see only own registered complaints
    - Junior Officer: see only assigned complaints (or unit complaints)
    - Senior Supervisor & Admin: see all complaints
    """
    query = db.query(Complaint)

    if current_user.role == "citizen":
        query = query.filter(Complaint.complainant_id == current_user.id)
    elif current_user.role == "junior_officer":
        query = query.filter(Complaint.assigned_officer_id == current_user.id)

    if category:
        query = query.filter(Complaint.category == category)
    if priority:
        query = query.filter(Complaint.priority == priority)
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if overdue_only:
        query = query.filter(Complaint.is_overdue == True)
    if escalated_only:
        query = query.filter(Complaint.is_escalated == True)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.id.ilike(search_term),
                Complaint.title.ilike(search_term),
                Complaint.original_text.ilike(search_term),
                Complaint.complainant_name.ilike(search_term)
            )
        )

    return query.order_by(desc(Complaint.created_at)).all()


@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint_detail(
    complaint_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full complaint details with documents, audit chain, and feedback.
    Enforces role visibility: citizen can only view own complaints.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.role == "citizen" and complaint.complainant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: this is not your complaint.")

    return complaint


@router.get("/track/{complaint_id}", response_model=ComplaintTrackOut)
def track_complaint(
    complaint_id: str,
    db: Session = Depends(get_db)
):
    """
    Screen 4: Track Complaint (Public / Citizen-Safe View).
    Returns status, category, priority, next step, expected date.
    Strictly strips officer personal contact details (safe for public/citizen view).
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id.strip()).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"No complaint registered with ID '{complaint_id}'.")

    return ComplaintTrackOut(
        id=complaint.id,
        title=complaint.title,
        status=complaint.status,
        category=complaint.category,
        priority=complaint.priority,
        next_action=complaint.next_action,
        expected_follow_up_date=complaint.due_date,
        is_overdue=complaint.is_overdue,
        is_escalated=complaint.is_escalated,
        assigned_department=complaint.assigned_unit,
        assigned_officer_designation=f"Investigating Officer ({complaint.assigned_unit})",
        created_at=complaint.created_at,
        ai_disclaimer="Suggested. Officer must confirm.",
        resolution_report=complaint.resolution_report,
        closure_note=complaint.closure_note,
        feedback_submitted=complaint.feedback is not None
    )


@router.post("/{complaint_id}/status", response_model=ComplaintOut)
def update_complaint_status(
    complaint_id: str,
    req: StatusUpdateReq,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CORE RULE ENFORCEMENT:
    No complaint may exist without an assigned officer, a next action and a due date.
    Every status change MUST require a next-action note and a new follow-up date.
    Reject the change otherwise (backend-enforced).
    """
    if current_user.role not in ["junior_officer", "senior_supervisor", "admin"]:
        raise HTTPException(status_code=403, detail="Only police officers or supervisors can update status.")

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.role == "junior_officer" and complaint.assigned_officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update status for cases assigned to you.")

    # Validate Core Rule fields explicitly
    if not req.next_action or len(req.next_action.strip()) < 5:
        raise HTTPException(
            status_code=422,
            detail="CORE RULE VIOLATION: A descriptive next-action note (min 5 chars) is mandatory for any status change."
        )
    if not req.due_date:
        raise HTTPException(
            status_code=422,
            detail="CORE RULE VIOLATION: A valid follow-up due date is mandatory for any status change."
        )

    sim_now = get_now()
    old_status = complaint.status
    complaint.status = req.new_status
    complaint.next_action = req.next_action.strip()
    complaint.due_date = req.due_date
    complaint.last_activity_at = sim_now
    complaint.updated_at = sim_now

    # Check if newly set due date clears overdue flag
    if req.due_date > sim_now:
        complaint.is_overdue = False

    # Append to Cryptographic Ledger
    desc_str = (
        f"Status changed from {old_status} to {req.new_status}. "
        f"Mandatory Next Action: '{complaint.next_action}' (Follow-up Due: {req.due_date.strftime('%Y-%m-%d %H:%M')})."
    )
    if req.remarks:
        desc_str += f" Officer Remarks: {req.remarks}"

    log_action(
        db=db,
        complaint_id=complaint.id,
        action="STATUS_CHANGE",
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        old_status=old_status,
        new_status=req.new_status,
        description=desc_str,
        timestamp=sim_now
    )

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/accept", response_model=ComplaintOut)
def accept_complaint(
    complaint_id: str,
    next_action: str = Form("Reviewing evidence and contacting complainant for verification"),
    due_date: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Officer formal acceptance of an assigned complaint.
    Enforces mandatory next action and follow-up date.
    """
    if current_user.role not in ["junior_officer", "senior_supervisor"]:
        raise HTTPException(status_code=403, detail="Only officers can accept cases.")

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    sim_now = get_now()
    # Parse due_date or default to 48 hours
    parsed_due_date = datetime.fromisoformat(due_date) if due_date else sim_now + timedelta(hours=48)

    old_status = complaint.status
    complaint.status = "Accepted"
    complaint.next_action = next_action.strip()
    complaint.due_date = parsed_due_date
    complaint.last_activity_at = sim_now
    complaint.updated_at = sim_now

    log_action(
        db=db,
        complaint_id=complaint.id,
        action="ACCEPTANCE",
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        old_status=old_status,
        new_status="Accepted",
        description=f"Investigating Officer {current_user.name} formally accepted case assignment. Next Action: '{next_action}' (Due: {parsed_due_date.strftime('%Y-%m-%d %H:%M')}).",
        timestamp=sim_now
    )

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/reassign", response_model=ComplaintOut)
def supervisor_reassign(
    complaint_id: str,
    req: ReassignReq,
    current_user: User = Depends(require_role(["senior_supervisor", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Supervisor manual reassignment with mandatory justification reason, next action and due date.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    sim_now = get_now()
    complaint, new_officer, old_officer_name = reassign_complaint(
        db=db,
        complaint=complaint,
        new_officer_id=req.new_officer_id,
        supervisor=current_user,
        reason=req.reason,
        next_action=req.next_action,
        due_date=req.due_date
    )
    complaint.last_activity_at = sim_now
    complaint.updated_at = sim_now
    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/resolve", response_model=ComplaintOut)
def resolve_complaint(
    complaint_id: str,
    req: ResolutionReq,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Officer submits resolution report.
    Mandates resolution report text, next action, and follow-up date for citizen confirmation.
    """
    if current_user.role not in ["junior_officer", "senior_supervisor"]:
        raise HTTPException(status_code=403, detail="Only investigating officers can resolve complaints.")

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    sim_now = get_now()
    old_status = complaint.status
    complaint.status = "Resolved"
    complaint.resolution_report = req.resolution_report.strip()
    complaint.next_action = req.next_action.strip()
    complaint.due_date = req.due_date
    complaint.is_overdue = False
    complaint.last_activity_at = sim_now
    complaint.updated_at = sim_now

    log_action(
        db=db,
        complaint_id=complaint.id,
        action="RESOLUTION",
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        old_status=old_status,
        new_status="Resolved",
        description=f"Investigation resolution report submitted by Officer {current_user.name}: '{req.resolution_report[:200]}...'. Pending citizen review and closure.",
        timestamp=sim_now
    )

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/close", response_model=ComplaintOut)
def close_complaint(
    complaint_id: str,
    req: CloseReq,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Closure requires a note. Can be performed by citizen or supervisor/admin.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.role == "citizen" and complaint.complainant_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only close your own complaints.")

    sim_now = get_now()
    old_status = complaint.status
    complaint.status = "Closed"
    complaint.closure_note = req.closure_note.strip()
    complaint.next_action = "Case closed. File archived in police records repository."
    complaint.due_date = sim_now
    complaint.last_activity_at = sim_now
    complaint.updated_at = sim_now

    log_action(
        db=db,
        complaint_id=complaint.id,
        action="CLOSURE",
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        old_status=old_status,
        new_status="Closed",
        description=f"Case officially closed by {current_user.name} ({current_user.role}). Closure Note: '{req.closure_note}'",
        timestamp=sim_now
    )

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/reopen", response_model=ComplaintOut)
def reopen_complaint(
    complaint_id: str,
    req: ReopenReq,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Standout Feature 3: Reopen allowed from Resolved/Closed on citizen request.
    Mandates reason, sets new action and follow-up date, logs in audit chain.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if complaint.status not in ["Resolved", "Closed"]:
        raise HTTPException(status_code=400, detail="Only Resolved or Closed complaints can be reopened.")

    sim_now = get_now()
    old_status = complaint.status
    complaint.status = "In Progress"
    complaint.next_action = f"Citizen Reopen Review: {req.reason[:80]}"
    complaint.due_date = sim_now + timedelta(hours=48)
    complaint.is_overdue = False
    complaint.last_activity_at = sim_now
    complaint.updated_at = sim_now

    log_action(
        db=db,
        complaint_id=complaint.id,
        action="REOPEN_REQUEST",
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        old_status=old_status,
        new_status="In Progress",
        description=f"Citizen {current_user.name} requested case reopening. Reason: '{req.reason}'. Follow-up scheduled for 48h.",
        timestamp=sim_now
    )

    # Notify officer
    officer = db.query(User).filter(User.id == complaint.assigned_officer_id).first()
    supervisor = db.query(User).filter(User.role == "senior_supervisor").first()
    if officer and supervisor:
        notify_reopened(db, complaint, supervisor, officer, req.reason)

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/feedback", response_model=ComplaintOut)
def submit_feedback(
    complaint_id: str,
    req: FeedbackReq,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Standout Feature 3: Citizen feedback (1-5 rating + comment) after resolution.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.role == "citizen" and complaint.complainant_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only give feedback for your own complaint.")

    existing_fb = db.query(Feedback).filter(Feedback.complaint_id == complaint_id).first()
    if existing_fb:
        raise HTTPException(status_code=400, detail="Feedback has already been submitted for this grievance.")

    sim_now = get_now()
    fb = Feedback(
        complaint_id=complaint_id,
        citizen_id=current_user.id,
        rating=req.rating,
        comment=req.comment,
        created_at=sim_now
    )
    db.add(fb)

    log_action(
        db=db,
        complaint_id=complaint.id,
        action="FEEDBACK_SUBMITTED",
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        old_status=complaint.status,
        new_status=complaint.status,
        description=f"Citizen submitted resolution feedback: {req.rating} Stars. Comment: '{req.comment or 'No comment provided'}'",
        timestamp=sim_now
    )

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/correct-ai", response_model=ComplaintOut)
def correct_ai_classification(
    complaint_id: str,
    req: CorrectionReq,
    current_user: User = Depends(require_role(["junior_officer", "senior_supervisor", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Officers can correct category and priority. Corrections are logged in the audit trail.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    sim_now = get_now()
    old_cat = complaint.category
    old_prio = complaint.priority

    changes = []
    if req.category and req.category in CATEGORIES and req.category != old_cat:
        complaint.category = req.category
        complaint.category_corrected = True
        changes.append(f"Category corrected from '{old_cat}' to '{req.category}'")

    if req.priority and req.priority in ["Low", "Medium", "High", "Urgent"] and req.priority != old_prio:
        complaint.priority = req.priority
        complaint.priority_corrected = True
        changes.append(f"Priority corrected from '{old_prio}' to '{req.priority}'")

    if not changes:
        raise HTTPException(status_code=400, detail="No changes detected or invalid category/priority supplied.")

    complaint.last_activity_at = sim_now
    complaint.updated_at = sim_now

    log_action(
        db=db,
        complaint_id=complaint.id,
        action="SUPERVISOR_ACTION" if current_user.role == "senior_supervisor" else "REMARK_ADDED",
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        old_status=complaint.status,
        new_status=complaint.status,
        description=f"AI Classification Overridden by Officer {current_user.name}: {'; '.join(changes)}. Reason: '{req.reason}'",
        timestamp=sim_now
    )

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/documents")
async def upload_complaint_document(
    complaint_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload evidence document or investigation report.
    Allowed by complainant, assigned officer, supervisor, or admin.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.role == "citizen" and complaint.complainant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: not your complaint.")
    if current_user.role == "junior_officer" and complaint.assigned_officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: not assigned to this case.")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{file_ext}'. Allowed: {ALLOWED_EXTENSIONS}")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")

    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    save_path = UPLOAD_DIR / unique_filename
    with open(save_path, "wb") as f:
        f.write(contents)

    sim_now = get_now()
    doc = ComplaintDocument(
        complaint_id=complaint_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_type=file.content_type or "application/octet-stream",
        file_size=len(contents),
        file_path=str(save_path),
        uploaded_by=current_user.id,
        created_at=sim_now
    )
    db.add(doc)

    log_action(
        db=db,
        complaint_id=complaint.id,
        action="DOCUMENT_UPLOADED",
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        old_status=complaint.status,
        new_status=complaint.status,
        description=f"Evidence document attached by {current_user.name} ({current_user.role}): '{file.filename}' ({len(contents)//1024} KB).",
        timestamp=sim_now
    )

    db.commit()
    return {"message": "Document uploaded successfully", "filename": file.filename}


@router.get("/{complaint_id}/documents/{doc_id}")
def download_document(
    complaint_id: str,
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Downloads evidence document. Enforces strict privacy access:
    Visible only to complainant, assigned officer, supervisors and admin.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    # Access security check
    if current_user.role == "citizen" and complaint.complainant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: unauthorized.")
    if current_user.role == "junior_officer" and complaint.assigned_officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: case not assigned to you.")

    doc = db.query(ComplaintDocument).filter(
        ComplaintDocument.id == doc_id,
        ComplaintDocument.complaint_id == complaint_id
    ).first()

    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found on server.")

    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type=doc.file_type
    )
