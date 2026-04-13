import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const PLACEHOLDER = `Paste your resume text here to find matching opportunities...

Example:
Priya Sharma | priya@email.com
B.Tech Computer Science — Bennett University (2021–2025) | CGPA: 8.4

SKILLS: Python, JavaScript, React, Node.js, SQL, Git
PROJECTS: E-Commerce Platform | React, Node.js, MongoDB`;

export default function OpportunitiesPage() {
  const { token } = useAuth();
  const [resume, setResume] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const find = async () => {
    if (!resume.trim()) { setError("Please paste your resume text."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const data = await api.post("/opportunities/find", { resumeText: resume }, token);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = result?.opportunities?.filter(o =>
    filter === "all" ? true : o.type === filter
  ) || [];

  const matchColor = (s) => s >= 85 ? "#22d3a5" : s >= 70 ? "#f59e0b" : "#f87171";
  const matchBg    = (s) => s >= 85 ? "rgba(34,211,165,.12)" : s >= 70 ? "rgba(245,158,11,.12)" : "rgba(248,113,113,.12)";

  return (
    <div style={{ padding: "28px 0" }}>

      {/* Input Card */}
      <div style={{ background: "linear-gradient(#07090f,#07090f) padding-box, linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#22d3a5) border-box", border: "1.5px solid transparent", borderRadius: 18, padding: 28, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 3, color: "#f0f2f8" }}>🌐 Find Opportunities</h2>
            <p style={{ color: "rgba(240,242,248,.38)", fontSize: 13 }}>Paste your resume — we'll match real jobs &amp; internships from LinkedIn &amp; Unstop</p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-start" }}>
            <span style={chip("#0a66c2")}>🔵 LinkedIn</span>
            <span style={chip("#f97316")}>🟠 Unstop</span>
            <span style={chip("#22d3a5")}>🤖 AI Matched</span>
          </div>
        </div>
        <textarea
          rows={9}
          value={resume}
          onChange={e => setResume(e.target.value)}
          placeholder={PLACEHOLDER}
          style={{ width: "100%", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, color: "#f0f2f8", fontFamily: "Inter,sans-serif", fontSize: 13.5, lineHeight: 1.75, resize: "vertical", padding: 18, boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>⚠️ {error}</p>}
        <button
          onClick={find}
          disabled={loading}
          style={{ width: "100%", marginTop: 14, padding: "15px 0", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "Inter,sans-serif", opacity: loading ? 0.5 : 1 }}
        >
          {loading ? "🔍 Scanning your profile for matching opportunities…" : "🌐 Find My Opportunities"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {["📝 Reading resume", "🧠 Extracting skills", "🔗 Matching LinkedIn", "🎯 Matching Unstop"].map((s, i) => (
              <span key={s} style={{ padding: "6px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, fontSize: 12, color: "rgba(240,242,248,.45)", animation: `pulse 1.8s ${i * 0.4}s infinite` }}>{s}</span>
            ))}
          </div>
          <div style={{ width: 42, height: 42, borderRadius: "50%", border: "3px solid rgba(139,92,246,.2)", borderTopColor: "#8b5cf6", margin: "0 auto", animation: "spin .9s linear infinite" }} />
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Profile Banner */}
          <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.07))", border: "1px solid rgba(99,102,241,.25)", borderRadius: 16, padding: "18px 22px", marginBottom: 18, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>👤</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f2f8" }}>{result.profile?.name}</span>
                <span style={{ padding: "2px 10px", background: "rgba(34,211,165,.12)", border: "1px solid rgba(34,211,165,.25)", borderRadius: 20, fontSize: 12, color: "#22d3a5" }}>{result.profile?.level}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(240,242,248,.5)", margin: "0 0 8px" }}>{result.profile?.summary}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.profile?.topSkills?.map((s, i) => (
                  <span key={i} style={{ padding: "3px 10px", background: "rgba(139,92,246,.12)", border: "1px solid rgba(139,92,246,.22)", borderRadius: 20, fontSize: 11.5, color: "#c4b5fd" }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#6366f1" }}>{result.opportunities?.length}</div>
              <div style={{ fontSize: 11, color: "rgba(240,242,248,.3)", textTransform: "uppercase", letterSpacing: 1 }}>Matched</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[["all", "🌐 All"], ["internship", "🎓 Internships"], ["job", "💼 Jobs"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setFilter(id)} style={{ padding: "8px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 500, fontSize: 13.5, fontFamily: "Inter,sans-serif", border: "1px solid transparent", transition: "all .2s", background: filter === id ? "linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.2))" : "rgba(255,255,255,.04)", borderColor: filter === id ? "rgba(139,92,246,.4)" : "rgba(255,255,255,.09)", color: filter === id ? "#a5b4fc" : "rgba(240,242,248,.45)" }}>
                {lbl} {id !== "all" && <span style={{ fontSize: 11, opacity: 0.6 }}>({result.opportunities?.filter(o => o.type === id).length})</span>}
              </button>
            ))}
          </div>

          {/* Opportunity Cards */}
          <div style={{ display: "grid", gap: 14 }}>
            {filtered.map((opp) => (
              <div key={opp.id} style={{ background: "rgba(255,255,255,.03)", border: opp.type === "internship" ? "1px solid rgba(16,185,129,.14)" : "1px solid rgba(99,102,241,.14)", borderRadius: 16, padding: 20, transition: "all .25s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 18 }}>{opp.type === "internship" ? "🎓" : "💼"}</span>
                      <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#f0f2f8" }}>{opp.title}</h3>
                      <span style={{ padding: "2px 9px", background: opp.type === "internship" ? "rgba(16,185,129,.1)" : "rgba(99,102,241,.1)", border: opp.type === "internship" ? "1px solid rgba(16,185,129,.22)" : "1px solid rgba(99,102,241,.22)", borderRadius: 20, fontSize: 11, color: opp.type === "internship" ? "#34d399" : "#a5b4fc", textTransform: "capitalize" }}>{opp.type}</span>
                    </div>

                    {/* Info Row */}
                    <div style={{ display: "flex", gap: 14, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12.5, color: "rgba(240,242,248,.4)" }}>🏢 {opp.company_type}</span>
                      <span style={{ fontSize: 12.5, color: "rgba(240,242,248,.4)" }}>📍 {opp.location}</span>
                      <span style={{ fontSize: 12.5, color: "rgba(240,242,248,.4)" }}>⏱ {opp.duration}</span>
                    </div>

                    {/* Match Reason */}
                    <p style={{ fontSize: 13, color: "rgba(240,242,248,.6)", lineHeight: 1.55, marginBottom: 10 }}>✨ {opp.match_reason}</p>

                    {/* Skills */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {opp.skills_needed?.map((sk, i) => (
                        <span key={i} style={{ padding: "3px 9px", background: "rgba(139,92,246,.1)", border: "1px solid rgba(139,92,246,.2)", borderRadius: 20, fontSize: 11.5, color: "#c4b5fd" }}>{sk}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
                    {/* Match Score */}
                    <div style={{ background: matchBg(opp.match_score), border: `1px solid ${matchColor(opp.match_score)}44`, borderRadius: 12, padding: "10px 14px", textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 10, color: "rgba(240,242,248,.3)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Match</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: matchColor(opp.match_score), lineHeight: 1 }}>{opp.match_score}%</div>
                    </div>

                    {/* Salary/Stipend */}
                    <div style={{ background: "rgba(34,211,165,.08)", border: "1px solid rgba(34,211,165,.18)", borderRadius: 10, padding: "7px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 10, color: "rgba(240,242,248,.3)", marginBottom: 2 }}>{opp.type === "internship" ? "STIPEND" : "SALARY"}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#22d3a5" }}>{opp.stipend_or_salary}</div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, width: "100%" }}>
                      <a
                        href={opp.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(10,102,194,.2)", border: "1px solid rgba(10,102,194,.4)", color: "#60a5fa", fontSize: 12.5, fontWeight: 600, fontFamily: "Inter,sans-serif", textDecoration: "none", transition: "all .2s", whiteSpace: "nowrap" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(10,102,194,.35)"; e.currentTarget.style.borderColor = "rgba(10,102,194,.7)";}}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(10,102,194,.20)"; e.currentTarget.style.borderColor = "rgba(10,102,194,.4)";}}
                      >
                        🔵 View on LinkedIn
                      </a>
                      <a
                        href={opp.unstop_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(249,115,22,.15)", border: "1px solid rgba(249,115,22,.35)", color: "#fb923c", fontSize: 12.5, fontWeight: 600, fontFamily: "Inter,sans-serif", textDecoration: "none", transition: "all .2s", whiteSpace: "nowrap" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(249,115,22,.3)"; e.currentTarget.style.borderColor = "rgba(249,115,22,.6)";}}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(249,115,22,.15)"; e.currentTarget.style.borderColor = "rgba(249,115,22,.35)";}}
                      >
                        🟠 View on Unstop
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, fontSize: 12, color: "rgba(240,242,248,.3)", lineHeight: 1.6 }}>
            💡 Clicking "View on LinkedIn" or "View on Unstop" opens a pre-filtered search page on the real platform, showing live listings that match your skills. Results may vary based on current openings.
          </div>
        </div>
      )}
    </div>
  );
}

const chip = (c) => ({ padding: "4px 11px", background: `${c}22`, border: `1px solid ${c}44`, borderRadius: 20, fontSize: 11.5, color: c, fontFamily: "Inter,sans-serif" });
