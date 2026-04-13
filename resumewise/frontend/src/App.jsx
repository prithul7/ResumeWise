import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import AnalyzePage from "./pages/AnalyzePage";
import CoverLetterPage from "./pages/CoverLetterPage";
import HistoryPage from "./pages/HistoryPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: #07090f; color: #f0f2f8; font-family: 'Inter','Segoe UI',sans-serif; overflow: hidden; }
  input:focus, textarea:focus { outline: none; border-color: rgba(99,102,241,.55) !important; background: rgba(99,102,241,.04) !important; }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(139,92,246,.3); border-radius: 4px; }
  button { font-family: inherit; }
  a { color: inherit; }
`;

const NAV = [
  { id: "analyze",       icon: "📊", label: "Analyse",      sub: "AI resume scoring"    },
  { id: "opportunities", icon: "🌐", label: "Opportunities", sub: "Jobs & internships"   },
  { id: "coverletter",   icon: "✉️",  label: "Cover Letter", sub: "Generate letters"     },
  { id: "history",       icon: "📁",  label: "History",      sub: "Past analyses"        },
];

function Sidebar({ page, setPage, user, logout }) {
  const initials = (user.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <aside style={{
      width: 260, flexShrink: 0, height: "100vh", display: "flex", flexDirection: "column",
      background: "rgba(255,255,255,.016)", borderRight: "1px solid rgba(255,255,255,.055)",
      position: "sticky", top: 0, overflowY: "auto", overflowX: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,.05)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", minWidth: 0 }} onClick={() => setPage("analyze")}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #4f46e5, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(79,70,229,0.4)", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, background: "linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" }}>ResumeWise</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(240,242,248,.18)", textTransform: "uppercase", letterSpacing: 1.6, paddingLeft: 8, marginBottom: 6 }}>Menu</p>
        {NAV.map(n => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11,
              padding: "10px 11px", borderRadius: 11, cursor: "pointer",
              border: active ? "1px solid rgba(139,92,246,.28)" : "1px solid transparent",
              background: active ? "linear-gradient(135deg,rgba(99,102,241,.2),rgba(139,92,246,.13))" : "transparent",
              color: active ? "#c4b5fd" : "rgba(240,242,248,.47)", transition: "all .15s",
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.045)"; e.currentTarget.style.color = "rgba(240,242,248,.85)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(240,242,248,.47)"; } }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.15 }}>{n.label}</div>
                <div style={{ fontSize: 10.5, color: "rgba(240,242,248,.25)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.sub}</div>
              </div>
              {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#8b5cf6", flexShrink: 0 }} />}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ margin: "0 14px", borderTop: "1px solid rgba(255,255,255,.05)" }} />

      {/* User card */}
      <div style={{ padding: "14px 12px 18px" }}>
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#f0f2f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: 10.5, color: "rgba(240,242,248,.28)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "1px solid rgba(248,113,113,.2)", background: "rgba(248,113,113,.06)", color: "#fca5a5", fontSize: 12, cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,.14)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,.06)"}
          >↩ Logout</button>
        </div>
      </div>
    </aside>
  );
}

function Shell() {
  const { user, logout, ready } = useAuth();
  const [page, setPage] = useState("analyze");

  if (!ready) return (
    <div style={{ height: "100vh", background: "#07090f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(139,92,246,.2)", borderTopColor: "#8b5cf6", animation: "spin .9s linear infinite" }} />
    </div>
  );

  if (!user) return <AuthPage onSuccess={() => setPage("analyze")} />;

  const current = NAV.find(n => n.id === page);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07090f", color: "#f0f2f8", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{G}</style>

      <Sidebar page={page} setPage={setPage} user={user} logout={logout} />

      {/* Right side */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          flexShrink: 0, height: 56,
          background: "rgba(7,9,15,.8)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,.05)",
          padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18 }}>{current?.icon}</span>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#f0f2f8", lineHeight: 1.1 }}>{current?.label}</div>
              <div style={{ fontSize: 11, color: "rgba(240,242,248,.28)" }}>{current?.sub}</div>
            </div>
          </div>
          {page === "analyze" && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {["📄 AI Analysis", "🔍 Keywords", "💼 Careers", "🎓 Internships", "⚡ Growth"].map(f => (
                <span key={f} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", color: "rgba(240,242,248,.38)" }}>{f}</span>
              ))}
            </div>
          )}
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
          <div style={{ display: page === "analyze"       ? "flex" : "none", height: "calc(100vh - 56px - 52px)", minHeight: 500 }}><AnalyzePage /></div>
          <div style={{ display: page === "opportunities" ? "block" : "none" }}><OpportunitiesPage /></div>
          <div style={{ display: page === "coverletter"   ? "block" : "none" }}><CoverLetterPage /></div>
          <div style={{ display: page === "history"       ? "block" : "none" }}><HistoryPage /></div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><Shell /></AuthProvider>;
}
