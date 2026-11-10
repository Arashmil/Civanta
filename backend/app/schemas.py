from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

# --- AUTH SCHEMAS ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=6)
    role: str = Field("citizen", pattern="^(citizen|junior_officer|senior_supervisor|admin)$")
    phone: Optional[str] = None
    badge_number: Optional[str] = None
    unit: Optional[str] = None
    area: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    badge_number: Optional[str] = None
    unit: Optional[str] = None
    area: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- COMPLAINT SCHEMAS ---
class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)  # Original text in Kannada or English
    area: Optional[str] = "Bengaluru Central"
    phone: Optional[str] = None

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    created_at: datetime

class ActionLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    complaint_id: str
    user_id: Optional[int] = None
    user_name: str
    user_role: str
    action: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    description: str
    prev_hash: str
    hash: str

class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    complainant_id: int
    complainant_name: str
    complainant_phone: Optional[str] = None
    title: str
    original_text: str
    english_text: str
    language: str
    category: str
    priority: str
    ai_confidence: float
    ai_summary: Optional[str] = None
    duplicate_of: Optional[str] = None
    ai_flag_banner: bool = False
    ai_disclaimer: str = "Suggested. Officer must confirm."
    category_corrected: bool = False
    priority_corrected: bool = False
    status: str
    assigned_officer_id: int
    assigned_officer_name: str
    assigned_unit: str
    assigned_area: str
    next_action: str
    due_date: datetime
    resolution_report: Optional[str] = None
    closure_note: Optional[str] = None
    is_overdue: bool
    is_escalated: bool
    escalated_at: Optional[datetime] = None
    escalation_level: int
    created_at: datetime
    updated_at: datetime
    documents: List[DocumentOut] = []
    action_logs: List[ActionLogOut] = []
    feedback: Optional[FeedbackOut] = None

class ComplaintTrackOut(BaseModel):
    """Citizen-safe tracking view: strips officer personal contact details."""
    id: str
    title: str
    status: str
    category: str
    priority: str
    next_action: str
    expected_follow_up_date: datetime
    is_overdue: bool
    is_escalated: bool
    assigned_department: str
    assigned_officer_designation: str
    created_at: datetime
    ai_disclaimer: str = "Suggested. Officer must confirm."
    resolution_report: Optional[str] = None
    closure_note: Optional[str] = None
    feedback_submitted: bool = False

# --- ACTION SCHEMAS (Enforcing Mandatory Next Action & Due Date) ---
class StatusUpdateReq(BaseModel):
    new_status: str = Field(..., pattern="^(Accepted|In Progress|Awaiting Response|Resolved|Closed)$")
    next_action: str = Field(..., min_length=5, max_length=255, description="CORE RULE: Next action note is mandatory")
    due_date: datetime = Field(..., description="CORE RULE: Follow-up due date is mandatory")
    remarks: Optional[str] = None

class ReassignReq(BaseModel):
    new_officer_id: int
    reason: str = Field(..., min_length=5, max_length=255)
    next_action: str = Field(..., min_length=5, max_length=255)
    due_date: datetime

class ResolutionReq(BaseModel):
    resolution_report: str = Field(..., min_length=15)
    next_action: str = Field("Case resolved. Verification pending citizen closure.", min_length=5)
    due_date: datetime

class CloseReq(BaseModel):
    closure_note: str = Field(..., min_length=10, description="Closure requires a note")

class ReopenReq(BaseModel):
    reason: str = Field(..., min_length=10, description="Reopen reason from citizen")

class FeedbackReq(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class CorrectionReq(BaseModel):
    category: Optional[str] = None
    priority: Optional[str] = None
    reason: str = Field(..., min_length=5)

# --- AUDIT CHAIN VERIFICATION ---
class ChainVerificationOut(BaseModel):
    valid: bool
    total_verified: int
    message: Optional[str] = "Audit verification completed."
    broken_at_id: Optional[int] = None
    reason: Optional[str] = None
    details: Optional[dict] = None

# --- NOTIFICATION SCHEMA ---
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    complaint_id: Optional[str] = None
    type: str
    title: str
    message_en: str
    message_kn: str
    is_read: bool
    created_at: datetime

# --- SUPERVISOR & ANALYTICS SCHEMAS ---
class KPICardsOut(BaseModel):
    total_complaints: int
    pending_complaints: int
    resolved_complaints: int
    closed_complaints: int
    overdue_complaints: int
    escalated_complaints: int
    avg_resolution_hours: float
    on_time_rate: float

class OfficerScorecardOut(BaseModel):
    officer_id: int
    officer_name: str
    badge_number: Optional[str] = None
    unit: str
    area: str
    total_assigned: int
    open_cases: int
    resolved_cases: int
    overdue_cases: int
    on_time_followup_rate: float  # Percentage
    avg_response_hours: float

class DailySummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: str
    total_cases: int
    pending_cases: int
    overdue_cases: int
    escalated_cases: int
    resolved_today: int
    summary_text: str
    created_at: datetime
