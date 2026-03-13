import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const glass = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 18, padding: 22 };
const label = { display: "block", fontSize: 12.5, fontWeight: 500, color: "rgba(240,242,248,.42)", marginBottom: 6, letterSpacing: .4 };
const inp = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "11px 14px", color: "#f0f2f8", fontSize: 14, fontFamily: "Inter,sans-serif", boxSizing: "border-box", marginBottom: 14, outline: "none" };

export default function CoverLetterPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({ resumeText: "", jobTitle: "", company: "", extra: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const generate = async () => {
    if (!form.resumeText.trim()) { setError("Please paste your resume text."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const data = await api.post("/cover/generate", form, token);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(result.letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "28px 0" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f0f2f8", marginBottom: 4 }}>✉️ Cover Letter Generator</h2>
        <p style={{ color: "rgba(240,242,248,.4)", fontSize: 14 }}>AI writes a personalised cover letter tailored to the job and company</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <span style={label}>Job Title *</span>
          <input style={inp} placeholder="e.g. Software Engineer" value={form.jobTitle} onChange={set("jobTitle")} />
        </div>
        <div>
          <span style={label}>Company *</span>
          <input style={inp} placeholder="e.g. Google" value={form.company} onChange={set("company")} />
        </div>
      </div>

      <span style={label}>Your Resume Text *</span>
      <textarea rows={9} value={form.resumeText} onChange={set("resumeText")}
        placeholder="Paste your resume text here..."
        style={{ ...inp, resize: "vertical", lineHeight: 1.7, marginBottom: 14 }} />

      <span style={label}>Additional Context (optional)</span>
      <input style={inp} placeholder="e.g. I was referred by John Doe, I'm particularly interested in their AI team..." value={form.extra} onChange={set("extra")} />

      {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

      <button onClick={generate} disabled={loading}
        style={{ width: "100%", padding: "15px 0", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "Inter,sans-serif", opacity: loading ? .5 : 1 }}>
        {loading ? "✦  Writing your cover letter…" : "✦  Generate Cover Letter"}
      </button>

      {loading && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(139,92,246,.2)", borderTopColor: "#8b5cf6", margin: "0 auto 12px", animation: "spin .9s linear infinite" }} />
          <p style={{ color: "rgba(240,242,248,.35)", fontSize: 13 }}>Crafting your personalised letter…</p>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
          {/* Letter */}
          <div style={{ ...glass, borderColor: "rgba(99,102,241,.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: 1.8, textTransform: "uppercase", color: "rgba(240,242,248,.3)", marginBottom: 4 }}>Generated Cover Letter</div>
                {result.subject && <div style={{ fontSize: 13, color: "#a5b4fc" }}>📧 {result.subject}</div>}
              </div>
              <button onClick={copy}
                style={{ padding: "7px 16px", borderRadius: 10, border: "1px solid rgba(99,102,241,.3)", background: copied ? "rgba(34,211,165,.12)" : "rgba(99,102,241,.12)", color: copied ? "#22d3a5" : "#a5b4fc", fontSize: 13, cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all .2s" }}>
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
            <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "20px 22px", fontSize: 14, color: "rgba(240,242,248,.75)", lineHeight: 1.85, whiteSpace: "pre-wrap", fontFamily: "Georgia,serif" }}>
              {result.letter}
            </div>
          </div>

          {/* Tips */}
          {result.tips && (
            <div style={{ ...glass, background: "linear-gradient(135deg,rgba(245,158,11,.07),rgba(99,102,241,.06))", borderColor: "rgba(245,158,11,.2)" }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: 1.8, textTransform: "uppercase", color: "rgba(252,211,77,.5)", marginBottom: 12 }}>💡 Tips to Personalise Further</div>
              {result.tips.map((t,i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < result.tips.length-1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                  <span style={{ color: "#f59e0b", flexShrink: 0 }}>→</span>
                  <p style={{ fontSize: 13, color: "rgba(240,242,248,.6)", lineHeight: 1.5, margin: 0 }}>{t}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
