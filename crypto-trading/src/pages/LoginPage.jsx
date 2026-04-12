import { useState } from "react";
import { useApp } from "../context/AppContext";

function AuthLayout({ title, sub, children }) {
  const { navigate } = useApp();
  return (
    <div className="auth-wrap">
      <div className="auth-glow"/>
      {/* Subtle dot pattern */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize:"28px 28px",
        pointerEvents:"none",
      }}/>

      <div className="auth-logo" onClick={() => navigate("home")} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
        <div className="navbar-logo-icon">₿</div>
        <span className="navbar-wordmark" style={{ fontSize:20 }}>CryptoX</span>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">{title}</h2>
        <p className="auth-sub">{sub}</p>
        {children}
      </div>
    </div>
  );
}

function Field({ label, type="text", value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5, letterSpacing:"0.3px" }}>
        {label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/>
    </div>
  );
}

export function LoginPage() {
  const { login, navigate } = useApp();
  const [email, setEmail]   = useState("");
  const [pwd,   setPwd]     = useState("");
  const [err,   setErr]     = useState("");
  const [busy,  setBusy]    = useState(false);

  const go = async () => {
    setBusy(true); setErr("");
    await new Promise(r => setTimeout(r, 400));
    const res = login(email, pwd);
    if (!res.success) setErr(res.error);
    setBusy(false);
  };

  const handleKey = e => e.key === "Enter" && go();

  return (
    <AuthLayout title="Welcome back" sub="Log in to your CryptoX account">
      <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com"/>
      <Field label="Password" type="password" value={pwd} onChange={v => { setPwd(v); }} placeholder="••••••••"/>
      {err && <div className="auth-err">{err}</div>}

      <button
        className="btn btn-primary w-full"
        style={{ padding:13, fontSize:15, marginBottom:14 }}
        onClick={go}
        disabled={busy}
        onKeyDown={handleKey}
      >
        {busy ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }}/> Signing in…</> : "Log In"}
      </button>

      <div style={{ textAlign:"center", fontSize:13, color:"var(--text-muted)" }}>
        Don't have an account?{" "}
        <span style={{ color:"var(--gold)", cursor:"pointer", fontWeight:600 }} onClick={() => navigate("register")}>
          Sign Up
        </span>
      </div>

      <div className="auth-demo-box">
        <div className="auth-demo-title">Demo Credentials</div>
        <div style={{ marginBottom:3 }}>👤 User: user@demo.com / demo123</div>
        <div>⚡ Admin: admin@demo.com / admin123</div>
      </div>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register, navigate } = useApp();
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [pwd,   setPwd]   = useState("");
  const [conf,  setConf]  = useState("");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  const go = async () => {
    if (!name || !email || !pwd) { setErr("Please fill in all fields"); return; }
    if (pwd !== conf) { setErr("Passwords do not match"); return; }
    if (pwd.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setBusy(true); setErr("");
    await new Promise(r => setTimeout(r, 500));
    const res = register(name, email, pwd);
    if (!res.success) { setErr(res.error); setBusy(false); }
  };

  return (
    <AuthLayout title="Create Account" sub="Join CryptoX and start trading today">
      <Field label="Full Name" value={name} onChange={setName} placeholder="Alex Johnson"/>
      <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com"/>
      <Field label="Password" type="password" value={pwd} onChange={setPwd} placeholder="Min. 6 characters"/>
      <Field label="Confirm Password" type="password" value={conf} onChange={setConf} placeholder="Repeat password"/>
      {err && <div className="auth-err">{err}</div>}

      <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:14, padding:"10px 12px", background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8 }}>
        🎁 You'll receive <strong style={{ color:"var(--green)" }}>$10,000 USDT</strong> demo balance on signup
      </div>

      <button
        className="btn btn-primary w-full"
        style={{ padding:13, fontSize:15, marginBottom:14 }}
        onClick={go}
        disabled={busy}
      >
        {busy ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }}/> Creating account…</> : "Create Account"}
      </button>

      <div style={{ textAlign:"center", fontSize:13, color:"var(--text-muted)" }}>
        Already have an account?{" "}
        <span style={{ color:"var(--gold)", cursor:"pointer", fontWeight:600 }} onClick={() => navigate("login")}>
          Log In
        </span>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;