import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import AnalyzePage from "./pages/AnalyzePage";
import CoverLetterPage from "./pages/CoverLetterPage";
import HistoryPage from "./pages/HistoryPage";

function Shell() {
  const { user, logout, ready } = useAuth();
  const [page, setPage] = useState("analyze");

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: "#07090f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(139,92,246,.2)", borderTopColor: "#8b5cf6", animation: "spin .9s linear infinite" }} />
    </div>
  );

  if (!user) return <AuthPage onSuccess={() => setPage("analyze")} />;

  const navItems = [
    { id: "analyze",     icon: "📊", label: "Analyse"      },
    { id: "coverletter", icon: "✉️",  label: "Cover Letter" },
    { id: "history",     icon: "📁",  label: "History"      },
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "#07090f", minHeight: "100vh", color: "#f0f2f8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input:focus,textarea:focus{outline:none;border-color:rgba(99,102,241,.5)!important;background:rgba(99,102,241,.05)!important}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(139,92,246,.35);border-radius:3px}
      `}</style>

      {/* ── TOP NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(7,9,15,.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,.07)",
        padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("analyze")}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: "0 2px 14px rgba(99,102,241,.4)" }}>✦</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, background: "linear-gradient(90deg,#818cf8,#c084fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ResumeWise</span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ padding: "7px 16px", borderRadius: 9, border: "1px solid transparent", background: page===n.id ? "linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.18))" : "transparent", borderColor: page===n.id ? "rgba(139,92,246,.35)" : "transparent", color: page===n.id ? "#a5b4fc" : "rgba(240,242,248,.45)", fontWeight: 500, fontSize: 13.5, cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all .2s" }}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#f0f2f8" }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(240,242,248,.35)" }}>{user.email}</div>
          </div>
          <button onClick={logout}
            style={{ padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(248,113,113,.25)", background: "rgba(248,113,113,.07)", color: "#fca5a5", fontSize: 12.5, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── HERO BAND (on analyze page) ── */}
      {page === "analyze" && (
        <div style={{
          background: "radial-gradient(ellipse 90% 60% at 20% -5%,rgba(99,102,241,.18) 0%,transparent 60%), radial-gradient(ellipse 60% 40% at 85% 10%,rgba(236,72,153,.12) 0%,transparent 55%)",
          padding: "28px 24px 22px", borderBottom: "1px solid rgba(255,255,255,.05)"
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, background: "linear-gradient(90deg,#f0f2f8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Hi {user.name.split(" ")[0]}, ready to level up? 👋
            </h1>
            <p style={{ color: "rgba(240,242,248,.42)", fontSize: 14 }}>Paste your resume and get AI-powered career insights in seconds</p>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {["📄 Resume Analysis","🔍 Keyword Check","💼 Career Matching","🎓 Internships","📈 Growth Plan","✨ Elevator Pitch"].map(f => (
                <span key={f} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11.5, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", color: "rgba(240,242,248,.48)" }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 80px" }}>
        {page === "analyze"     && <AnalyzePage />}
        {page === "coverletter" && <CoverLetterPage />}
        {page === "history"     && <HistoryPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
