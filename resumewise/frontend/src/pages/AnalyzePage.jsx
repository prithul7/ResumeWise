import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const PLACEHOLDER = `Paste your resume text here...

Example:
Priya Sharma | priya@email.com | LinkedIn: /in/priyasharma

EDUCATION
B.Tech Computer Science — Bennett University (2021–2025) | CGPA: 8.4/10

EXPERIENCE
Web Development Intern — TechStartup (Jun–Aug 2024)
• Built RESTful APIs using Node.js reducing response time by 30%

PROJECTS
E-Commerce Platform | React, Node.js, MongoDB
• Developed full-stack app with 500+ active users

SKILLS
Python, JavaScript, React, Node.js, SQL, Git`;

const TABS = [
  { id: "overview",    icon: "📊", label: "Overview"    },
  { id: "keywords",    icon: "🔍", label: "Keywords"    },
  { id: "careers",     icon: "🚀", label: "Careers"     },
  { id: "internships", icon: "🎓", label: "Internships" },
  { id: "growth",      icon: "⚡", label: "Growth Plan" },
];
const CATS = ["All","Technology","Business","Design","Data","Management"];

export default function AnalyzePage() {
  const { token } = useAuth();
  const [resume,  setResume]  = useState("");
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState("overview");
  const [catFilter, setCat]   = useState("All");
  const [showPitch, setShowPitch] = useState(false);
  const ref = useRef(null);

  const analyze = async () => {
    if (!resume.trim()) { setError("Please paste your resume text."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const data = await api.post("/resume/analyze", { resumeText: resume }, token);
      setResult(data.result);
      setTab("overview");
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), 150);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const sc  = (v) => v >= 80 ? "#22d3a5" : v >= 60 ? "#f59e0b" : "#f87171";
  const scb = (v) => v >= 80 ? "rgba(34,211,165,.12)" : v >= 60 ? "rgba(245,158,11,.12)" : "rgba(248,113,113,.12)";
  const scd = (v) => v >= 80 ? "rgba(34,211,165,.3)"  : v >= 60 ? "rgba(245,158,11,.3)"  : "rgba(248,113,113,.3)";

  const careers = result?.careers?.filter(c => catFilter === "All" || c.category === catFilter) || [];

  return (
    <div style={{ padding: "28px 0" }}>
      {/* Input */}
      <div style={{ background: "linear-gradient(#07090f,#07090f) padding-box, linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#22d3a5) border-box", border: "1.5px solid transparent", borderRadius: 18, padding: 28, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 3, color: "#f0f2f8" }}>📋 Paste Your Resume</h2>
            <p style={{ color: "rgba(240,242,248,.38)", fontSize: 13 }}>More detail = better insights from AI</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={chip("#22d3a5")}>🤖 AI Powered</span>
            <span style={chip("#818cf8")}>🔒 Private</span>
          </div>
        </div>
        <textarea rows={11} value={resume} onChange={e => setResume(e.target.value)} placeholder={PLACEHOLDER}
          style={{ width: "100%", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, color: "#f0f2f8", fontFamily: "Inter,sans-serif", fontSize: 13.5, lineHeight: 1.75, resize: "vertical", padding: 18, boxSizing: "border-box" }} />
        {resume && <div style={{ textAlign: "right", fontSize: 12, color: "rgba(240,242,248,.25)", marginTop: 4 }}>{resume.trim().split(/\s+/).length} words</div>}
        {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>⚠️ {error}</p>}
        <button onClick={analyze} disabled={loading}
          style={{ width: "100%", marginTop: 14, padding: "15px 0", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "Inter,sans-serif", opacity: loading ? .5 : 1 }}>
          {loading ? "✦  Analysing your profile…" : "✦  Analyse Resume & Discover Opportunities"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {["🔍 Reading","🧠 Analysing","💼 Matching","✨ Crafting"].map((s,i) => (
              <span key={s} style={{ padding: "6px 12px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, fontSize: 12, color: "rgba(240,242,248,.45)", animation: `pulse 1.8s ${i*0.35}s infinite` }}>{s}</span>
            ))}
          </div>
          <div style={{ width: 42, height: 42, borderRadius: "50%", border: "3px solid rgba(139,92,246,.2)", borderTopColor: "#8b5cf6", margin: "0 auto", animation: "spin .9s linear infinite" }} />
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={ref}>
          {/* Score Banner */}
          <div style={{ ...glass, display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", padding: 24, marginBottom: 16, background: "linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.06))", borderColor: "rgba(99,102,241,.2)" }}>
            <div style={{ width: 128, height: 128, borderRadius: "50%", background: `conic-gradient(${sc(result.score)} ${result.score*3.6}deg, rgba(255,255,255,.05) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 32px ${sc(result.score)}44` }}>
              <div style={{ background: "#07090f", width: 94, height: 94, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: sc(result.score), lineHeight: 1 }}>{result.score}</span>
                <span style={{ fontSize: 10, color: "rgba(240,242,248,.3)", marginTop: 2 }}>/ 100</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f2f8" }}>Resume Score</h2>
                <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: scb(result.score), border: `1px solid ${scd(result.score)}`, color: sc(result.score) }}>{result.scoreLabel}</span>
              </div>
              <p style={{ color: "rgba(240,242,248,.5)", fontSize: 13.5, lineHeight: 1.65, marginBottom: 12 }}>{result.summary}</p>
              <button onClick={() => setShowPitch(p => !p)}
                style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(139,92,246,.15)", border: "1px solid rgba(139,92,246,.3)", color: "#c4b5fd", fontSize: 12.5, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
                {showPitch ? "Hide" : "✨ Show"} Elevator Pitch
              </button>
            </div>
          </div>

          {showPitch && result.elevatorPitch && (
            <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,.1),rgba(236,72,153,.07))", border: "1px solid rgba(139,92,246,.25)", borderRadius: 14, padding: "18px 20px 18px 38px", marginBottom: 16, fontSize: 14, lineHeight: 1.7, color: "rgba(240,242,248,.78)", fontStyle: "italic", position: "relative" }}>
              <span style={{ position: "absolute", top: -4, left: 12, fontSize: 46, color: "rgba(139,92,246,.3)", fontFamily: "serif", lineHeight: 1 }}>"</span>
              {result.elevatorPitch}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "9px 17px", borderRadius: 10, cursor: "pointer", fontWeight: 500, fontSize: 13.5, fontFamily: "Inter,sans-serif", whiteSpace: "nowrap", border: "1px solid transparent", transition: "all .2s",
                  background: tab === t.id ? "linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.2))" : "transparent",
                  borderColor: tab === t.id ? "rgba(139,92,246,.4)" : "transparent",
                  color: tab === t.id ? "#a5b4fc" : "rgba(240,242,248,.4)" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={glass}>
                  <div style={secTitle("#6ee7b7")}>✅ Strengths</div>
                  {result.strengths?.map((s,i) => <BulletRow key={i} n={i+1} text={s} color="#22d3a5" />)}
                </div>
                <div style={glass}>
                  <div style={secTitle("#fcd34d")}>🔧 Improvements</div>
                  {result.improvements?.map((s,i) => <BulletRow key={i} n={i+1} text={s} color="#f59e0b" />)}
                </div>
              </div>

              {/* Profile Bars */}
              <div style={glass}>
                <div style={secTitle()}>📊 Profile Strength</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 28px" }}>
                  {result.profileScores && Object.entries(result.profileScores).map(([k,v]) => {
                    const labels = { contentQuality:"Content Quality", atsCompatibility:"ATS Compatibility", careerClarity:"Career Clarity", skillsRelevance:"Skills Relevance", impactStatements:"Impact Statements", formatting:"Formatting" };
                    return (
                      <div key={k}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 12.5, color: "rgba(240,242,248,.5)" }}>{labels[k]||k}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: sc(v) }}>{v}%</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                          <div style={{ width: `${v}%`, height: "100%", borderRadius: 6, background: `linear-gradient(90deg,${sc(v)},${sc(v)}99)`, transition: "width 1.2s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ATS Tips */}
              <div style={glass}>
                <div style={secTitle("#a5b4fc")}>🤖 ATS Tips</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
                  {result.atsTips?.map((t,i) => (
                    <div key={i} style={{ background: "rgba(99,102,241,.07)", border: "1px solid rgba(99,102,241,.14)", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "rgba(240,242,248,.62)", lineHeight: 1.55 }}>{t}</div>
                  ))}
                </div>
              </div>

              {/* Trends */}
              {result.industryTrends && (
                <div style={glass}>
                  <div style={secTitle()}>📡 Industry Trends</div>
                  {result.industryTrends.map((t,i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: "rgba(99,102,241,.05)", border: "1px solid rgba(99,102,241,.12)", borderRadius: 10, marginBottom: 8 }}>
                      <span style={{ color: "#818cf8", fontWeight: 700, flexShrink: 0 }}>{i+1}.</span>
                      <p style={{ fontSize: 13, color: "rgba(240,242,248,.62)", lineHeight: 1.5, margin: 0 }}>{t}</p>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ ...glass, background: "linear-gradient(135deg,rgba(236,72,153,.07),rgba(139,92,246,.06))", borderColor: "rgba(236,72,153,.2)" }}>
                <div style={secTitle("#f9a8d4")}>✨ Brand Tip</div>
                <p style={{ fontSize: 14, color: "rgba(240,242,248,.7)", lineHeight: 1.65, margin: 0 }}>{result.brandTip}</p>
              </div>
            </div>
          )}

          {/* ── KEYWORDS ── */}
          {tab === "keywords" && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={glass}>
                  <div style={secTitle("#6ee7b7")}>✅ Found ({result.keywordsFound?.length||0})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {result.keywordsFound?.map((k,i) => <span key={i} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "rgba(34,211,165,.12)", border: "1px solid rgba(34,211,165,.25)", color: "#6ee7b7" }}>{k}</span>)}
                  </div>
                </div>
                <div style={glass}>
                  <div style={secTitle("#fca5a5")}>❌ Missing ({result.keywordsMissing?.length||0})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {result.keywordsMissing?.map((k,i) => <span key={i} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.2)", color: "#fca5a5" }}>+ {k}</span>)}
                  </div>
                </div>
              </div>
              <div style={glass}>
                <div style={secTitle()}>📊 Coverage</div>
                {(() => {
                  const total = (result.keywordsFound?.length||0) + (result.keywordsMissing?.length||0);
                  const pct = total > 0 ? Math.round((result.keywordsFound.length/total)*100) : 0;
                  return (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 13.5, color: "rgba(240,242,248,.52)" }}>ATS Keyword Coverage</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: sc(pct) }}>{pct}%</span>
                      </div>
                      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 6, height: 12, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, background: "linear-gradient(90deg,#6366f1,#22d3a5)", transition: "width 1.2s" }} />
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(240,242,248,.35)", marginTop: 10, lineHeight: 1.5 }}>
                        {pct >= 70 ? "✅ Great coverage! Your resume is well-optimised for ATS systems." : "⚠️ Add the missing keywords to significantly improve your ATS pass rate."}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ── CAREERS ── */}
          {tab === "careers" && (
            <div>
              <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter,sans-serif", border: "1px solid rgba(255,255,255,.1)", background: catFilter===c ? "linear-gradient(135deg,rgba(99,102,241,.28),rgba(139,92,246,.22))" : "transparent", borderColor: catFilter===c ? "rgba(139,92,246,.4)" : "rgba(255,255,255,.1)", color: catFilter===c ? "#c4b5fd" : "rgba(240,242,248,.45)" }}>
                    {c}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {(careers.length > 0 ? careers : result.careers||[]).map((c,i) => (
                  <div key={i} style={{ ...glass, padding: 20, transition: "all .25s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6, flexWrap: "wrap" }}>
                          <div style={{ width: 27, height: 27, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, color: "#fff" }}>{i+1}</div>
                          <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#f0f2f8" }}>{c.title}</h3>
                          {c.category && <span style={{ padding: "2px 9px", background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.22)", borderRadius: 20, fontSize: 11.5, color: "#a5b4fc" }}>{c.category}</span>}
                          {c.level && <span style={{ padding: "2px 9px", background: "rgba(34,211,165,.1)", border: "1px solid rgba(34,211,165,.2)", borderRadius: 20, fontSize: 11.5, color: "#6ee7b7" }}>{c.level}</span>}
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(240,242,248,.5)", marginLeft: 36, marginBottom: 8, lineHeight: 1.55 }}>{c.fit}</p>
                        {c.skills && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 36, marginBottom: 8 }}>{c.skills.map((sk,j) => <span key={j} style={{ padding: "3px 9px", background: "rgba(139,92,246,.12)", border: "1px solid rgba(139,92,246,.2)", borderRadius: 20, fontSize: 11.5, color: "#c4b5fd" }}>{sk}</span>)}</div>}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 36 }}>{c.companies.map((co,j) => <span key={j} style={{ padding: "3px 10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 20, fontSize: 11.5, color: "rgba(240,242,248,.42)" }}>🏢 {co}</span>)}</div>
                      </div>
                      <div style={{ background: "rgba(34,211,165,.1)", border: "1px solid rgba(34,211,165,.22)", borderRadius: 10, padding: "8px 13px", textAlign: "center", flexShrink: 0, height: "fit-content" }}>
                        <div style={{ fontSize: 10, color: "rgba(240,242,248,.3)", marginBottom: 2 }}>SALARY</div>
                        <div style={{ color: "#22d3a5", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{c.salary}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── INTERNSHIPS ── */}
          {tab === "internships" && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <span style={{ padding: "6px 14px", background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 20, fontSize: 12.5, color: "#6ee7b7" }}>🎓 Tailored for students &amp; fresh graduates</span>
              </div>
              <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
                {result.internships?.map((intern,i) => (
                  <div key={i} style={{ background: "linear-gradient(135deg,rgba(16,185,129,.06),rgba(99,102,241,.04))", border: "1px solid rgba(16,185,129,.15)", borderRadius: 14, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>🎯</span>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f0f2f8" }}>{intern.title}</h3>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(240,242,248,.5)", marginLeft: 27, marginBottom: 8, lineHeight: 1.5 }}>{intern.fit}</p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 27 }}>{intern.companies?.map((co,j) => <span key={j} style={{ padding: "3px 10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 20, fontSize: 11.5, color: "rgba(240,242,248,.42)" }}>🏢 {co}</span>)}</div>
                      </div>
                      {intern.stipend && <div style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 10, padding: "8px 13px", textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: "rgba(240,242,248,.3)", marginBottom: 2 }}>STIPEND</div>
                        <div style={{ color: "#34d399", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{intern.stipend}</div>
                      </div>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={glass}>
                <div style={secTitle("#34d399")}>💡 Application Tips</div>
                {["Tailor your resume for each role using JD keywords.","Highlight projects & achievements over work experience gaps.","Connect with employees on LinkedIn before applying for referrals.","Apply to 15–20 positions weekly — volume matters!"].map((t,i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i<3 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                    <span style={{ color: "#34d399", flexShrink: 0 }}>→</span>
                    <p style={{ fontSize: 13, color: "rgba(240,242,248,.58)", lineHeight: 1.5, margin: 0 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GROWTH PLAN ── */}
          {tab === "growth" && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={glass}>
                <div style={secTitle()}>⚡ Skills to Add</div>
                {result.skillsToAdd?.map((s,i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, marginBottom: 8 }}>
                    <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0,
                      ...(s.priority==="High" ? { background:"rgba(239,68,68,.12)", border:"1px solid rgba(239,68,68,.25)", color:"#fca5a5" } :
                         s.priority==="Medium" ? { background:"rgba(245,158,11,.12)", border:"1px solid rgba(245,158,11,.25)", color:"#fcd34d" } :
                         { background:"rgba(34,211,165,.1)", border:"1px solid rgba(34,211,165,.2)", color:"#6ee7b7" }) }}>
                      {s.priority}
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f2f8" }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(240,242,248,.4)" }}>{s.reason}</div>
                    </div>
                  </div>
                ))}
              </div>

              {result.learningPaths && (
                <div style={glass}>
                  <div style={secTitle()}>🎓 Learning Paths</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                    {result.learningPaths.map((lp,i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 13, padding: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#f0f2f8", lineHeight: 1.3 }}>{lp.title}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ padding: "2px 8px", background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 20, fontSize: 11, color: "#fcd34d" }}>📚 {lp.platform}</span>
                          <span style={{ padding: "2px 8px", background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 20, fontSize: 11, color: "#a5b4fc" }}>⏱ {lp.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={glass}>
                <div style={secTitle()}>🗺️ 4-Month Roadmap</div>
                {[
                  { m:"Month 1", c:"#6366f1", bg:"rgba(99,102,241,.1)",  b:"rgba(99,102,241,.22)",  t:"Optimize & Learn",   d:"Revamp resume, add missing keywords, start top-priority skill." },
                  { m:"Month 2", c:"#8b5cf6", bg:"rgba(139,92,246,.1)", b:"rgba(139,92,246,.22)", t:"Build & Apply",      d:"Build a portfolio project. Apply to 10–15 matched roles weekly." },
                  { m:"Month 3", c:"#ec4899", bg:"rgba(236,72,153,.08)",b:"rgba(236,72,153,.2)",  t:"Network & Interview",d:"Network on LinkedIn, attend career fairs, prep for interviews." },
                  { m:"Month 4", c:"#22d3a5", bg:"rgba(34,211,165,.08)",b:"rgba(34,211,165,.18)", t:"Evaluate & Grow",    d:"Review results, refine approach, plan your next milestone." },
                ].map((m,i) => (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                    <div style={{ flexShrink: 0, width: 70, padding: "5px 8px", textAlign: "center", background: m.bg, border: `1px solid ${m.b}`, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: m.c, lineHeight: 1.3 }}>{m.m}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: m.c, marginBottom: 3 }}>{m.t}</div>
                      <p style={{ fontSize: 13, color: "rgba(240,242,248,.5)", lineHeight: 1.5, margin: 0 }}>{m.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────
const glass = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 18, padding: 22 };
const secTitle = (c) => ({ fontSize: 11.5, fontWeight: 600, letterSpacing: 1.8, textTransform: "uppercase", color: c || "rgba(240,242,248,.3)", marginBottom: 13 });
const chip = (c) => ({ padding: "4px 10px", background: `${c}1a`, border: `1px solid ${c}33`, borderRadius: 20, fontSize: 11.5, color: c });

function BulletRow({ n, text, color }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
      <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color, marginTop: 1, fontWeight: 700 }}>{n}</span>
      <p style={{ fontSize: 13, color: "rgba(240,242,248,.7)", lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  );
}
