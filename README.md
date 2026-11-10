# CIVANTA — Smart Grievance Management & Accountability System

> **Tagline:** *"Every Complaint Matters. Every Action Counts."*  
> **Pilot Department:** Karnataka State Police (KSP)  
> **Classification:** Academic Demonstration Prototype  

---

## ⚖️ Academic Prototype Legal Notice & Framing
**CIVANTA** is an academic demonstration prototype engineered to showcase intelligent grievance workflow orchestration, strict statutory SLA tracking, and cryptographic auditability for public administration.
- **Scope Boundary:** The system strictly registers and tracks complaints. It **must never decide allegations, offences, or FIR registration**; those legal decisions remain exclusively with authorised police officials.
- **AI Advisory Boundary:** Every artificial intelligence output is explicitly watermarked and labelled:  
  **`"Suggested. Officer must confirm."`**
- **Translation Integrity:** If the Gemini API key is missing, rate-limited, or offline, the system falls back to deterministic Unicode Kannada character detection (`U+0C80–U+0CFF`), rule-based keyword categorization, and displays a visible advisory banner:  
  **`"AI unavailable: translation not performed"`** (never faking a translation).

---

## 🏛️ System Architecture & Technology Stack

```
                                  CIVANTA PLATFORM ARCHITECTURE
                                  
    +------------------------------------------------------------------------------------+
    |                             REACT + TYPESCRIPT FRONTEND                           |
    |                                                                                    |
    |  • Tailwind CSS styling (Navy `#0f172a`, White, Soft Grey)                        |
    |  • Recharts analytics: category velocity, aging cohorts, status donuts            |
    |  • Bilingual UI & Reminder Support (English / ಕನ್ನಡ)                              |
    |  • 1-Click Role-Based Demo Logins & Floating Demo Clock Control Bar                |
    +------------------------------------------------------------------------------------+
                                             │ HTTP / Reverse Proxy (`/api`, `/uploads`)
                                             ▼
    +------------------------------------------------------------------------------------+
    |                               FASTAPI PYTHON BACKEND                              |
    |                                                                                    |
    |  • JWT Authentication with strict role-based route guards                          |
    |  • Simulated Demo Clock (`app.clock.get_now()`) with fast-forward capabilities    |
    |  • APScheduler: 24h reminders, SLA overdue tagging, 3d escalations, 7d red flags  |
    |  • Intelligent Workload-Balanced Assignment Engine (lowest active case count)      |
    |  • Single-call Google Gemini AI Service (`app.ai_service`) + Unicode Fallback     |
    |  • In-app extensible Notification Engine with event deduplication                  |
    +------------------------------------------------------------------------------------+
                                             │ SQLAlchemy ORM
                                             ▼
    +------------------------------------------------------------------------------------+
    |                         SQLITE DATABASE & AUDIT LEDGER                            |
    |                                                                                    |
    |  • Tables: users, complaints, complaint_documents, actions_log,                   |
    |            feedback, system_config, notifications, daily_supervisor_summaries      |
    |  • Tamper-Evident Ledger: SHA-256 prev_hash chaining on all action events          |
    +------------------------------------------------------------------------------------+
```

- **Frontend:** React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Vite.
- **Backend:** Python 3.12, FastAPI, SQLAlchemy ORM, SQLite (`civanta.db`), APScheduler, Pydantic v2.
- **AI Service:** Google Gemini API (`GEMINI_API_KEY`) via `google-genai` SDK with deterministic Unicode Kannada fallback.
- **Security & RBAC:** Passwords hashed with `bcrypt`, stateless JWT access tokens, granular role-based permissions (`citizen`, `junior_officer`, `senior_supervisor`, `admin`).
- **Ledger Security:** Append-only cryptographic ledger (`actions_log`) storing `prev_hash` and SHA-256 digest of every state mutation with on-demand chain verification.

---

## 🔒 The Core System Rule (Backend Enforced)

> **No complaint may exist without an assigned officer, a next action, and a due date. Every status change must require a next-action note and a new follow-up date. Reject the change otherwise.**

The backend strictly enforces this constraint on all mutations (`/api/complaints/{id}/status`, `/api/complaints/{id}/reassign`, `/api/complaints/{id}/resolve`, `/api/complaints/{id}/close`). Requests omitting `next_action` or `due_date` are rejected with HTTP 422 Unprocessable Entity or HTTP 400 Bad Request.

---

## 🔄 Complaint Lifecycle

```
[Registered] ──> [Assigned] ──> [Accepted] ──> [In Progress] ──> [Awaiting Response] ──> [Resolved] ──> [Closed]
                                      │                                                      │             │
                                      └─────────────< (Citizen Reopen Request) <─────────────┴─────────────┘
```

1. **Registered:** Citizen submits grievance. ID format generated: `KA-CYB-2026-0001`. AI analyzes text/image for category, priority, and summary.
2. **Assigned:** System auto-maps category to unit and area, assigning the available officer with the lowest active workload (never random). Initial next action and statutory SLA deadline set.
3. **Accepted:** Investigating officer formally acknowledges the case dossier.
4. **In Progress:** Officer conducts active field inquiries, adds investigation notes, and uploads evidence.
5. **Awaiting Response:** Officer requests clarifying information or external forensic reports.
6. **Resolved:** Officer certifies resolution report with optional FIR/LDR reference and recovery details.
7. **Closed:** Case archived with a mandatory closure note.
8. **Reopened:** Allowed from `Resolved` or `Closed` on citizen request. Citizen provides a reason; system re-schedules investigation follow-up for 48 hours.

---

## 🌟 The 4 Standout Features

### 1. Duplicate Detection
- At registration, the system scans existing complaints within the same category for high text similarity or AI-identified correlation.
- Flagged complaints display a prominent warning banner to the investigating officer referencing the earlier case ID (`KA-CYB-2026-0001`) to prevent fragmented investigations.

### 2. Officer Performance Scorecard
- Real-time performance analytics computed directly from database tables:
  - **On-time Follow-up Compliance Rate (%)**
  - **Average Response Latency (Hours)**
  - **Active Overdue Case Count**
  - **Resolved Cases Ratio**
- Visible in the Command Analytics Bureau and Supervisor Workstation.

### 3. Citizen Feedback & Reopen Loop
- Upon case resolution, citizens can submit a **1 to 5 Star Rating** along with qualitative comments.
- If dissatisfied with the resolution report or closure, the citizen can trigger an official **Reopen Request**, automatically resetting the status to `In Progress` with a 48-hour follow-up deadline.

### 4. Daily Supervisor Command Summary
- Background scheduled job running on simulated time automatically compiles a daily intelligence briefing for Senior Supervisors (DySP):
  - New complaints registered today
  - Cases resolved today
  - Active breaches and overdue escalations
  - Top workload officers requiring relief or reassignment

---

## 📱 The 10 Prototype Screens

| # | Screen | Role & Capabilities |
|---|--------|---------------------|
| 1 | **Landing + Login + Register** | Hero introduction, bilingual banner, DigiLocker / e-KYC ID login, and **1-Click Demo Login buttons for all 4 roles**. |
| 2 | **Dashboard (Role-Specific)** | Role-tailored dashboards. **Supervisor Dashboard is the most prominent**, featuring red overdue alerts, severity-sorted attention feeds, and quick reassignment. |
| 3 | **New Complaint** | Bilingual form (Kannada / English) with live AI category recommendations, voice input support, real file / digital evidence upload, generating unique ID `KA-CYB-2026-0001`. |
| 4 | **Track Complaint** | Public citizen-safe tracker: displays current status, mandatory next action, expected follow-up deadline, and assigned station. **Officer personal phone and email are strictly redacted**. |
| 5 | **Complaint Detail Dossier** | Full dossier: original & translated text, digital evidence download, chronological remarks log, certified resolution reports, and **Officer AI Override Form** (category & priority correction). |
| 6 | **Officer Inbox** | Investigating officer workstation with **"Due Today / 24h Action Window"** filter, overdue indicators, category/priority filters, and inline status updates. |
| 7 | **Escalations Cockpit** | Dedicated command dashboard for Senior Supervisors (DySP) displaying cases exceeding statutory SLA limits (>3 days, >7 days red flags) with quick reassignment. |
| 8 | **Action History & Verify Chain** | Tamper-evident audit ledger displaying SHA-256 hash chains (`hash` and `prev_hash`). Includes **"Verify Chain"** button and **"Simulate DB Tampering"** button to demonstrate cryptographic integrity. |
| 9 | **Analytics & Reports** | Executive dashboard with database-computed KPI cards, Recharts visualizations, aging cohorts (0-3, 4-7, 8-15, 15+ days), station-wise overdue stats, officer scorecards, and **CSV Export**. |
| 10 | **Admin Console & Clock** | Administrative panel for managing police units, officer authorizations, SLA rules matrix, and **Simulated Demo Clock controls (+1 day reminder, +3 days escalate, +7 days red flag, reset)**. |

---

## 🔑 Demo Accounts & Credentials

All demonstration accounts use the unified prototype password: **`Demo@123`**

| Role | Name & Designation | Email | Default Station / Unit |
|------|--------------------|-------|------------------------|
| **Citizen** | Ramesh Gowda (Complainant) | `citizen@demo.com` | Public Portal (Bengaluru Central) |
| **Junior Officer** | PSI Anand Kumar | `junior@demo.com` | Cyber Crime Police Station (CCPS) |
| **Senior Supervisor** | DySP Rajeshwari Hegde | `supervisor@demo.com` | Central Sub-Division Command |
| **Administrator** | Prakash Rao (Systems Admin) | `admin@demo.com` | State Police Computer Center |

*(You can also click any role button inside the **Demo Role Switcher Modal** or on the **Login Page** for instant 1-click authentication without typing credentials).*

---

## ⚙️ Environment Variables

Create a `.env` file in `D:\civanta\backend\.env`:

```env
# Google Gemini API Key (Optional: system provides deterministic Kannada fallback if missing)
GEMINI_API_KEY="AIzaSy..."

# JWT Security
JWT_SECRET="civanta-ksp-secret-key-super-secure-production-2026"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="1440"

# Application Config
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
DATABASE_URL="sqlite:///./civanta.db"
```

---

## 🚀 Quickstart & Execution Guide

### 1. Prerequisites
- Python 3.12 (via `uv` or system Python)
- Node.js v18+ (Node v20.18.0 portable included in `D:\civanta\tools\node-v20.18.0-win-x64\`)

### 2. Backend Setup & Startup
```powershell
# Navigate to backend directory
cd D:\civanta\backend

# Install dependencies (if not already installed)
pip install fastapi "uvicorn[standard]" sqlalchemy apscheduler pyjwt bcrypt google-genai httpx pytest python-multipart

# Initialize database and populate 30 realistic demonstration complaints
python -m app.seed

# Start the FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API Swagger docs will be accessible at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 3. Frontend Setup & Startup
```powershell
# Open a second terminal and navigate to frontend directory
cd D:\civanta\civanta

# Start the Vite development server (port 5173)
npm run dev
```
*Frontend application will be accessible at: [http://localhost:5173](http://localhost:5173)*

---

## 🧪 Automated Test Verification

A full automated verification test suite is included in `backend/tests/test_civanta.py`. It runs the complete 11-step grievance lifecycle flow, including simulated clock progression, automatic escalation, and direct SQLite tamper detection:

```powershell
cd D:\civanta\backend
pytest tests/test_civanta.py -v -s
```

### Verified Test Results:
```text
tests/test_civanta.py::test_health_and_root PASSED
tests/test_civanta.py::test_demo_logins_all_roles PASSED
tests/test_civanta.py::test_core_rule_status_update_enforcement PASSED
tests/test_civanta.py::test_public_track_view_strips_officer_personal_details PASSED
tests/test_civanta.py::test_final_test_lifecycle_flow 
  [Step 1] Citizen submitted Kannada complaint -> ID: KA-CYB-2026-0001
  [Step 2] Category: Cybercrime | Priority: High | Assigned: PSI Anand Kumar
  [Step 3] Core rule verified: Next action note and due date strictly enforced
  [Step 4] Fast-forwarded 1 day: Proactive reminder dispatched to officer
  [Step 5] Fast-forwarded 4 days: Case flagged OVERDUE and ESCALATED to DySP
  [Step 6] Senior Supervisor re-assigned complaint with operational directive
  [Step 7] Officer submitted certified resolution report
  [Step 8] Citizen submitted satisfaction feedback: 5 Stars
  [Step 9] Case officially closed with verified closure note
  [Step 10] Cryptographic SHA-256 ledger integrity verified: 100% Intact
  [Step 11] Simulated direct DB tampering: Tamper break correctly flagged at broken entry
  [SUCCESS] FINAL TEST PASSED COMPLETELY: All 11 steps validated end-to-end with cryptographic proof!
PASSED
============================== 5 passed in 3.18s ==============================
```

---

## 📊 Database Schema Details

- **`users`**: `id`, `name`, `email`, `hashed_password`, `role` (`citizen`, `junior_officer`, `senior_supervisor`, `admin`), `phone`, `badge_number`, `unit`, `area`, `created_at`.
- **`complaints`**: `id` (`KA-CYB-2026-0001`), `title`, `original_text`, `english_text`, `language` (`kn`/`en`), `category`, `priority`, `confidence`, `summary`, `duplicate_of`, `ai_flag_banner`, `complainant_id`, `assigned_officer_id`, `assigned_unit`, `assigned_area`, `status`, `next_action`, `due_date`, `is_overdue`, `is_escalated`, `escalation_level`, `closure_note`, `resolution_report`, `created_at`, `updated_at`.
- **`complaint_documents`**: `id`, `complaint_id`, `filename`, `original_filename`, `file_type`, `file_size`, `file_path`, `uploaded_by`, `created_at`.
- **`actions_log`**: `id`, `complaint_id`, `timestamp`, `user_id`, `user_name`, `user_role`, `action`, `old_status`, `new_status`, `description`, `prev_hash`, `hash`.
- **`feedback`**: `id`, `complaint_id`, `citizen_id`, `rating` (1–5), `comment`, `created_at`.
- **`system_config`**: `id`, `key`, `value`, `description`, `updated_at`.
- **`notifications`**: `id`, `user_id`, `complaint_id`, `title`, `message_en`, `message_kn`, `type`, `event_key`, `is_read`, `created_at`.
- **`daily_supervisor_summaries`**: `id`, `date`, `total_registered`, `total_resolved`, `total_overdue`, `total_escalated`, `summary_text`, `created_at`.
