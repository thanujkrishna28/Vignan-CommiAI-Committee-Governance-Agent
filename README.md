# 🏛️ Vignan CommiAI — Statutory Committee Governance Agent

> **An Autonomous Institutional Governance, Quorum Audit & Compliance System for Higher Education Leadership**  
> *Built for UGC §12, AICTE, NAAC SSR Criterion 6, and Autonomous University Statutory Bodies.*

---

## 🎯 1. The Real-World Problem Statement (What Problem Are We Solving?)

In every accredited university (like Vignan's Foundation for Science, Technology & Research), governance runs on **Statutory Committees** (e.g., Academic Council, Board of Studies, Finance Committee, Anti-Ragging Committee, Internal Complaints Committee / POSH, IQAC, Research Advisory Council).

### ❌ The Real Challenges Universities Face Today:
1. **Manual & Scattered Compliance**: Committee compositions, tenure terms, and meeting quotas are tracked across Excel sheets, paper files, and forgotten emails.
2. **Illegal & Invalid Meetings (Quorum Risk)**: Meetings happen without required external industry/academic experts, POSH female quotas, or sufficient attendance ($\ge 60\%$). When NAAC or UGC audits the institution, invalid meeting minutes lead to severe penalties or loss of accreditation.
3. **Delayed Minutes of the Meeting (MoM) & Lost Action Items**: After meetings, drafting minutes takes weeks. Action items assigned to faculty ("Prepare new syllabus", "Fix lab equipment") are lost with zero accountability.
4. **Scattered Communication**: Notices, agendas, and circulars are sent through ad-hoc emails or WhatsApp messages with no legal audit trail.

---

## 💡 2. The Solution: What is CommiAI?

**Vignan CommiAI** is an intelligent, end-to-end **Governance Operating System and Autonomous AI Agent** that runs the university's statutory governance seamlessly:
- ✅ **Statutory Composition Auditor**: Automatically checks every committee against UGC / AICTE norms (e.g., minimum 8 members, mandatory external experts, gender representation, non-expired tenures).
- ✅ **Smart Meeting Console & Live Quorum Validation**: Automatically computes legal quorum in real-time before decisions can be ratified.
- ✅ **Autonomous AI Minutes Generator (MoM)**: Generates structured, legal-grade meeting minutes and extracts Action Taken Reports (ATRs) in seconds using Gemini AI.
- ✅ **Institutional Notification Dispatch**: Dispatches official notices, agenda papers, and reminder circulars directly to members' inboxes with verifiable audit trails.
- ✅ **Statutory Gazette & Repository**: Central evidence vault for signed minutes, ordinances, and NAAC SSR evidence.

---

## 👥 3. The 4 Key Roles & What Each Role Does

| Role | Official Officer | Login Test Email | Key Responsibility in the System |
| :--- | :--- | :--- | :--- |
| 🏛️ **Registrar** | **Prof. Dr. K. V. Krishna Kishore** | `231fa04e50@gmail.com` | **Executive Oversight**: Views university-wide compliance health, reconstitutes expired committee members, reviews institutional circulars, and gives final legal sign-off. |
| 📋 **Convener** | **Dr. S. V. Phani Kumar** | `231fa04a32@gmail.com` | **Meeting Master**: Schedules committee meetings, attaches agenda items, conducts live meetings with quorum tracking, and generates AI Minutes of the Meeting (MoM). |
| 🛡️ **IQAC Coordinator** | **Dr. E. Deepak Chowdary** | `pujithayarramsetty@gmail.com` | **Accreditation Auditor**: Monitors NAAC Criterion 6 compliance, UGC guidelines adherence, tracks overdue Action Taken Reports (ATR), and runs statutory diagnostics. |
| 👤 **Committee Member** | **Dr. J. Veeranjaneyulu** | `thanujkrishna28@gmail.com` | **Action & Attendance**: Submits RSVPs, views agenda packs, updates assigned task progress (ATRs), and digitally signs approved meeting minutes. |

> **Password for all Demo Accounts**: `Demo@1234`

### 🔒 Statutory Role-Based Access Control (RBAC) Matrix

| Governance Function | Member | Convener | IQAC Coordinator | Registrar / Executive Admin |
| :--- | :---: | :---: | :---: | :---: |
| **View Active Committees** | ✅ | ✅ | ✅ | ✅ |
| **Create / Reconstitute Committee** | ❌ | ❌ | ❌ | ✅ **Exclusive** |
| **Constitute & Appoint Members** | ❌ | ❌ | ❌ | ✅ **Exclusive** |
| **View Scheduled Meetings** | ✅ | ✅ | ✅ | ✅ |
| **Convene & Schedule Meeting** | ❌ | ✅ | ❌ (Audit View) | ✅ |
| **Confirm RSVP / Attendance** | ✅ | ✅ | ✅ | ✅ |
| **View Agenda & Discussion Pack** | ✅ | ✅ | ✅ | ✅ |
| **Create & Assign Action Items** | ❌ | ✅ | ❌ | ✅ |
| **Update Own Assigned Action (ATR)** | ✅ | ✅ | ✅ | ✅ |
| **Submit Action Taken Report (ATR)** | ✅ | ✅ | ✅ | ✅ |
| **Draft Minutes of the Meeting (MoM)** | ❌ | ✅ (AI-Assisted) | ❌ | ✅ |
| **Review & Ratify Minutes** | ✅ | ✅ | ✅ | ✅ |
| **Approve Final Minutes** | ❌ | ✅ | ❌ | ✅ |
| **Sign / Acknowledge Minutes** | ✅ | ✅ | ✅ | ✅ |
| **Upload Evidence / Working Paper** | ✅ | ✅ | ✅ | ✅ |
| **Deposit Official Gazette / Act** | ❌ | ❌ | ✅ | ✅ |
| **Manage Notification Rules & SLA** | ❌ | ❌ | ❌ | ✅ **Exclusive** |
| **View Email Audit Logs & Retries** | ❌ | ❌ | ❌ | ✅ **Exclusive** |

---

## 🧭 4. Core Features & What Forms / Fields Exist

### 1. 🏛️ Statutory Committee Management (`/committees`)
- **What it does**: Tracks all university statutory bodies (Academic Council, Finance Committee, Examination Committee, etc.).
- **Key Fields**: Committee Name, Code (e.g., `AC-001`), Category (Statutory / Regulatory / Academic), Mandated Meeting Frequency (Quarterly / Biannual), Statutory Charter, Minimum Quorum Percentage ($\ge 60\%$).
- **Composition Auditor**: Flags committees with missing external members or expiring tenures.

### 2. 👥 Faculty & Member Directory (`/members`)
- **What it does**: Central roster of all 51 university faculty members, external experts, and student representatives.
- **Key Fields**: Member Name, Official Email, Department, Designation (Professor, Dean, HoD), Statutory Role (Chairperson, Convener, Member, External Expert), Active Committees, and Tenure Dates.

### 3. 📅 Meeting & Live Quorum Console (`/meetings` & `/meetings/:id`)
- **What it does**: Manages the complete lifecycle of a statutory meeting.
- **Key Fields**: Meeting Title, Date & Time, Venue / Video Link, Associated Committee, Agenda Items (with allocated time and presenter).
- **Live Meeting Room**:
  - **Real-Time Attendance**: Mark Present / Absent / RSVP status.
  - **Live Quorum Indicator**: Shows whether the legally required attendance threshold has been satisfied.
  - **AI MoM Generator**: Generates formal minutes, resolutions, and assigned action items with one click.

### 4. ✅ Action Items & ATR Tracker (`/actions`)
- **What it does**: Ensures resolutions passed in meetings actually get implemented.
- **Key Fields**: Action Title, Description, Associated Committee & Meeting, Task Owner (Faculty Member), Due Date, Priority (Critical / High / Medium), Status (Pending / In Progress / Completed / Overdue).

### 5. 🛡️ Compliance Radar & NAAC Hub (`/compliance`)
- **What it does**: Real-time compliance scoring across 4 statutory pillars:
  1. *Composition Validity* ($\ge 8$ members, external expertise present).
  2. *Meeting Cadence* (no overdue statutory sessions).
  3. *Action Item Resolution* (prompt Action Taken Report completion).
  4. *Quorum Adherence* (all historical sessions legally quorate).

### 6. 📨 Official Institutional Notices & Dispatch (`/notifications`)
- **What it does**: Centralized dispatch hub for all statutory notifications.
- **Categories**:
  - Meeting Notice & Agenda Circulars.
  - Urgent Quorum Adjournment Alerts.
  - Approved Minutes Sign-Off Requests.
  - Action Item Due-Date Reminders.
  - Committee Reconstitution Notices.
- **Audit Trail**: Full cryptographic delivery log recording recipient, subject, dispatch timestamp, and delivery status.

### 7. 📁 Statutory Gazette & Evidence Vault (`/documents`)
- **What it does**: Secure digital repository for signed meeting minutes, university bylaws, UGC/AICTE notifications, and NAAC accreditation evidence.

---

## 🎤 5. How to Pitch to the Judge (2-Minute Script)

> *"Respected Judges, in any university, governance depends on statutory committees like the Academic Council and Finance Committee. Today, universities manage these critical bodies manually on paper and Excel sheets. This leads to missing quorums, unconstitutional meetings, delayed minutes, and lost action items—putting university accreditation at risk during UGC and NAAC audits.*
>
> *We built **Vignan CommiAI**, an Autonomous Statutory Committee Governance Agent. CommiAI automates the entire governance lifecycle:*
> 1. *It **audits committee compositions** in real-time against UGC & AICTE norms.*
> 2. *It runs a **Live Meeting & Quorum Console**, guaranteeing that no illegal decision is passed without required quorum and external experts.*
> 3. *It uses **Gemini AI** to autonomously draft formal Minutes of the Meeting and assign actionable tasks to faculty.*
> 4. *It **tracks Action Taken Reports (ATRs)** until completion and maintains a tamper-proof audit trail for NAAC inspection.*
>
> *With CommiAI, university leadership moves from reactive paperwork to proactive, autonomous governance."*

---

## 🛠️ 6. Tech Stack & Architecture

- **Frontend**: React (Vite), Material-UI (MUI v6), Socket.io-client, Chart.js / Recharts.
- **Backend**: FastAPI (Python 3.11), SQLAlchemy ORM, PostgreSQL with pgvector, Socket.IO real-time engine.
- **AI Core**: Google Gemini 2.5 Pro / Flash via Google GenAI SDK for MoM extraction and governance intelligence.
- **Email & Communications**: Institutional SMTP Dispatch Gateway with delivery audit trails.

---

## 🚀 7. Quick Start (Local Run)

### Backend:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # On Windows
pip install -r requirements.txt
python seed.py --force      # Seed DB with demo accounts
uvicorn app.main:app --reload --port 8000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev                 # Starts at http://localhost:5173
```