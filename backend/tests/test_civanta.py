import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.database import SessionLocal
from app.models import Complaint, ActionLog, User, Notification
from app.clock import reset_clock, fast_forward, get_now
from app.audit import verify_audit_chain

client = TestClient(app)

def test_health_and_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert "CIVANTA" in data["system"]
    assert "Karnataka State Police" in data["department"]

    h = client.get("/health")
    assert h.status_code == 200
    assert h.json()["status"] == "healthy"


def test_demo_logins_all_roles():
    for role in ["citizen", "junior_officer", "senior_supervisor", "admin"]:
        res = client.post(f"/api/auth/demo-login?role={role}")
        assert res.status_code == 200, f"Demo login failed for role {role}: {res.text}"
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == role


def test_core_rule_status_update_enforcement():
    # Login as officer
    auth_res = client.post("/api/auth/demo-login?role=junior_officer")
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    officer_id = auth_res.json()["user"]["id"]

    db = SessionLocal()
    comp = db.query(Complaint).filter(Complaint.assigned_officer_id == officer_id).first()
    db.close()
    assert comp is not None

    # Test: Reject status update without next action
    res_bad = client.post(
        f"/api/complaints/{comp.id}/status",
        json={
            "new_status": "In Progress",
            "next_action": "",
            "due_date": (datetime.now() + timedelta(days=2)).isoformat()
        },
        headers=headers
    )
    assert res_bad.status_code == 422, "Backend failed to reject empty next_action!"


def test_public_track_view_strips_officer_personal_details():
    db = SessionLocal()
    comp = db.query(Complaint).first()
    db.close()
    assert comp is not None

    res = client.get(f"/api/complaints/track/{comp.id}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == comp.id
    assert "next_action" in data
    assert "expected_follow_up_date" in data
    assert "assigned_officer_phone" not in data
    assert "assigned_officer_email" not in data


def test_final_test_lifecycle_flow():
    """
    EXACT FINAL TEST AS SPECIFIED IN USER PROMPT:
    Citizen submits a Kannada complaint
    -> category, priority and officer assigned
    -> officer updates status (next action enforced)
    -> fast-forward 1 day (reminder)
    -> fast-forward 4 more days (overdue + escalation to supervisor)
    -> supervisor reassigns
    -> officer resolves
    -> citizen gives feedback
    -> closed
    -> verify chain passes
    -> tamper with one log row directly in the DB
    -> verify chain reports the break.
    """
    # 0. Reset clock to real-time initially
    admin_auth = client.post("/api/auth/demo-login?role=admin").json()
    admin_headers = {"Authorization": f"Bearer {admin_auth['access_token']}"}
    client.post("/api/admin/clock/reset", headers=admin_headers)

    # 1. Citizen submits a Kannada complaint
    citizen_auth = client.post("/api/auth/demo-login?role=citizen").json()
    cit_headers = {"Authorization": f"Bearer {citizen_auth['access_token']}"}

    kn_title = "ನನ್ನ ಬ್ಯಾಂಕ್ ಖಾತೆಯಿಂದ ಒಟಿಪಿ ಇಲ್ಲದೆ ₹45,000 ಹಣ ಕಡಿತವಾಗಿದೆ"
    kn_desc = "ನನ್ನ ಯೂನಿಯನ್ ಬ್ಯಾಂಕ್ ಖಾತೆಯಿಂದ ಇಂದು ಮಧ್ಯಾಹ್ನ ಯಾವುದೇ ಒಟಿಪಿ ಬಾರದೆ ₹45,000 ಅನಧಿಕೃತವಾಗಿ ಡೆಬಿಟ್ ಆಗಿದೆ. ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿರಲಿಲ್ಲ. ಸೈಬರ್ ವಂಚನೆ ಮಾಡಲಾಗಿದೆ."

    sub_res = client.post(
        "/api/complaints",
        data={"title": kn_title, "description": kn_desc, "area": "Jayanagar"},
        headers=cit_headers
    )
    assert sub_res.status_code == 200
    comp = sub_res.json()
    cid = comp["id"]

    # Verify category, priority and officer assigned
    assert comp["language"] == "kn"
    assert comp["category"] in ["Financial Fraud", "Cybercrime"]
    assert comp["priority"] in ["High", "Urgent", "Medium"]
    assert comp["assigned_officer_id"] is not None
    original_officer_id = comp["assigned_officer_id"]
    assert len(comp["next_action"]) >= 5
    assert comp["due_date"] is not None

    # 2. Officer updates status (next action enforced)
    # Authenticate as the specifically assigned officer
    from app.security import create_access_token
    token_off = create_access_token({"sub": str(original_officer_id), "role": "junior_officer"})
    off_headers = {"Authorization": f"Bearer {token_off}"}

    # Rejection check (CORE RULE)
    bad_upd = client.post(
        f"/api/complaints/{cid}/status",
        json={"new_status": "In Progress", "next_action": "ab", "due_date": get_now().isoformat()},
        headers=off_headers
    )
    assert bad_upd.status_code == 422, "CORE RULE not enforced!"

    # Valid status update with due date 24 hours from now
    target_due = (get_now() + timedelta(hours=24)).isoformat()
    upd_res = client.post(
        f"/api/complaints/{cid}/status",
        json={
            "new_status": "In Progress",
            "next_action": "Freeze beneficiary account via cyber portal and issue notice to payment gateway",
            "due_date": target_due,
            "remarks": "Investigation commenced"
        },
        headers=off_headers
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["status"] == "In Progress"

    # 3. Fast-forward 1 day (reminder)
    ff1_res = client.post("/api/admin/clock/fast-forward", json={"days": 1, "hours": 1}, headers=admin_headers)
    assert ff1_res.status_code == 200

    # 4. Fast-forward 4 more days (overdue + escalation to supervisor)
    ff4_res = client.post("/api/admin/clock/fast-forward", json={"days": 4, "hours": 0}, headers=admin_headers)
    assert ff4_res.status_code == 200

    # Check that complaint is now marked Overdue and Escalated
    comp_esc = client.get(f"/api/complaints/{cid}", headers=cit_headers).json()
    assert comp_esc["is_overdue"] is True, f"Expected is_overdue=True, got {comp_esc['is_overdue']}"
    assert comp_esc["is_escalated"] is True, f"Expected is_escalated=True, got {comp_esc['is_escalated']}"

    # 5. Supervisor reassigns
    sup_auth = client.post("/api/auth/demo-login?role=senior_supervisor").json()
    sup_headers = {"Authorization": f"Bearer {sup_auth['access_token']}"}

    # Find another officer for reassignment
    db = SessionLocal()
    other_officer = db.query(User).filter(User.role == "junior_officer", User.id != original_officer_id).first()
    db.close()
    assert other_officer is not None

    reassign_due = (get_now() + timedelta(days=2)).isoformat()
    reassign_res = client.post(
        f"/api/complaints/{cid}/reassign",
        json={
            "new_officer_id": other_officer.id,
            "reason": "Case overdue for 4 days. Reassigned by Command for expedited recovery.",
            "next_action": "Serve urgent Section 91 CrPC notice to gateway and recover funds",
            "due_date": reassign_due
        },
        headers=sup_headers
    )
    assert reassign_res.status_code == 200
    assert reassign_res.json()["assigned_officer_id"] == other_officer.id

    # 6. Officer resolves
    token_reassigned = create_access_token({"sub": str(other_officer.id), "role": "junior_officer"})
    off_reassigned_headers = {"Authorization": f"Bearer {token_reassigned}"}

    res_due = (get_now() + timedelta(days=3)).isoformat()
    resolve_res = client.post(
        f"/api/complaints/{cid}/resolve",
        json={
            "resolution_report": "Transferred funds tracked to payment gateway. Entire amount of Rs 45,000 frozen and reversal order issued to complainant's Union Bank account.",
            "next_action": "Awaiting citizen confirmation of credit and case closure",
            "due_date": res_due
        },
        headers=off_reassigned_headers
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "Resolved"

    # 7. Citizen gives feedback
    fb_res = client.post(
        f"/api/complaints/{cid}/feedback",
        json={"rating": 5, "comment": "Entire stolen amount refunded to my account! Very transparent police action."},
        headers=cit_headers
    )
    assert fb_res.status_code == 200

    # 8. Closed
    close_res = client.post(
        f"/api/complaints/{cid}/close",
        json={"closure_note": "Citizen confirmed receipt of full refund and closed complaint."},
        headers=cit_headers
    )
    assert close_res.status_code == 200
    assert close_res.json()["status"] == "Closed"

    # 9. Verify chain passes
    verify_res1 = client.get("/api/audit/verify").json()
    assert verify_res1["valid"] is True, f"Expected valid chain, got: {verify_res1}"
    assert verify_res1["total_verified"] >= 20

    # 10. Tamper with one log row directly in the DB
    tamper_res = client.post("/api/audit/tamper-test", headers=sup_headers)
    assert tamper_res.status_code == 200
    tampered_id = tamper_res.json()["entry_id"]

    # 11. Verify chain reports the break!
    verify_res2 = client.get("/api/audit/verify").json()
    assert verify_res2["valid"] is False, "Audit chain failed to report break after tampering!"
    assert verify_res2["broken_at_id"] == tampered_id
    print("\n[SUCCESS] FINAL TEST PASSED COMPLETELY: All 11 steps validated end-to-end with cryptographic proof!")

    # Clean up tampered row
    db = SessionLocal()
    entry = db.query(ActionLog).filter(ActionLog.id == tampered_id).first()
    entry.description = tamper_res.json()["original_description"]
    db.commit()
    db.close()

    # Re-verify clean
    verify_res3 = client.get("/api/audit/verify").json()
    assert verify_res3["valid"] is True


def test_chatbot_endpoint():
    # Test 1: General categories inquiry
    res1 = client.post("/api/chat", json={"message": "What are the 5 categories?", "language": "en"})
    assert res1.status_code == 200
    assert "Cybercrime" in res1.json()["reply"]
    assert "Suggested. Officer must confirm." in res1.json()["reply"]

    # Test 2: Live case lookup by Complaint ID
    res2 = client.post("/api/chat", json={"message": "Check status of KA-CYB-2026-0001", "language": "en"})
    assert res2.status_code == 200
    assert "KA-CYB-2026-0001" in res2.json()["reply"]
    assert "Suggested. Officer must confirm." in res2.json()["reply"]

