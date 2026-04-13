import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const glass = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 14, padding: 18 };
const sc = (v) => v >= 80 ? "#22d3a5" : v >= 60 ? "#f59e0b" : "#f87171";

export default function HistoryPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState("resumes");
  const [resumes, setResumes] = useState([]);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [r, l] = await Promise.all([
        api.get("/resume/history", token),
        api.get("/cover/history", token),
      ]);
      setResumes(r); setLetters(l);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const delResume = async (id) => {
    await api.delete(`/resume/history/${id}`, token);
    setResumes(rs => rs.filter(r => r.id !== id));
  };
  const delLetter = async (id) => {
    await api.delete(`/cover/history/${id}`, token);
    setLetters(ls => ls.filter(l => l.id !== id));
  };

  const viewDetail = async (type, id) => {
    try {
      const data = await api.get(`/${type}/history/${id}`, token);
      setViewItem({ type, data });
    } catch (e) {
      console.error(e);
    }
  };

  const fmt = (dt) => new Date(dt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

  return (
    <div style={{ padding: "28px 0" }}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f0f2f8", marginBottom: 4 }}>📁 My History</h2>
        <p style={{ color: "rgba(240,242,248,.4)", fontSize: 14 }}>All your saved resume analyses and cover letters</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["resumes","📄 Resume Analyses"], ["letters","✉️ Cover Letters"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: "9px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 500, fontSize: 14, fontFamily: "Inter,sans-serif", border: "1px solid transparent", transition: "all .2s",
              background: tab===id ? "linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.2))" : "rgba(255,255,255,.04)",
              borderColor: tab===id ? "rgba(139,92,246,.4)" : "rgba(255,255,255,.09)",
              color: tab===id ? "#a5b4fc" : "rgba(240,242,248,.45)" }}>
            {lbl}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", border: "3px solid rgba(139,92,246,.2)", borderTopColor: "#8b5cf6", margin: "0 auto", animation: "spin .9s linear infinite" }} />
        </div>
      )}

      {/* Resume History */}
      {!loading && tab === "resumes" && (
        resumes.length === 0
          ? <Empty text="No resume analyses yet. Head to Analyse to get started!" />
          : <div style={{ display: "grid", gap: 12 }}>
              {resumes.map(r => (
                <div key={r.id} onClick={() => viewDetail("resume", r.id)} style={{ ...glass, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", cursor: "pointer" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ width: 36, height: 36, borderRadius: 10, background: sc(r.score)+"22", border: `1px solid ${sc(r.score)}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: sc(r.score), flexShrink: 0 }}>{r.score}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f8" }}>Resume Analysis #{r.id}</div>
                        <div style={{ fontSize: 12, color: "rgba(240,242,248,.35)" }}>📅 {fmt(r.created_at)}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12.5, color: "rgba(240,242,248,.38)", lineHeight: 1.5, margin: 0 }}>{r.preview}…</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); delResume(r.id); }}
                    style={{ padding: "5px 13px", borderRadius: 8, border: "1px solid rgba(248,113,113,.25)", background: "rgba(248,113,113,.08)", color: "#fca5a5", fontSize: 12.5, cursor: "pointer", fontFamily: "Inter,sans-serif", flexShrink: 0 }}>
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
      )}

      {/* Cover Letter History */}
      {!loading && tab === "letters" && (
        letters.length === 0
          ? <Empty text="No cover letters yet. Head to Cover Letter to generate one!" />
          : <div style={{ display: "grid", gap: 12 }}>
              {letters.map(l => (
                <div key={l.id} onClick={() => viewDetail("cover", l.id)} style={{ ...glass, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", cursor: "pointer" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>✉️</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f8" }}>{l.job_title || "Cover Letter"} {l.company ? `@ ${l.company}` : ""}</div>
                        <div style={{ fontSize: 12, color: "rgba(240,242,248,.35)" }}>📅 {fmt(l.created_at)}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12.5, color: "rgba(240,242,248,.38)", lineHeight: 1.5, margin: 0 }}>{l.preview}…</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); delLetter(l.id); }}
                    style={{ padding: "5px 13px", borderRadius: 8, border: "1px solid rgba(248,113,113,.25)", background: "rgba(248,113,113,.08)", color: "#fca5a5", fontSize: 12.5, cursor: "pointer", fontFamily: "Inter,sans-serif", flexShrink: 0 }}>
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
      )}

      {/* Modal */}
      {viewItem && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "rgba(0,0,0,.75)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewItem(null)}>
          <div style={{ background: "#0a0c14", border: "1px solid rgba(139,92,246,.3)", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "85vh", overflowY: "auto", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,.5)" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "sticky", top: 0, background: "rgba(10,12,20,.9)", backdropFilter: "blur(12px)", padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f0f2f8" }}>
                {viewItem.type === "resume" ? `Resume Analysis #${viewItem.data.id}` : (viewItem.data.job_title || "Cover Letter")}
              </h3>
              <button onClick={() => setViewItem(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.5)", fontSize: 26, cursor: "pointer", lineHeight: 1 }}>&times;</button>
            </div>
            
            <div style={{ padding: 24 }}>
              {viewItem.type === "resume" ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: `conic-gradient(${sc(viewItem.data.score)} ${viewItem.data.score*3.6}deg, rgba(255,255,255,.05) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ background: "#0a0c14", width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: sc(viewItem.data.score) }}>{viewItem.data.score}</div>
                    </div>
                    <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>{viewItem.data.result?.summary}</div>
                  </div>
                  <h4 style={{ color: "#22d3a5", marginBottom: 12, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>✅ Strengths</h4>
                  <ul style={{ paddingLeft: 20, marginBottom: 24, fontSize: 13.5, color: "rgba(255,255,255,.65)", lineHeight: 1.6 }}>{viewItem.data.result?.strengths?.map((s,i) => <li key={i} style={{marginBottom:6}}>{s}</li>)}</ul>
                  <h4 style={{ color: "#f59e0b", marginBottom: 12, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🔧 Improvements</h4>
                  <ul style={{ paddingLeft: 20, marginBottom: 20, fontSize: 13.5, color: "rgba(255,255,255,.65)", lineHeight: 1.6 }}>{viewItem.data.result?.improvements?.map((s,i) => <li key={i} style={{marginBottom:6}}>{s}</li>)}</ul>
                  {viewItem.data.result?.elevatorPitch && (
                    <div style={{ padding: 14, background: "rgba(139,92,246,.08)", border: "1px solid rgba(139,92,246,.2)", borderRadius: 12, fontSize: 13, fontStyle: "italic", color: "#c4b5fd", lineHeight: 1.6 }}>
                      "{viewItem.data.result?.elevatorPitch}"
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "rgba(255,255,255,.75)", lineHeight: 1.8, fontFamily: "serif" }}>
                  {viewItem.data.letter_text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(240,242,248,.3)", fontSize: 14 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
      {text}
    </div>
  );
}
