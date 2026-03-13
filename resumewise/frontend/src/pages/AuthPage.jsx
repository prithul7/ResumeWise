import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const S = {
  page: { minHeight: "100vh", background: "#07090f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", padding: 20 },
  card: { width: "100%", maxWidth: 420, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 20, padding: "36px 32px", backdropFilter: "blur(12px)" },
  logo: { textAlign: "center", marginBottom: 28 },
  logoIcon: { width: 48, height: 48, borderRadius: 13, background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px", boxShadow: "0 4px 24px rgba(99,102,241,.4)" },
  title: { fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg,#818cf8,#c084fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sub: { fontSize: 13, color: "rgba(240,242,248,.38)", marginTop: 4 },
  tabs: { display: "flex", background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 4, marginBottom: 24 },
  tabBtn: (active) => ({ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, transition: "all .2s", background: active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent", color: active ? "#fff" : "rgba(240,242,248,.4)" }),
  label: { display: "block", fontSize: 12.5, fontWeight: 500, color: "rgba(240,242,248,.45)", marginBottom: 6, letterSpacing: .5 },
  input: { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "11px 14px", color: "#f0f2f8", fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none", marginBottom: 16, boxSizing: "border-box" },
  btn: { width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Inter',sans-serif", marginTop: 4, transition: "all .3s" },
  err: { background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 14 },
};

export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const data = await api.post(endpoint, body);
      login(data.token, data.user);
      onSuccess?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@800&display=swap'); input:focus{border-color:rgba(99,102,241,.5)!important;background:rgba(99,102,241,.05)!important;}`}</style>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>✦</div>
          <div style={S.title}>ResumeWise</div>
          <div style={S.sub}>AI Resume Advisor &amp; Opportunity Engine</div>
        </div>
        <div style={S.tabs}>
          <button style={S.tabBtn(mode === "login")}  onClick={() => { setMode("login");  setError(""); }}>Login</button>
          <button style={S.tabBtn(mode === "signup")} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button>
        </div>
        {error && <div style={S.err}>⚠️ {error}</div>}
        {mode === "signup" && (
          <>
            <label style={S.label}>Full Name</label>
            <input style={S.input} placeholder="Priya Sharma" value={form.name} onChange={set("name")} />
          </>
        )}
        <label style={S.label}>Email Address</label>
        <input style={S.input} type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} />
        <label style={S.label}>Password</label>
        <input style={S.input} type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && submit()} />
        <button style={S.btn} onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Login to ResumeWise" : "Create Account"}
        </button>
      </div>
    </div>
  );
}
