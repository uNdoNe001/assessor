import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("owner@pss.local");
  const [name, setName] = useState("PSS Owner");
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
    <main style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 420, margin: "40px auto" }}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      {mode === "register" && (
        <div>
          <label>Name</label><br />
          <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%"}} />
        </div>
      )}
      <div style={{marginTop:12}}>
        <label>Email</label><br />
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%"}} />
      </div>
      <div style={{marginTop:12}}>
        <label>Password</label><br />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:"100%"}} />
      </div>
      {err && <p style={{color:"crimson"}}>{err}</p>}
      <div style={{marginTop:16, display:"flex", gap:8}}>
        <button onClick={go}>{mode === "login" ? "Login" : "Register"}</button>
        <button onClick={()=>setMode(mode==="login"?"register":"login")} type="button">
          {mode === "login" ? "Switch to Register" : "Switch to Login"}
        </button>
      </div>
    </main>
  );
}
