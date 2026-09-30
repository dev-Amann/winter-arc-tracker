# Winter Arc Tracker 2026

**Winter Arc Tracker** is a personal goal, habit, and progress-tracking desktop and web dashboard application designed to track a user's planned activities against actual performance over days, weeks, months, and an entire year.

Core Philosophy: **PLAN → DO → RECORD → COMPARE → IMPROVE**

---

## 🌟 Key Features

1. **Core Concept & Directional Goals**:
   - Supports both **Higher-is-Better Goals** (e.g. Coding: Target = 2 hrs, Actual = 1.5 hrs → 75%) and **Lower-is-Better Goals** (e.g. Instagram limit: Target = 60 mins max, Actual = 95 mins → lower achievement rate).
   - Central reusable achievement calculation engine.

2. **Main Dashboard**:
   - Top Header with current date, streak, today's %, this week's %, this month's %, and Winter Arc overall progress.
   - **8 Core Metric Cards**: Today's Plan, Today's Actual, Today's Completion %, Current Streak, Best Streak, Monthly Average, Total Planned Hours, Total Actual Hours.
   - **Progress Visualization Card**: Planned vs Actual vs Achievement circular gauge.
   - Today's quick logging widget & monthly quick comparison.

3. **Daily Performance Log (`/today`)**:
   - Interactive date selector to log or edit current and historical daily records.
   - Status buttons (*Complete*, *Partial*, *Missed*) and notes field.

4. **Habits & Goals Management (`/habits`, `/goals`)**:
   - Dedicated management pages with modal dialogs to create/edit habits and goals.
   - Configurable frequencies (Daily, Weekly, Custom), target values, units, and goal directions.

5. **Analytics & Comparison (`/analytics`)**:
   - Planned vs Actual bar chart
   - Monthly achievement trend line
   - Category performance breakdown
   - Completed vs Missed goals breakdown
   - Date range filters (Day, Week, Month, Quarter, Year, Custom)
   - **Period Comparison Engine**: Compare Oct vs Nov, Q4 vs Q3, or Month-over-Month metrics.

6. **Calendar & Activity Heatmap (`/calendar`)**:
   - **GitHub-style Activity Heatmap**: Color-intensity activity grid filterable by category or individual habit with hover tooltips and day details.
   - **Yearly 12-Month Dashboard**: Monthly breakdown with stats and yearly trend line.

7. **Winter Arc Mode (`/winter-arc`)**:
   - Focused period tracker (Default: Oct 1, 2026 – Dec 31, 2026).
   - Start Date, End Date, Days Remaining counter, and Overall Progress %.
   - **Objective End Summary**: Planned, Actual, Achievement %, Consistency %, Best Month, Best Habit, Most Improved Habit.

8. **Data Safety & Settings (`/settings`)**:
   - JSON export & full schema import.
   - CSV log export for external analysis.
   - Custom categories manager (colors & icons).
   - Offline local database storage (MySQL 8 ORM with automatic SQLite fallback).

---

## 🏗️ Project Architecture

```
winter-arc-tracker/
├── backend/               # FastAPI Python Backend
│   ├── app/
│   │   ├── config.py
│   │   ├── database.py    # MySQL 8 ORM engine + resilient SQLite fallback
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schemas.py     # Pydantic validation schemas
│   │   ├── calculations.py# Reusable math logic
│   │   └── routers/       # Dashboard, Goals, Habits, Logs, Analytics, WinterArc, DataSafety, Settings
│   ├── main.py            # FastAPI entry point & React static asset server
│   ├── requirements.txt
│   └── .env.example
├── frontend/              # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/    # Header, Sidebar, MetricCards, ProgressVisualizationCard, GoalModal, HeatmapGrid
│   │   ├── pages/         # Dashboard, Today, Habits, Goals, Analytics, Calendar, WinterArc, Settings
│   │   ├── services/      # Axios REST API client
│   │   ├── App.jsx
│   │   └── index.css
│   └── vite.config.js
├── desktop/               # PyWebView Desktop Launcher & Packager
│   ├── desktop_main.py    # PyWebView Native Desktop runner
│   └── build_executable.py# PyInstaller EXE build script
├── .gitignore             # Secrets & environment exclusions
├── run_app.bat            # One-click desktop app runner
└── README.md
```

---

## 🚀 How to Run the Project Locally

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & npm
- **MySQL 8** (Optional, app automatically falls back to SQLite if MySQL is not running)

### Step 1: Backend Setup
1. Navigate to `backend` folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Configure your database credentials in `.env`:
   ```env
   DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/winter_arc_db
   API_HOST=127.0.0.1
   API_PORT=8000
   ```
5. Run the FastAPI server:
   ```bash
   python main.py
   ```
   FastAPI server starts at `http://127.0.0.1:8000`.

---

### Step 2: Frontend Setup
1. In a new terminal, navigate to `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

### Step 3: Run as Native Desktop App
Double-click `run_app.bat` or run:
```bash
python desktop/desktop_main.py
```

---

### Step 4: Build Standalone Windows Executable (.exe)
To package the app into a standalone Windows `.exe`:
```bash
python desktop/build_executable.py
```
The generated executable will be created in `desktop/dist/WinterArcTracker/WinterArcTracker.exe`.

---

## 🌐 How to Host This Project Online

You can host this full-stack application online for free or low-cost using the following approaches:

### Option A: Render / Railway / Fly.io (Recommended Full-Stack Hosting)

1. **Database**:
   - Host a managed MySQL database on **PlanetScale**, **Aiven**, **Railway**, or **Render Managed PostgreSQL/MySQL**.
   - Get your production `DATABASE_URL`.

2. **Backend (FastAPI)**:
   - Deploy the `backend` folder to **Render**, **Railway**, or **Fly.io**.
   - Set environment variable `DATABASE_URL` in the hosting dashboard.
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Frontend (React)**:
   - Deploy the `frontend` folder to **Vercel** or **Netlify**.
   - Set build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Configure environment variables to point API calls to your hosted backend API URL.

### Option B: Monolithic Deployment on a Single VPS (DigitalOcean / Linode / AWS EC2)
1. Provision a small Ubuntu VPS.
2. Install MySQL 8, Python 3.11, and Nginx.
3. Use `systemd` to keep `uvicorn main:app` running continuously as a background service.
4. Build the React frontend (`npm run build`) and serve static files directly using Nginx as a reverse proxy.

---

## 🔒 Security & Privacy Notice
- `.env` files containing local database passwords and sensitive environment configurations are strictly excluded via `.gitignore` and are **never** committed to version control.
