import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.models import (
    User, Complaint, ComplaintDocument, ActionLog, Feedback, SystemConfig, Notification, DailySupervisorSummary
)
from app.security import hash_password
from app.clock import get_now, init_clock
from app.audit import log_action, verify_audit_chain
from app.scheduler import generate_daily_supervisor_summary

# Demo password for all accounts
DEFAULT_PASSWORD = "Demo@123"

# Demo Officers and Users
DEMO_USERS = [
    {
        "name": "Ramesh Gowda",
        "email": "citizen@demo.com",
        "role": "citizen",
        "phone": "+91 98450 12345",
        "badge_number": None,
        "unit": None,
        "area": "Jayanagar, Bengaluru"
    },
    {
        "name": "PSI Anand Kumar",
        "email": "junior@demo.com",
        "role": "junior_officer",
        "phone": "+91 94808 01001",
        "badge_number": "KSP-PSI-2489",
        "unit": "Cyber Crime Division",
        "area": "Jayanagar"
    },
    {
        "name": "DySP Rajeshwari Hegde",
        "email": "supervisor@demo.com",
        "role": "senior_supervisor",
        "phone": "+91 94808 01002",
        "badge_number": "KSP-DySP-1042",
        "unit": "Vigilance & Command",
        "area": "Greater Bengaluru"
    },
    {
        "name": "Prakash Rao",
        "email": "admin@demo.com",
        "role": "admin",
        "phone": "+91 94808 01003",
        "badge_number": "KSP-DIR-0001",
        "unit": "Police Computer Services Directorate",
        "area": "State Police Headquarters"
    },
    {
        "name": "PSI Manjunath Naik",
        "email": "manjunath@ksp.gov.in",
        "role": "junior_officer",
        "phone": "+91 94808 01004",
        "badge_number": "KSP-PSI-3120",
        "unit": "Economic Offences Wing",
        "area": "Koramangala"
    },
    {
        "name": "PSI Deepa Patil",
        "email": "deepa@ksp.gov.in",
        "role": "junior_officer",
        "phone": "+91 94808 01005",
        "badge_number": "KSP-PSI-4051",
        "unit": "Citizen Services & Lost Property Desk",
        "area": "Majestic"
    },
    {
        "name": "PSI Suresh Gowda",
        "email": "suresh@ksp.gov.in",
        "role": "junior_officer",
        "phone": "+91 94808 01006",
        "badge_number": "KSP-PSI-1892",
        "unit": "Traffic & Public Safety Division",
        "area": "Whitefield"
    },
    {
        "name": "PSI Kavita Sharma",
        "email": "kavita@ksp.gov.in",
        "role": "junior_officer",
        "phone": "+91 94808 01007",
        "badge_number": "KSP-PSI-2780",
        "unit": "Law & Order Division",
        "area": "Malleshwaram"
    }
]

# Exactly 8 Curated Fictional Complaints (4 Kannada ~ 50%, 4 English ~ 50%)
RAW_COMPLAINTS_SEED = [
    # 1. Cybercrime (English, Urgent, In Progress - Due in 18h / 24h reminder territory)
    {
        "title": "Unauthorized debit card OTP compromise and WhatsApp phishing",
        "lang": "en",
        "orig": "I received an urgent message on WhatsApp masquerading as Bangalore Electricity Supply Company (BESCOM) asking to update meter details via an APK link. Within 15 minutes, two unauthorized transactions totaling Rs 38,500 were debited from my SBI account without my consent.",
        "en": "I received an urgent message on WhatsApp masquerading as Bangalore Electricity Supply Company (BESCOM) asking to update meter details via an APK link. Within 15 minutes, two unauthorized transactions totaling Rs 38,500 were debited from my SBI account without my consent.",
        "cat": "Cybercrime",
        "prio": "Urgent",
        "status": "In Progress",
        "officer_badge": "KSP-PSI-2489",
        "age_days": 1,
        "due_hours": 18,
        "next_action": "Freeze recipient beneficiary bank accounts via 1930 portal integration and trace IP origin of phishing server."
    },
    # 2. Kannada - Cybercrime (High, Assigned - Fresh intake due in 22h)
    {
        "title": "ಇನ್‌ಸ್ಟಾಗ್ರಾಂ ಖಾತೆ ಹ್ಯಾಕ್ ಮಾಡಿ ಸ್ನೇಹಿತರಿಂದ ಹಣ ವಸೂಲಿ",
        "lang": "kn",
        "orig": "ನನ್ನ ಅಧಿಕೃತ ಇನ್‌ಸ್ಟಾಗ್ರಾಂ ಖಾತೆಯನ್ನು ಅಪರಿಚಿತ ವ್ಯಕ್ತಿ ಹ್ಯಾಕ್ ಮಾಡಿದ್ದಾನೆ. ನನ್ನ ಸ್ನೇಹಿತರು ಮತ್ತು ಕುಟುಂಬದವರಿಗೆ ತುರ್ತು ಚಿಕಿತ್ಸೆ ನೆಪವೊಡ್ಡಿ ಯುಪಿಐ ಮೂಲಕ ತಲಾ ₹5,000 ಕಳುಹಿಸುವಂತೆ ಸಂದೇಶ ಕಳುಹಿಸುತ್ತಿದ್ದಾನೆ. ಮೂವರು ಸ್ನೇಹಿತರು ಈಗಾಗಲೇ ಹಣ ಕಳೆದುಕೊಂಡಿದ್ದಾರೆ.",
        "en": "An unknown perpetrator hacked my Instagram account and sent fraudulent emergency medical messages to my contacts requesting Rs 5,000 via UPI. Three friends have already transferred money.",
        "cat": "Cybercrime",
        "prio": "High",
        "status": "Assigned",
        "officer_badge": "KSP-PSI-2489",
        "age_days": 1,
        "due_hours": 22,
        "next_action": "Serve legal notice under Section 91 CrPC to Meta Grievance Officer and acquire offending IP access logs."
    },
    # 3. Financial Fraud (English, High, In Progress - Overdue 1 day)
    {
        "title": "Fraudulent stock trading scheme promising 40% guaranteed weekly returns",
        "lang": "en",
        "orig": "I was added to a Telegram group named 'Karnataka Institutional Investors Circle'. An administrator lured me into investing Rs 1,75,000 through an unregulated portal claiming SEBI approval. When I requested withdrawal, they demanded an additional 25% clearance tax.",
        "en": "I was added to a Telegram group named 'Karnataka Institutional Investors Circle'. An administrator lured me into investing Rs 1,75,000 through an unregulated portal claiming SEBI approval. When I requested withdrawal, they demanded an additional 25% clearance tax.",
        "cat": "Financial Fraud",
        "prio": "High",
        "status": "In Progress",
        "officer_badge": "KSP-PSI-3120",
        "age_days": 4,
        "due_hours": -26,
        "next_action": "Issue formal requisition to nodal bank for blocking destination accounts and obtain KYC details of account holder."
    },
    # 4. Kannada - Financial Fraud (Urgent, In Progress - Overdue 4 days -> Escalated Level 1)
    {
        "title": "ಆನ್‌ಲೈನ್ ಸಾಲದ ಆ್ಯಪ್ ಮೂಲಕ ಕಿರುಕುಳ ಮತ್ತು ಸುಲಿಗೆ",
        "lang": "kn",
        "orig": "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ 'ಕ್ವಿಕ್‌ಲೋನ್' ಆ್ಯಪ್ ಮೂಲಕ ₹10,000 ಸಾಲ ಪಡೆದಿದ್ದೆ. ₹15,000 ಮರುಪಾವತಿಸಿದ ನಂತರವೂ ಅವರ ಪ್ರತಿನಿಧಿಗಳು ನನ್ನ ಮೊಬೈಲ್ ಸಂಪರ್ಕಗಳಿಗೆ ಆಕ್ಷೇಪಾರ್ಹ ಸಂದೇಶಗಳನ್ನು ಕಳುಹಿಸಿ ಬೆದರಿಕೆ ಹಾಕುತ್ತಿದ್ದಾರೆ ಮತ್ತು ದಿನಕ್ಕೆ ₹5,000 ಹೆಚ್ಚುವರಿ ಹಣ ನೀಡುವಂತೆ ಪೀಡಿಸುತ್ತಿದ್ದಾರೆ.",
        "en": "Obtained Rs 10,000 loan via 'QuickLoan' mobile application. Despite repaying Rs 15,000, recovery agents accessed my contact book and are sending abusive messages and extortion demands to friends and family.",
        "cat": "Financial Fraud",
        "prio": "Urgent",
        "status": "In Progress",
        "officer_badge": "KSP-PSI-3120",
        "age_days": 7,
        "due_hours": -96,
        "next_action": "Trace call origin locations and coordinate with telecom cyber cell to deactivate extortionist numbers."
    },
    # 5. Lost Property (English, Medium, Resolved - Concluded with recovery report)
    {
        "title": "Lost backpack containing MacBook Pro and original degree certificates in BMTC bus",
        "lang": "en",
        "orig": "I boarded BMTC route 365 from Majestic to Bannerghatta Road at 6:30 PM. I forgot my black American Tourister backpack containing an Apple laptop (Serial C02G9017MD6T) and engineering certificates on seat 14.",
        "en": "I boarded BMTC route 365 from Majestic to Bannerghatta Road at 6:30 PM. I forgot my black American Tourister backpack containing an Apple laptop (Serial C02G9017MD6T) and engineering certificates on seat 14.",
        "cat": "Lost Property",
        "prio": "Medium",
        "status": "Resolved",
        "officer_badge": "KSP-PSI-4051",
        "age_days": 10,
        "due_hours": 48,
        "next_action": "Property recovered from BMTC Central Depot lost property cell and returned to complainant against verified acknowledgement."
    },
    # 6. Kannada - Lost Property (Medium, Accepted - Scheduled by DySP review)
    {
        "title": "ಜಯನಗರ 4ನೇ ಬ್ಲಾಕ್ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಕಳೆದುಹೋದ ಮೊಬೈಲ್ ಫೋನ್",
        "lang": "kn",
        "orig": "ದಿನಾಂಕ 8ರಂದು ಸಂಜೆ 5:30 ಕ್ಕೆ ಜಯನಗರ ಕಾಂಪ್ಲೆಕ್ಸ್‌ನಲ್ಲಿ ಶಾಪಿಂಗ್ ಮಾಡುತ್ತಿದ್ದಾಗ ನನ್ನ ಸ್ಯಾಮ್‌ಸಂಗ್ ಗ್ಯಾಲಕ್ಸಿ ಎಸ್23 ಫೋನ್ (IMEI: 358921098451234) ಕಳೆದುಹೋಗಿದೆ. ಕರೆ ಮಾಡಿದರೆ ಸ್ವಿಚ್ ಆಫ್ ಆಗಿದೆ ಎಂದು ಬರುತ್ತಿದೆ.",
        "en": "Lost Samsung Galaxy S23 mobile phone (IMEI: 358921098451234) while shopping at Jayanagar 4th Block Complex. Phone is currently switched off.",
        "cat": "Lost Property",
        "prio": "Medium",
        "status": "Accepted",
        "officer_badge": "KSP-PSI-4051",
        "age_days": 2,
        "due_hours": 70,
        "next_action": "Register IMEI on Central Equipment Identity Register (CEIR) portal for cellular network tracking."
    },
    # 7. Traffic & Public Safety (English, Urgent, In Progress - Overdue 8 days -> Red Flag Level 2)
    {
        "title": "Severe hit-and-run accident on Outer Ring Road near Marathahalli flyover",
        "lang": "en",
        "orig": "A speeding white SUV (partial registration KA-03-MN-****) jumped the signal at Marathahalli junction and hit a two-wheeler rider, causing grievous injuries, before fleeing toward Kadubeesanahalli without stopping.",
        "en": "A speeding white SUV (partial registration KA-03-MN-****) jumped the signal at Marathahalli junction and hit a two-wheeler rider, causing grievous injuries, before fleeing toward Kadubeesanahalli without stopping.",
        "cat": "Traffic & Public Safety",
        "prio": "Urgent",
        "status": "In Progress",
        "officer_badge": "KSP-PSI-1892",
        "age_days": 12,
        "due_hours": -192,
        "next_action": "Subpoena traffic surveillance cameras at Marathahalli flyover and cross-reference ANPR vehicle registration records."
    },
    # 8. Kannada - Complaints Involving Individuals (High, Closed - Concluded with citizen feedback)
    {
        "title": "ಖಾಸಗಿ ಕಂಪನಿಯಲ್ಲಿ ಮಹಿಳಾ ಉದ್ಯೋಗಿಗೆ ಮೇಲಧಿಕಾರಿಯಿಂದ ಮಾನಸಿಕ ಕಿರುಕುಳ",
        "lang": "kn",
        "orig": "ಮಾನ್ಯತಾ ಟೆಕ್ ಪಾರ್ಕ್‌ನಲ್ಲಿರುವ ಸಾಫ್ಟ್‌ವೇರ್ ಕಂಪನಿಯ ಮ್ಯಾನೇಜರ್ ಪದೇ ಪದೇ ಅಸಭ್ಯ ಸಂದೇಶಗಳನ್ನು ಕಳುಹಿಸಿ ವೃತ್ತಿಪರ ಕಿರುಕುಳ ನೀಡುತ್ತಿದ್ದರು. ಆಂತರಿಕ ದೂರು ಸಮಿತಿಗೆ ತಿಳಿಸಿದರೂ ಕ್ರಮ ಕೈಗೊಂಡಿರಲಿಲ್ಲ.",
        "en": "Manager at tech park software company subjected female employee to continuous workplace harassment. Company internal complaints committee failed to act.",
        "cat": "Complaints Involving Individuals",
        "prio": "High",
        "status": "Closed",
        "officer_badge": "KSP-PSI-2780",
        "age_days": 14,
        "due_hours": 0,
        "next_action": "Police inquiry conducted. Formal POSH inquiry initiated by company board; offending executive terminated."
    }
]


def seed_database(force: bool = False):
    """
    Seeds database with demo accounts, configuration rules, and 8 realistic complaints
    with 20-30 cryptographic hash-chained audit logs and dedicated role-specific notifications.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        init_clock()
        sim_now = get_now()

        # 1. Seed or update Demo Users
        user_cache = {}
        for udata in DEMO_USERS:
            existing = db.query(User).filter(User.email == udata["email"]).first()
            if not existing:
                user = User(
                    name=udata["name"],
                    email=udata["email"],
                    password_hash=hash_password(DEFAULT_PASSWORD),
                    role=udata["role"],
                    phone=udata["phone"],
                    badge_number=udata["badge_number"],
                    unit=udata["unit"],
                    area=udata["area"],
                    created_at=sim_now - timedelta(days=60)
                )
                db.add(user)
                db.flush()
                user_cache[udata["email"]] = user
            else:
                user_cache[udata["email"]] = existing

        officer_badge_map = {}
        for u in db.query(User).filter(User.role == "junior_officer").all():
            if u.badge_number:
                officer_badge_map[u.badge_number] = u

        citizen_user = user_cache.get("citizen@demo.com") or db.query(User).filter(User.role == "citizen").first()
        supervisor_user = user_cache.get("supervisor@demo.com") or db.query(User).filter(User.role == "senior_supervisor").first()
        junior_user = user_cache.get("junior@demo.com") or db.query(User).filter(User.role == "junior_officer").first()

        # 2. Seed Default SLA Configuration Rules
        from app.routers.admin import DEFAULT_CONFIGS
        for dc in DEFAULT_CONFIGS:
            existing_cfg = db.query(SystemConfig).filter(SystemConfig.key == dc["key"]).first()
            if not existing_cfg:
                db.add(SystemConfig(key=dc["key"], value=dc["value"], description=dc["description"]))

        # 3. Check if complaints are already seeded (threshold 7)
        existing_complaint_count = db.query(Complaint).count()
        if not force and existing_complaint_count >= 7:
            verify_res = verify_audit_chain(db)
            if verify_res["valid"]:
                print(f"Database already populated with {existing_complaint_count} complaints. Audit chain valid: True.")
                return
            else:
                print("Corrupted audit chain detected from previous test session. Purging and re-seeding clean ledger...")

        print("Purging prior data and re-seeding exactly 8 complaints with ~25 pristine cryptographic audit entries...")
        db.query(ComplaintDocument).delete()
        db.query(Feedback).delete()
        db.query(Notification).delete()
        db.query(DailySupervisorSummary).delete()
        db.query(ActionLog).delete()
        db.query(Complaint).delete()
        db.commit()

        prefix_counters = {"CYB": 0, "FIN": 0, "LST": 0, "TRF": 0, "IND": 0}
        cat_prefix = {
            "Cybercrime": "CYB",
            "Financial Fraud": "FIN",
            "Lost Property": "LST",
            "Traffic & Public Safety": "TRF",
            "Complaints Involving Individuals": "IND"
        }

        created_complaints = []

        for idx, item in enumerate(RAW_COMPLAINTS_SEED, 1):
            pfx = cat_prefix[item["cat"]]
            prefix_counters[pfx] += 1
            cid = f"KA-{pfx}-2026-{prefix_counters[pfx]:04d}"

            c_created = sim_now - timedelta(days=item["age_days"])
            c_due = sim_now + timedelta(hours=item["due_hours"])
            is_overdue = sim_now > c_due and item["status"] not in ["Resolved", "Closed"]

            is_escalated = False
            esc_level = 0
            esc_at = None
            if is_overdue:
                overdue_days = (sim_now - c_due).days
                if overdue_days >= 7:
                    is_escalated = True
                    esc_level = 2
                    esc_at = c_due + timedelta(days=3)
                elif overdue_days >= 3:
                    is_escalated = True
                    esc_level = 1
                    esc_at = c_due + timedelta(days=3)

            officer = officer_badge_map.get(item["officer_badge"])
            if not officer:
                officer = db.query(User).filter(User.role == "junior_officer").first()

            res_report = None
            closure_note = None
            if item["status"] in ["Resolved", "Closed"]:
                res_report = f"Case investigation concluded successfully by {officer.name}. Formal resolution filed."
            if item["status"] == "Closed":
                closure_note = "Grievance settled satisfactorily. Confirmed by citizen verification."

            comp = Complaint(
                id=cid,
                complainant_id=citizen_user.id,
                complainant_name=citizen_user.name,
                complainant_phone=citizen_user.phone or "+91 98450 12345",
                title=item["title"],
                original_text=item["orig"],
                english_text=item["en"],
                language=item["lang"],
                category=item["cat"],
                priority=item["prio"],
                ai_confidence=0.92 if item["lang"] == "en" else 0.88,
                ai_summary=item["en"][:140] + "...",
                duplicate_of=None,
                ai_flag_banner=False,
                status=item["status"],
                assigned_officer_id=officer.id,
                assigned_officer_name=officer.name,
                assigned_unit=officer.unit or "Law & Order",
                assigned_area=officer.area or "Central",
                next_action=item["next_action"],
                due_date=c_due,
                resolution_report=res_report,
                closure_note=closure_note,
                is_overdue=is_overdue,
                is_escalated=is_escalated,
                escalated_at=esc_at,
                escalation_level=esc_level,
                last_activity_at=c_created + timedelta(hours=12),
                created_at=c_created,
                updated_at=sim_now if item["status"] in ["Resolved", "Closed"] else c_created + timedelta(hours=6)
            )
            db.add(comp)
            db.flush()
            created_complaints.append((comp, officer, c_created, c_due, is_overdue, is_escalated, esc_at, res_report, closure_note, idx))

        # Build chronological audit trail (exactly 25 entries across the 8 complaints)
        # Complaint 1: KA-CYB-2026-0001
        c1, off1, t1_cr, _, _, _, _, _, _, _ = created_complaints[0]
        log_action(db=db, complaint_id=c1.id, action="REGISTRATION", user_id=citizen_user.id, user_name=citizen_user.name, user_role=citizen_user.role, old_status=None, new_status="Assigned", description=f"Citizen registered '{c1.title}' (Urgent). Routed to Cyber Crime Division.", timestamp=t1_cr)
        log_action(db=db, complaint_id=c1.id, action="ACCEPTANCE", user_id=off1.id, user_name=off1.name, user_role=off1.role, old_status="Assigned", new_status="Accepted", description=f"Officer {off1.name} acknowledged case and scheduled preliminary freeze order.", timestamp=t1_cr + timedelta(hours=2))
        log_action(db=db, complaint_id=c1.id, action="STATUS_CHANGE", user_id=off1.id, user_name=off1.name, user_role=off1.role, old_status="Accepted", new_status="In Progress", description=f"Investigation underway. 1930 portal integration initiated. Next action: {c1.next_action}", timestamp=t1_cr + timedelta(hours=6))

        # Complaint 2: KA-CYB-2026-0002
        c2, off2, t2_cr, _, _, _, _, _, _, _ = created_complaints[1]
        log_action(db=db, complaint_id=c2.id, action="REGISTRATION", user_id=citizen_user.id, user_name=citizen_user.name, user_role=citizen_user.role, old_status=None, new_status="Assigned", description=f"Citizen registered grievance '{c2.title}' (High Priority). Assigned to {off2.name}.", timestamp=t2_cr)

        # Complaint 3: KA-FIN-2026-0001
        c3, off3, t3_cr, _, _, _, _, _, _, _ = created_complaints[2]
        log_action(db=db, complaint_id=c3.id, action="REGISTRATION", user_id=citizen_user.id, user_name=citizen_user.name, user_role=citizen_user.role, old_status=None, new_status="Assigned", description=f"Citizen registered financial fraud grievance '{c3.title}'.", timestamp=t3_cr)
        log_action(db=db, complaint_id=c3.id, action="ACCEPTANCE", user_id=off3.id, user_name=off3.name, user_role=off3.role, old_status="Assigned", new_status="Accepted", description=f"Officer {off3.name} accepted complaint for bank trail inquiry.", timestamp=t3_cr + timedelta(hours=3))
        log_action(db=db, complaint_id=c3.id, action="STATUS_CHANGE", user_id=off3.id, user_name=off3.name, user_role=off3.role, old_status="Accepted", new_status="In Progress", description="Requisition issued to nodal bank. Follow-up due date recorded.", timestamp=t3_cr + timedelta(days=1))

        # Complaint 4: KA-FIN-2026-0002
        c4, off4, t4_cr, _, _, _, esc_at4, _, _, _ = created_complaints[3]
        log_action(db=db, complaint_id=c4.id, action="REGISTRATION", user_id=citizen_user.id, user_name=citizen_user.name, user_role=citizen_user.role, old_status=None, new_status="Assigned", description=f"Citizen registered loan app harassment complaint '{c4.title}' (Urgent).", timestamp=t4_cr)
        log_action(db=db, complaint_id=c4.id, action="ACCEPTANCE", user_id=off4.id, user_name=off4.name, user_role=off4.role, old_status="Assigned", new_status="In Progress", description=f"Officer {off4.name} commenced telecom CDR analysis.", timestamp=t4_cr + timedelta(hours=4))
        log_action(db=db, complaint_id=c4.id, action="ESCALATION", user_id=None, user_name="CIVANTA SLA Escalation Engine", user_role="system", old_status="In Progress", new_status="In Progress", description="Statutory timeline exceeded by 3+ days. Case elevated to Supervisory Command Console.", timestamp=esc_at4 or (t4_cr + timedelta(days=3)))

        # Complaint 5: KA-LST-2026-0001
        c5, off5, t5_cr, _, _, _, _, res5, _, _ = created_complaints[4]
        log_action(db=db, complaint_id=c5.id, action="REGISTRATION", user_id=citizen_user.id, user_name=citizen_user.name, user_role=citizen_user.role, old_status=None, new_status="Assigned", description=f"Citizen reported lost property '{c5.title}'.", timestamp=t5_cr)
        log_action(db=db, complaint_id=c5.id, action="ACCEPTANCE", user_id=off5.id, user_name=off5.name, user_role=off5.role, old_status="Assigned", new_status="Accepted", description=f"Officer {off5.name} initiated BMTC depot coordination.", timestamp=t5_cr + timedelta(hours=2))
        log_action(db=db, complaint_id=c5.id, action="STATUS_CHANGE", user_id=off5.id, user_name=off5.name, user_role=off5.role, old_status="Accepted", new_status="In Progress", description="BMTC lost & found verified. Complainant summoned for physical verification.", timestamp=t5_cr + timedelta(days=2))
        log_action(db=db, complaint_id=c5.id, action="RESOLUTION", user_id=off5.id, user_name=off5.name, user_role=off5.role, old_status="In Progress", new_status="Resolved", description=f"Resolution report submitted: {res5}", timestamp=sim_now - timedelta(days=1))

        # Complaint 6: KA-LST-2026-0002
        c6, off6, t6_cr, _, _, _, _, _, _, _ = created_complaints[5]
        log_action(db=db, complaint_id=c6.id, action="REGISTRATION", user_id=citizen_user.id, user_name=citizen_user.name, user_role=citizen_user.role, old_status=None, new_status="Assigned", description=f"Citizen registered lost phone grievance '{c6.title}'.", timestamp=t6_cr)
        log_action(db=db, complaint_id=c6.id, action="ACCEPTANCE", user_id=off6.id, user_name=off6.name, user_role=off6.role, old_status="Assigned", new_status="Accepted", description=f"Officer {off6.name} acknowledged and verified CEIR registration requirement.", timestamp=t6_cr + timedelta(hours=3))
        log_action(db=db, complaint_id=c6.id, action="SUPERVISOR_REVIEW", user_id=supervisor_user.id, user_name=supervisor_user.name, user_role=supervisor_user.role, old_status="Accepted", new_status="Accepted", description="DySP Rajeshwari Hegde reviewed complaint and scheduled priority CEIR trace.", timestamp=t6_cr + timedelta(hours=18))

        # Complaint 7: KA-TRF-2026-0001
        c7, off7, t7_cr, _, _, _, esc_at7, _, _, _ = created_complaints[6]
        log_action(db=db, complaint_id=c7.id, action="REGISTRATION", user_id=citizen_user.id, user_name=citizen_user.name, user_role=citizen_user.role, old_status=None, new_status="Assigned", description=f"Citizen reported hit-and-run incident '{c7.title}' (Urgent).", timestamp=t7_cr)
        log_action(db=db, complaint_id=c7.id, action="ACCEPTANCE", user_id=off7.id, user_name=off7.name, user_role=off7.role, old_status="Assigned", new_status="In Progress", description=f"Officer {off7.name} requisitioned CCTV footage at Marathahalli flyover.", timestamp=t7_cr + timedelta(hours=3))
        log_action(db=db, complaint_id=c7.id, action="ESCALATION", user_id=None, user_name="CIVANTA SLA Escalation Engine", user_role="system", old_status="In Progress", new_status="In Progress", description="CRITICAL SLA BREACH (8 days overdue): Level-2 Red Flag elevated to Supervisory Command Console.", timestamp=esc_at7 or (t7_cr + timedelta(days=7)))

        # Complaint 8: KA-IND-2026-0001
        c8, off8, t8_cr, _, _, _, _, res8, close8, _ = created_complaints[7]
        log_action(db=db, complaint_id=c8.id, action="REGISTRATION", user_id=citizen_user.id, user_name=citizen_user.name, user_role=citizen_user.role, old_status=None, new_status="Assigned", description=f"Citizen registered workplace harassment complaint '{c8.title}'.", timestamp=t8_cr)
        log_action(db=db, complaint_id=c8.id, action="ACCEPTANCE", user_id=off8.id, user_name=off8.name, user_role=off8.role, old_status="Assigned", new_status="In Progress", description=f"Officer {off8.name} initiated formal inquiry with corporate ICC.", timestamp=t8_cr + timedelta(hours=2))
        log_action(db=db, complaint_id=c8.id, action="STATUS_CHANGE", user_id=off8.id, user_name=off8.name, user_role=off8.role, old_status="In Progress", new_status="In Progress", description="Corporate ICC submitted findings; police statement recorded.", timestamp=t8_cr + timedelta(days=4))
        log_action(db=db, complaint_id=c8.id, action="RESOLUTION", user_id=off8.id, user_name=off8.name, user_role=off8.role, old_status="In Progress", new_status="Resolved", description=f"Resolution submitted: {res8}", timestamp=sim_now - timedelta(days=2))
        log_action(db=db, complaint_id=c8.id, action="CLOSURE", user_id=citizen_user.id, user_name=citizen_user.name, user_role=citizen_user.role, old_status="Resolved", new_status="Closed", description=f"Citizen verified resolution and closed grievance: {close8}", timestamp=sim_now - timedelta(hours=12))

        # Seed citizen feedback for Case 8
        fb = Feedback(
            complaint_id=c8.id,
            citizen_id=citizen_user.id,
            rating=5,
            comment="Very professional and prompt inquiry conducted by Karnataka Police. Matter resolved completely.",
            created_at=sim_now - timedelta(hours=11)
        )
        db.add(fb)

        # 4. Seed Dedicated Role-Specific Notifications
        # Citizen Notifications (5 targeted notifications)
        citizen_notifs = [
            {
                "user_id": citizen_user.id,
                "complaint_id": c1.id,
                "type": "case_registered",
                "title": f"Grievance Registered: {c1.id}",
                "en": f"Your grievance '{c1.title}' has been successfully registered and routed to Cyber Crime Division.",
                "kn": f"ನಿಮ್ಮ ದೂರು '{c1.title}' ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದ್ದು, ಸೈಬರ್ ಅಪರಾಧ ವಿಭಾಗಕ್ಕೆ ರವಾನಿಸಲಾಗಿದೆ.",
                "created": t1_cr
            },
            {
                "user_id": citizen_user.id,
                "complaint_id": c1.id,
                "type": "officer_assigned",
                "title": "Investigating Officer Assigned",
                "en": f"PSI Anand Kumar (Badge: KSP-PSI-2489) has been assigned as investigating officer for case {c1.id}.",
                "kn": f"ಪಿಎಸ್‌ಐ ಆನಂದ್ ಕುಮಾರ್ (ಬ್ಯಾಡ್ಜ್: KSP-PSI-2489) ಅವರನ್ನು ನಿಮ್ಮ ಪ್ರಕರಣ {c1.id} ಕ್ಕೆ ತನಿಖಾಧಿಕಾರಿಯಾಗಿ ನಿಯೋಜಿಸಲಾಗಿದೆ.",
                "created": t1_cr + timedelta(hours=2)
            },
            {
                "user_id": citizen_user.id,
                "complaint_id": c6.id,
                "type": "case_scheduled",
                "title": "Supervisory Review Scheduled",
                "en": f"DySP Rajeshwari Hegde has scheduled preliminary verification for your case {c6.id} with the Lost Property Desk.",
                "kn": f"ಡಿವೈಎಸ್ಪಿ ರಾಜೇಶ್ವರಿ ಹೆಗಡೆ ಅವರು ನಿಮ್ಮ ದೂರು {c6.id} ರ ಪ್ರಾಥಮಿಕ ಪರಿಶೀಲನೆಯನ್ನು ನಿಗದಿಪಡಿಸಿದ್ದಾರೆ.",
                "created": t6_cr + timedelta(hours=18)
            },
            {
                "user_id": citizen_user.id,
                "complaint_id": c5.id,
                "type": "case_resolved",
                "title": f"Grievance Resolved: {c5.id}",
                "en": f"Your complaint regarding lost backpack has been marked Resolved. Verified recovery report filed. Please submit your feedback.",
                "kn": f"ಕಳೆದುಹೋದ ಬ್ಯಾಗ್ ದೂರು {c5.id} ಪರಿಹಾರಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ತೃಪ್ತಿ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ದಾಖಲಿಸಿ.",
                "created": sim_now - timedelta(days=1)
            },
            {
                "user_id": citizen_user.id,
                "complaint_id": c8.id,
                "type": "case_closed",
                "title": f"Case Closed: {c8.id}",
                "en": f"Complaint {c8.id} has been formally closed with citizen satisfaction. Thank you for using CIVANTA.",
                "kn": f"ದೂರು {c8.id} ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮುಕ್ತಾಯಗೊಳಿಸಲಾಗಿದೆ. ಸಿವಾಂತ (CIVANTA) ಬಳಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.",
                "created": sim_now - timedelta(hours=12)
            }
        ]

        # Junior Officer Notifications (PSI Anand Kumar)
        junior_notifs = [
            {
                "user_id": junior_user.id,
                "complaint_id": c1.id,
                "type": "case_assigned",
                "title": f"New Urgent Grievance: {c1.id}",
                "en": f"Urgent cybercrime grievance assigned. Preliminary action required within 24 hours. Category: Cybercrime.",
                "kn": f"ಹೊಸ ತುರ್ತು ದೂರು ನಿಯೋಜಿಸಲಾಗಿದೆ: {c1.id}. ಮೊದಲ ಕ್ರಮದ ಗಡುವು: 24 ಗಂಟೆ.",
                "created": t1_cr + timedelta(hours=1)
            },
            {
                "user_id": junior_user.id,
                "complaint_id": c2.id,
                "type": "case_assigned",
                "title": f"New Case Assigned: {c2.id}",
                "en": f"High-priority complaint 'Instagram account compromise' assigned to your roster. Required first response in 24h.",
                "kn": f"ಹೊಸ ಆದ್ಯತೆಯ ದೂರು ನಿಯೋಜಿಸಲಾಗಿದೆ: {c2.id} (ಇನ್‌ಸ್ಟಾಗ್ರಾಂ ಖಾತೆ ಹ್ಯಾಕ್).",
                "created": t2_cr + timedelta(hours=1)
            },
            {
                "user_id": junior_user.id,
                "complaint_id": c1.id,
                "type": "due_reminder",
                "title": f"24-Hour SLA Reminder: {c1.id}",
                "en": f"Next action due in 18 hours. Target: Freeze recipient beneficiary bank accounts via 1930 portal.",
                "kn": f"24-ಗಂಟೆಗಳ ಎಸ್‌ಎಲ್‌ಎ ಎಚ್ಚರಿಕೆ: {c1.id} ಪ್ರಕರಣದ ಗಡುವಿಗೆ 18 ಗಂಟೆಗಳು ಬಾಕಿ ಇವೆ. ಮುಂದಿನ ಕ್ರಮ ದಾಖಲಿಸಿ.",
                "created": sim_now - timedelta(hours=6)
            },
            {
                "user_id": junior_user.id,
                "complaint_id": c1.id,
                "type": "supervisor_directive",
                "title": "Command Directive: DySP Rajeshwari Hegde",
                "en": f"Supervisory review directive on case {c1.id}: Verify beneficiary account freezing with SBI nodal desk.",
                "kn": f"ಮೇಲಧಿಕಾರಿ ನಿರ್ದೇಶನ: {c1.id} ಪ್ರಕರಣದಲ್ಲಿ ಫಲಾನುಭವಿ ಖಾತೆ ಫ್ರೀಜ್ ವಿವರಗಳನ್ನು ಧೃಡಪಡಿಸಿ.",
                "created": sim_now - timedelta(hours=3)
            }
        ]

        # Supervisor Notifications (DySP Rajeshwari Hegde)
        supervisor_notifs = [
            {
                "user_id": supervisor_user.id,
                "complaint_id": c4.id,
                "type": "citizen_filing",
                "title": f"High Priority Intake: {c4.id}",
                "en": f"Citizen Ramesh Gowda filed Urgent grievance {c4.id} ('QuickLoan harassment & extortion'). Assigned to Economic Offences Wing.",
                "kn": f"ಹೊಸ ತುರ್ತು ದೂರು ಸಲ್ಲಿಕೆ: ನಾಗರಿಕ ರಮೇಶ್ ಗೌಡ ಅವರಿಂದ {c4.id} (ಆನ್‌ಲೈನ್ ಸಾಲ ಸುಲಿಗೆ) ದಾಖಲಾಗಿದೆ.",
                "created": t4_cr
            },
            {
                "user_id": supervisor_user.id,
                "complaint_id": c7.id,
                "type": "highest_priority_breach",
                "title": f"CRITICAL RED FLAG: 8-Day SLA Breach ({c7.id})",
                "en": f"Case {c7.id} (Outer Ring Road Hit-and-run) is 8 days overdue under PSI Suresh Gowda. Level-2 Red Flag elevated to your console.",
                "kn": f"ಗಂಭೀರ ಎಸ್‌ಎಲ್‌ಎ ಉಲ್ಲಂಘನೆ: {c7.id} ಪ್ರಕರಣ 8 ದಿನಗಳ ಕಾಲ ಗಡುವು ಮೀರಿದೆ. ಲೆವೆಲ್-2 ಕೆಂಪು ಎಚ್ಚರಿಕೆ ರವಾನಿಸಲಾಗಿದೆ.",
                "created": sim_now - timedelta(days=1)
            },
            {
                "user_id": supervisor_user.id,
                "complaint_id": c4.id,
                "type": "escalation_alert",
                "title": f"Level-1 Supervisory Escalation: {c4.id}",
                "en": f"Case {c4.id} has crossed 3-day overdue threshold. Elevated to Supervisory Command for re-direction or reassignment.",
                "kn": f"ಮೇಲ್ದರ್ಜೆಗೇರಿಸಿದ ದೂರು: {c4.id} ಪ್ರಕರಣವು 3 ದಿನಗಳ ಕಾಲ ಬಾಕಿ ಇದ್ದು ನಿಮ್ಮ ಪರಿಶೀಲನೆಗೆ ಬಂದಿದೆ.",
                "created": esc_at4 or (t4_cr + timedelta(days=3))
            },
            {
                "user_id": supervisor_user.id,
                "complaint_id": c3.id,
                "type": "rescheduling_request",
                "title": f"Officer Rescheduling Request: {c3.id}",
                "en": f"PSI Manjunath Naik submitted 48-hour extension request for {c3.id} citing pending bank nodal response.",
                "kn": f"ಅಧಿಕಾರಿ ಮರುನಿಗದಿ ವಿನಂತಿ: ಪಿಎಸ್‌ಐ ಮಂಜುನಾಥ್ ನಾಯಕ್ {c3.id} ಪ್ರಕರಣಕ್ಕೆ 48 ಗಂಟೆಗಳ ವಿಸ್ತರಣೆ ಕೋರಿದ್ದಾರೆ.",
                "created": sim_now - timedelta(hours=8)
            },
            {
                "user_id": supervisor_user.id,
                "complaint_id": c5.id,
                "type": "case_resolved",
                "title": f"Resolution Certified: {c5.id}",
                "en": f"PSI Deepa Patil submitted verified resolution report for lost property case {c5.id} (BMTC Depot recovery).",
                "kn": f"ಪರಿಹಾರ ವರದಿ ದೃಢೀಕರಣ: ಪಿಎಸ್‌ಐ ದೀಪಾ ಪಾಟೀಲ್ ಕಳೆದುಹೋದ ವಸ್ತು ಪ್ರಕರಣ {c5.id} ಕ್ಕೆ ಪರಿಹಾರ ವರದಿ ಸಲ್ಲಿಸಿದ್ದಾರೆ.",
                "created": sim_now - timedelta(days=1)
            }
        ]

        for n_data in citizen_notifs + junior_notifs + supervisor_notifs:
            notif = Notification(
                user_id=n_data["user_id"],
                complaint_id=n_data["complaint_id"],
                type=n_data["type"],
                title=n_data["title"],
                message_en=n_data["en"],
                message_kn=n_data["kn"],
                is_read=False,
                created_at=n_data["created"],
                event_key=f"seed_{n_data['user_id']}_{n_data['type']}_{n_data['complaint_id']}"
            )
            db.add(notif)

        # 5. Generate Initial Daily Summary
        generate_daily_supervisor_summary(db, sim_now)

        db.commit()
        print("Database seeding completed successfully.")

        # Verify audit chain integrity immediately
        chain_status = verify_audit_chain(db)
        print(f"Cryptographic Audit Chain Integrity: {chain_status['message']} (Total verified entries: {chain_status['total_verified']})")

    except Exception as exc:
        db.rollback()
        print(f"Error during database seeding: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(force=True)
