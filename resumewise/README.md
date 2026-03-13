# ✦ ResumeWise — AI Resume Advisor & Opportunity Engine

> Full-stack web app for students & early-career professionals  
> **Bennett University | Design Thinking & Innovation Project**

---

## 🗂️ Project Structure

```
ResumeWise/
├── backend/                   ← Python Flask API
│   ├── app.py                 ← Main Flask app (entry point)
│   ├── database.py            ← SQLite setup & init
│   ├── middleware.py          ← JWT auth decorator
│   ├── requirements.txt       ← Python dependencies
│   └── routes/
│       ├── auth.py            ← POST /api/auth/signup  POST /api/auth/login
│       ├── resume.py          ← POST /api/resume/analyze  GET /api/resume/history
│       └── coverletter.py     ← POST /api/cover/generate  GET /api/cover/history
│
└── frontend/                  ← React (Vite) app
    └── src/
        ├── App.jsx            ← Root shell + navigation
        ├── api.js             ← Fetch helper (calls backend)
        ├── context/
        │   └── AuthContext.jsx ← Login state (JWT stored in localStorage)
        └── pages/
            ├── AuthPage.jsx        ← Login / Signup
            ├── AnalyzePage.jsx     ← Resume analyser (main feature)
            ├── CoverLetterPage.jsx ← Cover letter generator
            └── HistoryPage.jsx     ← Saved analyses & letters
```

---

## ⚙️ Backend Setup (Python Flask)

### 1. Navigate to backend
```bash
cd ResumeWise/backend
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set your Anthropic API key
```bash
# Mac/Linux
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Windows
set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 5. Run the server
```bash
python app.py
```
✅ API running at `http://localhost:5000`

---

## 🖥️ Frontend Setup (React + Vite)

### 1. Navigate to frontend
```bash
cd ResumeWise/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the dev server
```bash
npm run dev
```
✅ App running at `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint                        | Auth? | Description                  |
|--------|---------------------------------|-------|------------------------------|
| POST   | `/api/auth/signup`              | ❌    | Register new user             |
| POST   | `/api/auth/login`               | ❌    | Login and get JWT token       |
| GET    | `/api/auth/me`                  | ✅    | Get logged-in user profile    |
| POST   | `/api/resume/analyze`           | ✅    | Analyse resume with AI        |
| GET    | `/api/resume/history`           | ✅    | List all saved analyses       |
| GET    | `/api/resume/history/<id>`      | ✅    | Get one full analysis         |
| DELETE | `/api/resume/history/<id>`      | ✅    | Delete an analysis            |
| POST   | `/api/cover/generate`           | ✅    | Generate cover letter with AI |
| GET    | `/api/cover/history`            | ✅    | List all saved cover letters  |
| DELETE | `/api/cover/history/<id>`       | ✅    | Delete a cover letter         |
| GET    | `/api/health`                   | ❌    | Health check                  |

---

## 🗃️ Database Schema (SQLite)

**users**
| Column     | Type    | Notes             |
|------------|---------|-------------------|
| id         | INTEGER | Primary key       |
| name       | TEXT    | Full name         |
| email      | TEXT    | Unique            |
| password   | TEXT    | bcrypt hashed     |
| created_at | DATETIME| Auto              |

**resume_analyses**
| Column      | Type    | Notes                  |
|-------------|---------|------------------------|
| id          | INTEGER | Primary key            |
| user_id     | INTEGER | FK → users             |
| resume_text | TEXT    | Original resume        |
| result_json | TEXT    | Full AI result (JSON)  |
| score       | INTEGER | 0–100                  |
| created_at  | DATETIME| Auto                   |

**cover_letters**
| Column      | Type    | Notes            |
|-------------|---------|------------------|
| id          | INTEGER | Primary key      |
| user_id     | INTEGER | FK → users       |
| resume_text | TEXT    | Resume used      |
| job_title   | TEXT    |                  |
| company     | TEXT    |                  |
| letter_text | TEXT    | Generated letter |
| created_at  | DATETIME| Auto             |

---

## 👥 Team

| Member         | Roll No      | Role                              |
|----------------|--------------|-----------------------------------|
| Sanvi Ahuja    | S24CSEU1837  | AI Integration + Backend          |
| Prithul Jaiswal| S24CSEU1852  | Backend (DB, routes, auth)        |
| Tanishka Jain  | S24CSEU1827  | Frontend (React UI/UX)            |

---

## ✨ Features

- 🔐 **User Auth** — Secure signup/login with JWT + bcrypt
- 📊 **Resume Analyser** — Score, strengths, improvements, ATS tips
- 🔍 **Keyword Checker** — Found vs missing keywords with coverage meter
- 🚀 **Career Matching** — Job roles with salary, companies, fit explanation
- 🎓 **Internship Finder** — Tailored for students & fresh graduates
- ⚡ **Growth Plan** — Skills to learn, learning paths, 4-month roadmap
- ✨ **Elevator Pitch** — AI-generated professional summary
- ✉️ **Cover Letter Generator** — Personalised letters for any job/company
- 📁 **History** — All past analyses and cover letters saved per user
