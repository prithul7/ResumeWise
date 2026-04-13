# ResumeWise 🎯
### AI-Powered Resume Advisor & Career Opportunity Engine

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask)
![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?logo=google)

> ResumeWise is a full-stack, AI-driven career platform that analyses your resume, scores it, and helps you discover matching jobs and internships — all in seconds.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **AI Resume Scoring** | Get a score out of 100 with strengths, improvement areas, and ATS tips |
| 🔍 **Keyword Analysis** | See which ATS keywords your resume has and which are missing |
| 💼 **Career Matching** | Discover job roles tailored to your actual skills and experience |
| 🎓 **Internship Matching** | Find internships with stipends suited for students and freshers |
| ⚡ **Growth Roadmap** | Get a personalised 4-month action plan to grow your career |
| ✉️ **AI Cover Letter** | Generate tailored cover letters for any job description |
| 🌐 **Opportunity Finder** | Smart one-click search links to **LinkedIn** and **Unstop** filtered by your skills |
| 📁 **History** | View all past analyses and cover letters with a full modal viewer |
| 🔒 **Secure Auth** | JWT-based user authentication with Bcrypt hashed passwords |

---

## 🖥️ Tech Stack

### Frontend
- **React 18** + **Vite** — Fast, modern UI
- **Vanilla CSS** — Fully custom SaaS dark theme with glassmorphism
- **Google Fonts** (Inter, Syne) — Premium typography

### Backend
- **Python 3.10+** + **Flask** — REST API
- **SQLAlchemy** + **SQLite** — User data and history persistence
- **Flask-CORS** — Cross-origin request handling
- **PyJWT** + **Bcrypt** — Authentication and security

### AI
- **Google Gemini 2.5 Flash** (`google-generativeai`) — Resume analysis and opportunity matching
- **Temperature: 0.0** — Ensures deterministic, consistent outputs
- **Strict JSON schema prompting** — Forces structured AI responses

---

## 📁 Project Structure

```
resumewise/
├── backend/
│   ├── app.py                  # Flask app entry point
│   ├── database.py             # SQLAlchemy models (User, History)
│   ├── middleware.py           # JWT token verification decorator
│   └── routes/
│       ├── auth.py             # Register / Login endpoints
│       ├── resume.py           # AI resume analysis endpoint
│       ├── coverletter.py      # AI cover letter generation endpoint
│       └── opportunities.py   # AI opportunity matching endpoint
│
└── frontend/
    └── src/
        ├── App.jsx             # Main shell with sidebar layout
        ├── api.js              # Centralised API client
        ├── context/
        │   └── AuthContext.jsx # Global auth state (JWT)
        └── pages/
            ├── AuthPage.jsx          # Login / Register UI
            ├── AnalyzePage.jsx       # Two-column resume analysis UI
            ├── OpportunitiesPage.jsx # AI opportunity finder
            ├── CoverLetterPage.jsx   # Cover letter generator
            └── HistoryPage.jsx       # Past analyses with modal viewer
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** — Get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/prithul7/ResumeWise.git
cd ResumeWise/resumewise
```

### 2. Set Up the Backend

```powershell
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate    # macOS/Linux

# Install dependencies
pip install flask flask-cors sqlalchemy bcrypt pyjwt google-generativeai requests

# Set your Gemini API Key
$env:GEMINI_API_KEY="your-api-key-here"   # Windows PowerShell
# export GEMINI_API_KEY="your-api-key-here"  # macOS/Linux

# Start the backend server
python app.py
```

> Backend runs at: **http://localhost:5001**

### 3. Set Up the Frontend

```powershell
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

> Frontend runs at: **http://localhost:5173**

---

## 🔑 Environment Variables

| Variable | Description | Where to Set |
|----------|-------------|--------------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Terminal before starting Flask |

> ⚠️ **Never commit your API key to Git.** Set it as a shell environment variable only.

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and get JWT token | ❌ |
| `POST` | `/api/resume/analyze` | Full AI resume analysis | ✅ |
| `GET` | `/api/resume/history` | Get past analyses | ✅ |
| `POST` | `/api/cover/generate` | Generate a cover letter | ✅ |
| `GET` | `/api/cover/history` | Get past cover letters | ✅ |
| `POST` | `/api/opportunities/find` | AI opportunity matching | ✅ |
| `GET` | `/api/health` | Health check | ❌ |

---

## 🏗️ How It Works

```
[User] → pastes resume text
    ↓
[React Frontend] → sends POST to Flask API (with JWT)
    ↓
[Flask Backend] → constructs a strict JSON-schema prompt
    ↓
[Google Gemini 2.5 Flash] → returns structured JSON analysis
    ↓
[Flask] → parses JSON, saves to SQLite DB, returns to frontend
    ↓
[React] → renders Score Ring, Tabs, Career Cards, LinkedIn/Unstop URLs
```

---

## 👥 Team

| Name | Role | College ID |
|------|------|------------|
| **Sanvi Ahuja** | AI Development + Backend | S24CSEU1837 |
| **Prithul Jaiswal** | Backend, Database, Integration | S24CSEU1852 |
| **Tanishka Jain** | Frontend, UX, Responsiveness | S24CSEU1827 |

---

## 📄 License

This project is for academic and educational purposes.

---

<p align="center">Built with ❤️ using Google Gemini, Flask & React</p>
