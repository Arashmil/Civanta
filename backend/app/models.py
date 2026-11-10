from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database import Base
from app.clock import get_now

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="citizen")  # citizen, junior_officer, senior_supervisor, admin
    badge_number = Column(String(50), nullable=True)  # e.g., KSP-PSI-2489
    unit = Column(String(120), nullable=True)  # e.g., Cyber Crime Division
    area = Column(String(120), nullable=True)  # e.g., Jayanagar, Bengaluru
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=get_now, nullable=False)

    # Relationships
    complaints_filed = relationship("Complaint", back_populates="complainant", foreign_keys="Complaint.complainant_id")
    assigned_complaints = relationship("Complaint", back_populates="assigned_officer", foreign_keys="Complaint.assigned_officer_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(50), primary_key=True, index=True)  # Format: KA-CYB-2026-0001
    complainant_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    complainant_name = Column(String(120), nullable=False)
    complainant_phone = Column(String(30), nullable=True)
    title = Column(String(255), nullable=False)
    original_text = Column(Text, nullable=False)
    english_text = Column(Text, nullable=False)
    language = Column(String(10), nullable=False, default="en")  # kn, en
    
    # Exactly 5 Categories:
    # Cybercrime, Financial Fraud, Lost Property, Traffic & Public Safety, Complaints Involving Individuals
    category = Column(String(100), nullable=False, index=True)
    priority = Column(String(20), nullable=False, default="Medium", index=True)  # Low, Medium, High, Urgent
    ai_confidence = Column(Float, nullable=False, default=0.85)
    ai_summary = Column(Text, nullable=True)
    duplicate_of = Column(String(50), nullable=True)  # Complaint ID if flagged as duplicate
    
    # Fallback and correction tracking
    ai_flag_banner = Column(Boolean, default=False)  # "AI unavailable: translation not performed"
    category_corrected = Column(Boolean, default=False)
    priority_corrected = Column(Boolean, default=False)
    
    # Lifecycle Status:
    # Registered -> Assigned -> Accepted -> In Progress -> Awaiting Response -> Resolved -> Closed (Reopened allowed)
    status = Column(String(50), nullable=False, default="Assigned", index=True)
    
    # CORE RULE: Mandatory assigned officer, next action and due date
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assigned_officer_name = Column(String(120), nullable=False)
    assigned_unit = Column(String(120), nullable=False)
    assigned_area = Column(String(120), nullable=False)
    
    next_action = Column(String(255), nullable=False)
    due_date = Column(DateTime, nullable=False, index=True)
    
    # Resolution and closure details
    resolution_report = Column(Text, nullable=True)
    closure_note = Column(Text, nullable=True)
    
    # Reminders and Escalation status
    is_overdue = Column(Boolean, default=False, index=True)
    is_escalated = Column(Boolean, default=False, index=True)
    escalated_at = Column(DateTime, nullable=True)
    escalation_level = Column(Integer, default=0)  # 0: None, 1: 3-day overdue to supervisor, 2: 7-day red flag
    last_activity_at = Column(DateTime, default=get_now, nullable=False)  # for silent complaint detection
    
    created_at = Column(DateTime, default=get_now, nullable=False, index=True)
    updated_at = Column(DateTime, default=get_now, onupdate=get_now, nullable=False)

    # Relationships
    complainant = relationship("User", foreign_keys=[complainant_id], back_populates="complaints_filed")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], back_populates="assigned_complaints")
    documents = relationship("ComplaintDocument", back_populates="complaint", cascade="all, delete-orphan")
    action_logs = relationship("ActionLog", back_populates="complaint", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="complaint", uselist=False, cascade="all, delete-orphan")


class ComplaintDocument(Base):
    __tablename__ = "complaint_documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=get_now, nullable=False)

    complaint = relationship("Complaint", back_populates="documents")


class ActionLog(Base):
    """
    Append-only tamper-evident audit ledger.
    No update or delete endpoints exist.
    prev_hash links each entry cryptographically to the preceding entry (SHA-256).
    """
    __tablename__ = "actions_log"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=get_now, nullable=False, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    user_id = Column(Integer, nullable=True)  # 0 or None for automated scheduler
    user_name = Column(String(120), nullable=False)
    user_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)  # REGISTRATION, ASSIGNMENT, STATUS_CHANGE, etc.
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    prev_hash = Column(String(64), nullable=False)
    hash = Column(String(64), nullable=False, index=True)

    complaint = relationship("Complaint", back_populates="action_logs")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), unique=True, nullable=False, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_now, nullable=False)

    complaint = relationship("Complaint", back_populates="feedback")


class SystemConfig(Base):
    __tablename__ = "system_configs"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    complaint_id = Column(String(50), nullable=True, index=True)
    type = Column(String(50), nullable=False)  # reminder, overdue, escalation, assignment, status_update, daily_summary, reopen
    title = Column(String(200), nullable=False)
    message_en = Column(Text, nullable=False)
    message_kn = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=get_now, nullable=False, index=True)
    event_key = Column(String(120), nullable=True, index=True)  # Unique per user+complaint+event to avoid duplicates

    user = relationship("User", back_populates="notifications")


class DailySupervisorSummary(Base):
    __tablename__ = "daily_supervisor_summaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    total_cases = Column(Integer, default=0)
    pending_cases = Column(Integer, default=0)
    overdue_cases = Column(Integer, default=0)
    escalated_cases = Column(Integer, default=0)
    resolved_today = Column(Integer, default=0)
    summary_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=get_now, nullable=False)
