# Noor Al-Quran Tahfeez Academy (معهد نور القرآن الكريم)
### Multi-Tenant Islamic School Management, Form Master Attendance & Quran Memorization (Hifz) Tracker

A comprehensive, production-grade multi-tenant web application engineered specifically for Islamic Tahfeez academies, schools, and madaris. The system provides role-based authentication, student self-tracking dashboards, teacher target-setting workflows, administrative user management, and multi-tenant isolation.

---

## 🌟 Core Feature Modules

### 1. Multi-Tenant Architecture
- **Tenant Isolation**: Multiple schools or academy branches (e.g. *Noor Al-Quran Tahfeez Academy* vs *Darul Quran International School*) operate independently on the same platform.
- **Data Segregation**: Users, classes, students, attendance logs, and Hifz evaluation records are strictly scoped to their respective school tenant.
- **Tenant Switcher**: Administrators can switch between schools with dynamic branding updates (school crest, name, Arabic title, and code).

### 2. Role-Based Login & Dashboard System
Every user must log in to access their tailored workspace:
- **Student Dashboard (`role: student`)**:
  - Automatically lands on their personal **"My Quran Journey"** workspace.
  - Interactive **30-Juz Visual Mushaf Map** showing their exact memorization progress.
  - **Assigned Targets**: View specific memorization goals and deadlines set by their Ustadh.
  - Personal attendance percentages, present sessions, and evaluation records with Ustadh remarks.
  - Read-only protection: Students cannot view other students' records or modify class registers.
- **Teacher / Ustadh Dashboard (`role: teacher`)**:
  - **Form Master Attendance**: Strictly enforced class teacher permissions for attendance marking.
  - **Classical 3-Part Hifz Logger**: Record **Sabaq** (new daily lesson), **Sabqi** (recent revision), and **Manzil** (cumulative retention cycle).
  - **Target Setting Module**: Assign, update, and manage weekly or termly Surah/Juz memorization targets for students with deadlines.
  - Halaqah leaderboard and student profile inspection.
- **Administrator Dashboard (`role: admin`)**:
  - Full school oversight across all Halaqahs and classes.
  - **User Accounts Management**: Create, edit, and delete accounts for Teachers, Students, Parents, and Administrators.
  - Complete JSON database backup export and restore.
  - System-wide attendance and Hifz metrics.
- **Parent View (`role: parent`)**:
  - Dedicated view of their child's progress, attendance, targets, and printable official progress reports.

---

## 🔑 Demo Login Accounts

| Role | Username | Password | School Tenant | Assigned Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin (Principal)** | `admin` | `123` | Noor Al-Quran Academy | Full Academy Oversight |
| **Teacher (Form Master)** | `ustadh.abdullah` | `123` | Noor Al-Quran Academy | Halaqah Abu Bakr (Advanced Hifz) |
| **Teacher (Form Master)** | `ustadh.ibrahim` | `123` | Noor Al-Quran Academy | Halaqah Umar (Intermediate Hifz) |
| **Student** | `student.zayd` | `123` | Noor Al-Quran Academy | Personal Dashboard & 30-Juz Map |
| **Student** | `student.fatimah`| `123` | Noor Al-Quran Academy | Personal Dashboard & 30-Juz Map |
| **Parent** | `parent.idris` | `123` | Noor Al-Quran Academy | Guardian of Fatimah Zahra |
| **Tenant 2 Admin** | `darul.admin` | `123` | Darul Quran Academy | Full Branch Oversight |

*(Note: The login page also features quick one-click demo login buttons for instant access).*

---

## 📖 Classical 3-Part Hifz Workflow
- **Sabaq (سَبَق) — New Lesson**:
  - Complete 114 Surahs dataset (Ayah counts, Arabic titles, revelation type).
  - Ayah boundary validation, quality rating (*Excellent - 4 pts, Good - 3 pts, Fair - 2 pts, Needs Practice - 1 pt*), and Tajweed remarks.
- **Sabqi (سَبْقِي) — Recent Revision**:
  - Quality checks on recent lessons and quarters.
- **Manzil / Dhor (مَنْزِل / دور) — Retention Cycle**:
  - Cumulative cycle through completed Ajza (1 to 30) to preserve memorization.

---

## 🚀 How to Run

1. **Option A (Desktop Launcher)**:
   - Double click `launch_system.bat` located inside `quran-attendance-system`.
   - Your browser will automatically open to `http://localhost:8085/`.

2. **Option B (Command Line)**:
   ```bash
   cd quran-attendance-system
   python -m http.server 8085
   ```
   Open `http://localhost:8085/` in your browser.
