import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Question = { id:number; qid:string; text:string; answers:string[]; weight:number; evidence_required:boolean };
type Summary = { assessment_id:number; avg_maturity:number; top_gaps:string[] };

export default function Portal() {
  const { user, token, logout } = useAuth();
  const [clientId, setClientId] = useState(1);
  const [framework, setFramework] = useState("iso27001_2022");
  const [assessmentId, setAssessmentId] = useState<number | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  const [backlog, setBacklog] = useState<{qid:string; priority_score:number}[]>([]);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [reportLink, setReportLink] = useState<string | null>(null);
  const authed = Boolean(token);

  useEffect(() => { api.post(`/api/tenants/bootstrap`).catch(()=>{}); }, []);
  useEffect(() => { api.get(`/api/questions`).then(r => setQuestions(r.data)); }, []);

  const startAssessment = async () => {
    const { data } = await api.post(`/api/assessments`, { client_id: clientId, framework });
    setAssessmentId(data.assessment_id);
    setSummary(null); setBacklog([]);
  };

  const submitAnswers = async () => {
    if (!assessmentId) return;
    const payload = Object.entries(answers).map(([qid, maturity]) => ({
      question_id: Number(qid),
      maturity: Number(maturity),
      risk_impact: 3, risk_likelihood: 3
    }));
    await api.post(`/api/assessments/${assessmentId}/answers`, payload);
  };

  const refreshSummary = async () => {
    if (!assessmentId) return;
    const s = await api.get(`/api/assessments/${assessmentId}/summary`);
    setSummary(s.data);
    const bl = await api.get(`/api/assessments/${assessmentId}/backlog`);
    setBacklog(bl.data.items);
  };

  const uploadEvidence = async (file: File) => {
    const form = new FormData();
    form.append("client_id", String(clientId));
    form.append("file", file);
    const { data } = await api.post(`/api/evidence/upload`, form);
    setUploadMsg(`Uploaded evidence id=${data.evidence_id}`);
  };

  const generateReport = async () => {
    if (!assessmentId) return;
    const { data } = await api.post(`/api/reports/generate?client_id=${clientId}&assessment_id=${assessmentId}`);
    // Add a lightweight download route (see backend patch below)
    setReportLink(`/api/reports/download_file?path=${encodeURIComponent(data.file_path)}`);
  };

  if (!authed) {
    return (
      <main style={{ fontFamily:"sans-serif", padding:24 }}>
        <p>You’re not logged in. <a href="/login">Go to login →</a></p>
      </main>
    );
  }

  return (
    <main style={{ fontFamily:"sans-serif", padding:24, maxWidth:1000, margin:"0 auto" }}>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>PSS Assessor Portal</h2>
        <div>
          <span style={{marginRight:12}}>{user?.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section style={{marginTop:24, padding:16, border:"1px solid #ddd", borderRadius:12}}>
        <h3>1) New Assessment</h3>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <label>Client ID:</label>
          <input type="number" value={clientId} onChange={e=>setClientId(Number(e.target.value))} />
          <label>Framework:</label>
          <select value={framework} onChange={e=>setFramework(e.target.value)}>
            <option value="iso27001_2022">ISO 27001:2022</option>
            <option value="soc2_security">SOC 2 Security</option>
          </select>
          <button onClick={startAssessment}>Create</button>
          {assessmentId && <span>Current assessment: #{assessmentId}</span>}
        </div>
      </section>

      <section style={{marginTop:24, padding:16, border:"1px solid #ddd", borderRadius:12}}>
        <h3>2) Answer Questions</h3>
        {!assessmentId && <p>Create an assessment first.</p>}
        {assessmentId && (
          <>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              {questions.map(q => (
                <div key={q.id} style={{border:"1px solid #eee", borderRadius:10, padding:12}}>
                  <div style={{fontWeight:600, marginBottom:8}}>{q.text}</div>
                  <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                    {[0,1,2,3,4].map(m => (
                      <button
                        key={m}
                        onClick={()=>setAnswers({...answers, [q.id]: m})}
                        style={{padding:"6px 10px", border:"1px solid #ccc", borderRadius:8, background: answers[q.id]===m ? "#eee" : "white"}}
                      >
                        {["No","Planned","Partially","Implemented","Optimized"][m]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12}}>
              <button onClick={submitAnswers}>Save Answers</button>
              <button onClick={refreshSummary} style={{marginLeft:8}}>Refresh Summary</button>
            </div>
          </>
        )}
      </section>

      <section style={{marginTop:24, padding:16, border:"1px solid #ddd", borderRadius:12}}>
        <h3>3) Summary & Backlog</h3>
        {summary ? (
          <>
            <p><b>Avg maturity (weighted):</b> {summary.avg_maturity.toFixed(2)}</p>
            <p><b>Top gaps:</b> {summary.top_gaps.join(", ") || "—"}</p>
            <h4>Prioritized backlog</h4>
            <table>
              <thead><tr><th>Control/Question</th><th>Priority</th></tr></thead>
              <tbody>
                {backlog.map((i) => (
                  <tr key={i.qid}><td>{i.qid}</td><td>{i.priority_score.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        ) : <p>No summary yet. Click “Refresh Summary”.</p>}
      </section>

      <section style={{marginTop:24, padding:16, border:"1px solid #ddd", borderRadius:12}}>
        <h3>4) Evidence Upload</h3>
        <input type="file" onChange={(e)=> e.target.files?.[0] && uploadEvidence(e.target.files[0])} />
        {uploadMsg && <p>{uploadMsg}</p>}
      </section>

      <section style={{marginTop:24, padding:16, border:"1px solid #ddd", borderRadius:12}}>
        <h3>5) Generate Report</h3>
        <button onClick={generateReport} disabled={!assessmentId}>Generate DOCX</button>
        {reportLink && (
          <p>
            Report ready: <a href={reportLink}>Download</a>
          </p>
        )}
      </section>
    </main>
  );
}
