import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("owner@assessor.local");
  const [name, setName] = useState("Owner");
  const [password, setPassword] = useState("ChangeMe!");
  const [mode, setMode] = useState<"login"|"register">("login");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const go = async () => {
    try {
      setErr(null);
      if (mode === "login") await login(email, password);
      else await register(email, name, password);
      router.push("/portal");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Auth failed");
    }
  };

  return (
    <main className="page">
      <header className="header">
        <div className="brand">Assessor</div>
      </header>

      <div className="card" style={{maxWidth: 520, margin: "30px auto"}}>
        <h2 style={{margin: 0}}>Welcome</h2>
        <p style={{marginTop: 6, color: "var(--muted)"}}>
          {mode === "login" ? "Log in to your workspace." : "Create your account."}
        </p>

        {mode === "register" && (
          <div style={{marginTop: 14}}>
            <label className="kbd">Name</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} />
          </div>
        )}
        <div style={{marginTop: 14}}>
          <label className="kbd">Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div style={{marginTop: 14}}>
          <label className="kbd">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {err && <p style={{color:"salmon", marginTop: 10}}>{err}</p>}

        <div style={{marginTop: 16, display:"flex", gap:10}}>
          <button className="btn" onClick={go}>{mode === "login" ? "Login" : "Register"}</button>
          <button className="btn" onClick={()=>setMode(mode==="login"?"register":"login")} type="button">
            {mode === "login" ? "Switch to Register" : "Switch to Login"}
          </button>
        </div>
      </div>
    </main>
  );
}
