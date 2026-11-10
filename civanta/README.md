# CIVANTA — Smart Grievance Management & Accountability System
> **"Every Complaint Matters. Every Action Counts."**

**CIVANTA** is a production-grade, full-stack Smart Grievance Management and Supervisory Accountability platform developed for government and law enforcement administrations, with an initial demonstration implementation for the **Karnataka State Police Department (KSP)**.

CIVANTA goes beyond traditional static complaint portals by enforcing an active, deadline-driven accountability loop: from citizen complaint registration, real-time Kannada-English translation, automated AI classification, workload-balanced officer assignment, continuous statutory deadline monitoring, automatic escalation of overdue cases to senior supervisors, transparent action audit history, to final citizen feedback and verified case closure.

---

## 🏛️ Initial Demonstration Department
* **Department:** Karnataka State Police (KSP)
* **Demo Wings:** Cyber Crime Police Division (CCPD), Law & Order Police Station (Central Div), and Lost & Found / Citizen Vigilance Wing.
* **Geographical Coverage:** Greater Bengaluru Metropolitan Area (Jayanagar, Majestic, Cubbon Park, Koramangala, Whitefield, Malleshwaram).

---

## 🔑 Demonstration Login Accounts

All accounts use the standard demonstration password: **`Demo@123`**

| Role | Name & Designation | Badge / Unit | Email Address | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Ramesh Gowda | Public Complainant (Jayanagar) | `citizen@demo.com` | `Demo@123` |
| **Junior Police Officer** | PSI Anand Kumar | `KSP-PSI-2489` (Cyber Crime South Div) | `junior@demo.com` | `Demo@123` |
| **Senior Police Supervisor** | DySP Rajeshwari Hegde | `KSP-DySP-1042` (Vigilance & Command) | `supervisor@demo.com` | `Demo@123` |
| **System Administrator** | Prakash Rao | Directorate of Police Computer Services | `admin@demo.com` | `Demo@123` |

> 💡 **Tip:** A **1-Click Demo Login Switcher** is embedded in the top navigation bar and floating test toolbar, allowing instant switching between all 4 roles without manually typing credentials.

---

## 🚀 Key Functional Modules & Architecture

### 1. Bilingual Kannada & English Support (Module 2)
* Full bilingual grievance drafting and display in **Kannada (ಕನ್ನಡ)** and **English**.
* Side-by-side comparative viewer: officers read the citizen's original statement alongside the English dossier.
* Clearly labeled translation engine mode (`CIVANTA Demonstration Translation Engine` with optional Google Cloud Translation API hook via `VITE_GOOGLE_TRANSLATION_API_KEY`).
* Voice-to-text dictation with sample presets in Kannada & English.

### 2. AI Complaint Classification & Prioritization (Module 3)
* Semantic analysis of title and statement against police categories:
  * *Online Payment Fraud, Cybercrime, Lost Property, Theft, Missing Person, Harassment, Fake Social Media Account, Suspicious Online Activity, Other Complaints.*
* Recommends response priority: **Urgent (12-24h SLA), High (48h SLA), Medium (72h SLA), Low (120h SLA)** with rationale and confidence scoring.

### 3. Intelligent Officer Assignment Engine (Module 4)
* No random assignment: maps complaint category to the specialized police unit, verifies jurisdictional proximity, checks officer active caseload against `maxCapacity`, and assigns the optimal officer.
* Supervisor manual reassignment modal with justification recording.

### 4. Automated SLA Deadlines & Pending Work Reminders (Module 5)
* Evaluates active complaints every 30 seconds against statutory resolution deadlines.
* Dispatches pending-work alerts when approaching expiration (e.g. 6 hours remaining).
* **Admin Simulation Testing Control:** 1-click button to artificially expire deadlines and immediately test the escalation pipeline.

### 5. Automatic Supervisor Escalation (Module 6)
* When an officer misses the configured SLA deadline:
  1. The complaint is flagged as **OVERDUE** with visual glowing beacon.
  2. Status automatically elevates to **ESCALATED**.
  3. Escalation notification is sent to the Senior Police Supervisor (DySP).
  4. Appears immediately on the **Critical Attention Queue** of the Supervisor Dashboard.
  5. Immutable audit entry logs the SLA breach.

### 6. Immutable Action History & Cryptographic Audit Ledger (Module 7)
* Certified, tamper-proof chronological log recording every step: registration, AI classification, automated assignment, officer acknowledgement, remarks, reminder dispatches, deadline breaches, supervisor directives, resolution report, and citizen rating.

### 7. Interactive Command Dashboards (Module 5 & 8)
* **Citizen Dashboard:** Registered cases, investigation progress timeline, public tracking by Complaint ID (`CIV-2026-BLR-0101`), resolution review and 5-star rating feedback.
* **Junior Officer Workstation:** Assigned cases filterable by category and status, investigation updates modal, evidence attachment, resolution submission.
* **Senior Supervisor Command Center:** 6 core KPI metrics, overdue complaint list, officer workload distribution gauges, and geographic surveillance heatmap.
* **System Administration Console:** Officer directory, unit configurations, and SLA rule matrix.

---

## 💻 Tech Stack & Dependencies

* **Frontend:** React 18, TypeScript, Tailwind CSS, Vite.
* **Icons & UI:** Lucide React, Custom SVG Shield & Karnataka Police Crest.
* **State Management & Persistence:** Browser LocalStorage persistent state engine with reset controls.
* **Voice Support:** Web Speech API (`kn-IN`, `en-IN`) with built-in simulated audio presets.
* **Translation:** Neural dual-dictionary engine with Google Cloud API readiness.

---

## 🛠️ Setup & Running Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher

### Steps to Run

1. Open your terminal and navigate to the project directory:
   ```bash
   cd civanta
   ```

2. Dependencies are already installed. If running on a new machine:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
civanta/
├── index.html                    # Ashoka/KSP Emblem branding & typography
├── package.json
├── vite.config.ts                # Port 3000 host configuration
├── tailwind.config.js            # Custom police & karnataka theme colors
├── tsconfig.json
├── public/
│   └── shield.svg                # Scalable police insignia
└── src/
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # Master routing & role-aware shell
    ├── index.css                 # Overdue animations, Kannada typography, print styles
    ├── types/
    │   └── index.ts              # Complaint, Officer, ActionHistory, SLA models
    ├── data/
    │   ├── initialData.ts        # 15 realistic fictional demo complaints across all statuses
    │   └── translations.ts       # Kannada-English bilingual dictionary
    ├── services/
    │   ├── storage.ts            # Persistent store & reset engine
    │   ├── aiClassifier.ts       # AI categorization & priority suggestion engine
    │   ├── assignmentEngine.ts   # Workload & jurisdiction assignment
    │   ├── deadlineService.ts    # SLA evaluation & deadline simulation
    │   ├── auditLogger.ts        # Backend immutable audit ledger
    │   ├── translator.ts         # Bilingual translation service
    │   └── speechService.ts      # Voice-to-text recognition
    ├── context/
    │   ├── AuthContext.tsx       # Role-based authentication & demo logins
    │   ├── GrievanceContext.tsx  # Central grievance state & scheduled ticker
    │   └── LanguageContext.tsx   # Kannada-English language switcher
    ├── components/
    │   ├── common/               # Navbar, Sidebar, StatusBadge, PriorityBadge, SLAProgressBar
    │   ├── complaints/           # Table, Timeline, BilingualViewer, ReassignModal, ResolutionModal
    │   ├── charts/               # CategoryBarChart, StatusBreakdown, WorkloadList, Heatmap
    │   └── voice/                # VoiceInputButton with demo audio presets
    └── pages/                    # 17 complete interactive pages and dashboards
```

---

## 📋 Preloaded Demonstration Grievance Records

The system includes **15 preloaded fictional complaints** covering all required scenarios:
1. `CIV-2026-BLR-0101` — **Online Payment Fraud (₹45,000 UPI Deduction)** — *Overdue & Escalated*
2. `CIV-2026-BLR-0102` — **Suspicious Cyber Activity (Apartment Society Phishing)** — *In Progress*
3. `CIV-2026-BLR-0103` — **Lost Mobile Phone (Samsung Galaxy S23 at Metro)** — *Resolved with 5-star Feedback*
4. `CIV-2026-BLR-0104` — **Lost Identity Documents (Passport & Aadhaar on BMTC bus)** — *Closed (LDR Certificate Issued)*
5. `CIV-2026-BLR-0105` — **Online Shopping Fraud (Fake Electronics Store)** — *Assigned*
6. `CIV-2026-BLR-0106` — **Theft (Royal Enfield Classic 350 Two-Wheeler)** — *Overdue (Approaching Escalation)*
7. `CIV-2026-BLR-0107` — **Missing Property (Ancestral Silver Trunk on Bus)** — *Pending Information*
8. `CIV-2026-BLR-0108` — **Harassment (Stalking & Blackmail via WhatsApp)** — *Urgent In Progress*
9. `CIV-2026-BLR-0109` — **Fake Social Media Account (Instagram Impersonation Profile)** — *In Progress*
10. `CIV-2026-BLR-0110` — **Suspicious Financial Transaction (Rapid International Debits)** — *Submitted*
11. `CIV-2026-BLR-0111` — **Cyber Impersonation (CEO Spear-Phishing Wire Fraud ₹12 Lakhs)** — *Escalated*
12. `CIV-2026-BLR-0112` — **Lost Wallet (Leather Wallet Misplaced in Cubbon Park)** — *Resolved*
13. `CIV-2026-BLR-0113` — **Unauthorized Account Access (Corporate Cloud Server Breach)** — *In Progress*
14. `CIV-2026-BLR-0114` — **Online Marketplace Fraud (OLX Advance Gate-Pass Scam)** — *Awaiting Assignment*
15. `CIV-2026-BLR-0115` — **General Police Complaint (Midnight Loudspeakers & Roadblock)** — *Reopened by Citizen*

---

## ⚖️ Legal & Academic Disclaimer
*CIVANTA is developed as an academic demonstration prototype showcasing smart grievance management and administrative accountability algorithms. It is not an officially deployed emergency dispatch system. For real police emergencies in Karnataka, call 112 or 1930 (Cyber Crime Helpline).*
