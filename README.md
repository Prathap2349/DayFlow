# ☀️ DayFlow HRMS (HR Management System)

DayFlow is a modern, enterprise-ready Human Resource Management System (HRMS) designed with a clean, high-contrast, accessibility-first design system. Built with React, TypeScript, and powered by Supabase, it streamlines employee management, attendance tracking, leave requests, payroll processing, and announcement systems.

---

## 🎨 Professional, High-Contrast Design

DayFlow is permanently locked into a gorgeous, high-contrast **Light Theme** built on top of Tailwind CSS. Inspired by premium SaaS layouts (like Stripe and Linear), the interface features:
- **Zero Dark-Mode Inconsistencies**: Neutralized dark-mode styles to prevent broken layouts.
- **Enhanced Legibility**: Upgraded text contrast levels (using accessible slates and indigos) to ensure maximum readability for all table headers, labels, and statistics.
- **Micro-Animations**: Smooth hover-lift cards, scale transitions, and sidebar navigations for a high-end UI/UX experience.

---

## ✨ Features

### 🔐 1. Authentication & Role Enforcement
- **Google & Microsoft SSO**: Fully integrated Single Sign-On using Supabase OAuth.
- **Safe Database Role-Checking**: Users are safely routed based on their DB profile role (`hr`, `admin`, or `employee`) without any exposed client-side role toggles.
- **Protected Layouts**: Route-level checks redirect standard employees away from administrative paths securely.

### 📅 2. Geofenced Attendance & WFH Exceptions
- **Office Wi-Fi Attendance**: Requires employees to connect to the office Wi-Fi network for clock-in/clock-out verification.
- **Work-From-Home (WFH) Exceptions**: HR managers can toggle a "WFH Exception" flag for individual remote employees, bypassing the Wi-Fi requirement cleanly.
- **Real-Time Punch Cards**: Interactive visual feedback of active shifts.

### 👥 3. Workforce Directory
- **Bulk Employee Import**: Seed the system quickly by importing employee data via CSV spreadsheets.
- **Granular Controls**: Modify work modes (Remote, Hybrid, Office), manage location details, and toggle active exception overrides.

### 💰 4. Interactive Payroll System
- Fully automated payroll engine calculating:
  $$\text{Net Pay} = \text{Basic Salary} + \text{Allowances} - \text{Deductions}$$
- Monospaced numerical values for clean alignment and scanning.
- Interactive payslip status reports.

### 📢 5. Announcements & Notifications
- HR can broadcast real-time announcements.
- A clean notification feed keeps employees up-to-date with approvals and system changes.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Database / Auth Backend**: Supabase (PostgreSQL, Supabase GoTrue Auth)
- **Icons**: Lucide React
- **Hosting / Deploy**: Vercel

---

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Prathap2349/DayFlow.git
cd DayFlow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Database Setup
Execute the initialization migration from `supabase/migrations/` on your Supabase PostgreSQL instance. Ensure the profiles database trigger is active for automated user synchronization.

### 5. Configure OAuth (For Google & Microsoft Logins)
1. Go to your **Supabase Dashboard** > **Authentication** > **Providers**.
2. Enable **Google** and **Azure (Microsoft)**.
3. Paste the client IDs and client secrets generated from your Google Cloud Console and Microsoft Entra ID registration portals.
4. Set the redirect callbacks pointing to:
   `https://<your-project-id>.supabase.co/auth/v1/callback`

### 6. Run locally
```bash
npm run dev
```
The site will run on `http://localhost:5173`.
