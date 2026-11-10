import logging
from abc import ABC, abstractmethod
from typing import Optional
from sqlalchemy.orm import Session
from app.models import Notification, User, Complaint
from app.clock import get_now

logger = logging.getLogger(__name__)

class BaseNotifier(ABC):
    """Abstract notifier interface allowing future email/SMS plugins."""

    @abstractmethod
    def dispatch(
        self,
        db: Session,
        user_id: int,
        complaint_id: Optional[str],
        notification_type: str,
        title: str,
        message_en: str,
        message_kn: str,
        event_key: Optional[str] = None
    ) -> Optional[Notification]:
        pass


class InAppNotifier(BaseNotifier):
    """
    In-app notification implementation.
    Strictly creates internal database notifications.
    Never presents notifications as external SMS or email.
    Deduplicates events using event_key.
    """

    def dispatch(
        self,
        db: Session,
        user_id: int,
        complaint_id: Optional[str],
        notification_type: str,
        title: str,
        message_en: str,
        message_kn: str,
        event_key: Optional[str] = None
    ) -> Optional[Notification]:
        # Deduplication check
        if event_key:
            existing = db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.event_key == event_key
            ).first()
            if existing:
                # Already dispatched, prevent duplicate
                return existing

        notif = Notification(
            user_id=user_id,
            complaint_id=complaint_id,
            type=notification_type,
            title=title,
            message_en=message_en,
            message_kn=message_kn,
            is_read=False,
            created_at=get_now(),
            event_key=event_key
        )
        db.add(notif)
        db.flush()
        return notif


# Global default notifier
notifier = InAppNotifier()


# --- Domain notification helper dispatches ---

def notify_case_assigned(db: Session, complaint: Complaint, officer: User):
    event_key = f"assigned_{complaint.id}_{officer.id}"
    notifier.dispatch(
        db=db,
        user_id=officer.id,
        complaint_id=complaint.id,
        notification_type="assignment",
        title=f"New Case Assigned: {complaint.id}",
        message_en=f"Case {complaint.id} ({complaint.category}) assigned to you. Next Action: '{complaint.next_action}' due by {complaint.due_date.strftime('%d-%b-%Y %H:%M')}.",
        message_kn=f"ಹೊಸ ಪ್ರಕರಣ {complaint.id} ({complaint.category}) ನಿಮಗೆ ನಿಯೋಜಿಸಲಾಗಿದೆ. ಮುಂದಿನ ಕ್ರಮ: '{complaint.next_action}', ಗಡುವು {complaint.due_date.strftime('%d-%b-%Y %H:%M')}.",
        event_key=event_key
    )

def notify_reminder_24h(db: Session, complaint: Complaint, officer: User):
    event_key = f"reminder_24h_{complaint.id}_{complaint.due_date.strftime('%Y%m%d%H')}"
    notifier.dispatch(
        db=db,
        user_id=officer.id,
        complaint_id=complaint.id,
        notification_type="reminder",
        title=f"Statutory Deadline Reminder: {complaint.id}",
        message_en=f"Case {complaint.id} follow-up deadline expires in less than 24 hours ({complaint.due_date.strftime('%d-%b %H:%M')}). Required Action: {complaint.next_action}.",
        message_kn=f"ಪ್ರಕರಣ {complaint.id} ಅನುಸರಣಾ ಗಡುವು 24 ಗಂಟೆಗಳಲ್ಲಿ ಮುಕ್ತಾಯಗೊಳ್ಳಲಿದೆ ({complaint.due_date.strftime('%d-%b %H:%M')}). ಅಗತ್ಯ ಕ್ರಮ: {complaint.next_action}.",
        event_key=event_key
    )

def notify_case_overdue(db: Session, complaint: Complaint, officer: User, supervisor: Optional[User]):
    event_key_off = f"overdue_officer_{complaint.id}_{complaint.due_date.strftime('%Y%m%d%H')}"
    notifier.dispatch(
        db=db,
        user_id=officer.id,
        complaint_id=complaint.id,
        notification_type="overdue",
        title=f"SLA BREACH ALERT: Case {complaint.id} Overdue",
        message_en=f"Case {complaint.id} has breached its statutory deadline ({complaint.due_date.strftime('%d-%b %H:%M')}). Please record immediate action and provide an updated follow-up date.",
        message_kn=f"ಪ್ರಕರಣ {complaint.id} ಕಾಲಮಿತಿಯನ್ನು ಮೀರಿದೆ ({complaint.due_date.strftime('%d-%b %H:%M')}). ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ಕ್ರಮ ದಾಖಲಿಸಿ ಮತ್ತು ನವೀಕರಿಸಿದ ಅನುಸರಣಾ ದಿನಾಂಕವನ್ನು ಒದಗಿಸಿ.",
        event_key=event_key_off
    )
    if supervisor:
        event_key_sup = f"overdue_supervisor_{complaint.id}_{complaint.due_date.strftime('%Y%m%d%H')}"
        notifier.dispatch(
            db=db,
            user_id=supervisor.id,
            complaint_id=complaint.id,
            notification_type="overdue",
            title=f"Officer Overdue Alert: {complaint.id}",
            message_en=f"Officer {complaint.assigned_officer_name} missed deadline on case {complaint.id} ({complaint.category}, {complaint.priority}). Station in-charge notified.",
            message_kn=f"ಅಧಿಕಾರಿ {complaint.assigned_officer_name} ಪ್ರಕರಣ {complaint.id} ಗಡುವನ್ನು ಮೀರಿದ್ದಾರೆ ({complaint.category}, {complaint.priority}). ಠಾಣಾ ಉಸ್ತುವಾರಿಗೆ ಎಚ್ಚರಿಕೆ ರವಾನಿಸಲಾಗಿದೆ.",
            event_key=event_key_sup
        )

def notify_case_escalated_3d(db: Session, complaint: Complaint, supervisor: User, officer: User):
    event_key = f"escalate_3d_{complaint.id}"
    notifier.dispatch(
        db=db,
        user_id=supervisor.id,
        complaint_id=complaint.id,
        notification_type="escalation",
        title=f"CRITICAL ESCALATION (3 Days Overdue): {complaint.id}",
        message_en=f"Case {complaint.id} has remained overdue for 3+ days under Officer {complaint.assigned_officer_name}. Escalated to Senior Supervisory Command for review or reassignment.",
        message_kn=f"ಪ್ರಕರಣ {complaint.id} ಅಧಿಕಾರಿ {complaint.assigned_officer_name} ಅಡಿಯಲ್ಲಿ 3+ ದಿನಗಳಿಂದ ವಿಳಂಬವಾಗಿದೆ. ಪರಿಶೀಲನೆ ಅಥವಾ ಮರುನಿಯೋಜನೆಗಾಗಿ ಹಿರಿಯ ಮೇಲ್ವಿಚಾರಕರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
        event_key=event_key
    )

def notify_red_flag_7d(db: Session, complaint: Complaint, supervisor: User):
    event_key = f"redflag_7d_{complaint.id}"
    notifier.dispatch(
        db=db,
        user_id=supervisor.id,
        complaint_id=complaint.id,
        notification_type="escalation",
        title=f"RED FLAG COMPLAINT (7+ Days Overdue): {complaint.id}",
        message_en=f"SEVERE ACCOUNTABILITY VIOLATION: Case {complaint.id} is 7+ days overdue without resolution. Highlighted in RED on Command Dashboard.",
        message_kn=f"ತೀವ್ರ ಹೊಣೆಗಾರಿಕೆ ಉಲ್ಲಂಘನೆ: ಪ್ರಕರಣ {complaint.id} ಪರಿಹಾರವಿಲ್ಲದೆ 7+ ದಿನಗಳಿಂದ ವಿಳಂಬವಾಗಿದೆ. ಕಮಾಂಡ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಕೆಂಪು ಬಣ್ಣದಲ್ಲಿ ಗುರುತಿಸಲಾಗಿದೆ.",
        event_key=event_key
    )

def notify_silent_complaint(db: Session, complaint: Complaint, supervisor: User, officer: User, days_inactive: int):
    event_key = f"silent_{complaint.id}_{get_now().strftime('%Y%m%d')}"
    notifier.dispatch(
        db=db,
        user_id=supervisor.id,
        complaint_id=complaint.id,
        notification_type="reminder",
        title=f"Silent Case Detected: {complaint.id}",
        message_en=f"Case {complaint.id} has had zero officer activity for {days_inactive} consecutive days despite pending deadline.",
        message_kn=f"ಪ್ರಕರಣ {complaint.id} ನಲ್ಲಿ ಗಡುವು ಬಾಕಿ ಇದ್ದರೂ ಸತತ {days_inactive} ದಿನಗಳಿಂದ ಯಾವುದೇ ಅಧಿಕೃತ ಚಟುವಟಿಕೆ ದಾಖಲಾಗಿಲ್ಲ.",
        event_key=event_key
    )

def notify_reopened(db: Session, complaint: Complaint, supervisor: User, officer: User, reason: str):
    event_key = f"reopened_{complaint.id}_{get_now().strftime('%Y%m%d%H%M')}"
    notifier.dispatch(
        db=db,
        user_id=officer.id,
        complaint_id=complaint.id,
        notification_type="reopen",
        title=f"Case Reopened by Citizen: {complaint.id}",
        message_en=f"Citizen requested reopening for case {complaint.id}. Reason: '{reason}'. Please review immediately.",
        message_kn=f"ನಾಗರಿಕರು ಪ್ರಕರಣ {complaint.id} ಮರುತೆರೆಯಲು ವಿನಂತಿಸಿದ್ದಾರೆ. ಕಾರಣ: '{reason}'. ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ಪರಿಶೀಲಿಸಿ.",
        event_key=event_key
    )
