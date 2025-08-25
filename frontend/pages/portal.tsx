import { useEffect, useState } from "react";
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
    setReportLink(`/api/reports/download_file?path=${encodeURIComponent(data.file_path)}`);
  };

  if (!token) {
    return (
      <main className="page">
        <div className="card" style={{maxWidth: 680, margin:"60px auto"}}>
          <h2>Not signed in</h2>
          <p className="kbd">Please <a href="/login">log in</a> to continue.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="header">
        <div className="brand">Assessor</div>
        <div className="kbd" style={{display:"flex", alignItems:"center", gap:12}}>
          <span>{user?.email}</span>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
        <section className="card">
          <h3 style={{marginTop:0}}>1) New Assessment</h3>
          <div className="grid" style={{gridTemplateColumns:"120px 1fr", alignItems:"center"}}>
            <label className="kbd">Client ID</label>
            <input className="input" type="number" value={clientId} onChange={e=>setClientId(Number(e.target.value))} />
            <label className="kbd">Framework</label>
            <select className="select" value={framework} onChange={e=>setFramework(e.target.value)}>
              <option value="iso27001_2022">ISO 27001:2022</option>
              <option value="soc2_security">SOC 2 Security</option>
            </select>
          </div>
          <div style={{marginTop:12, display:"flex", gap:8}}>
            <button className="btn" onClick={startAssessment}>Create</button>
            {assessmentId && <span className="kbd">Current assessment: #{assessmentId}</span>}
          </div>
        </section>

        <section className="card">
          <h3 style={{marginTop:0}}>3) Summary & Backlog</h3>
          {summary ? (
            <>
              <p><b>Avg maturity (weighted):</b> {summary.avg_maturity.toFixed(2)}</p>
              <p><b>Top gaps:</b> {summary.top_gaps.join(", ") || "—"}</p>
              <div className="card" style={{marginTop:10}}>
                <table style={{width:"100%"}}>
                  <thead>
                    <tr><th align="left">Control/Question</th><th align="left">Priority</th></tr>
                  </thead>
                  <tbody>
                    {backlog.map((i) => (
                      <tr key={i.qid}><td>{i.qid}</td><td>{i.priority_score.toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : <p className="kbd">No summary yet. Click “Refresh Summary”.</p>}
        </section>
      </div>

      <section className="card" style={{marginTop:16}}>
        <h3 style={{marginTop:0}}>2) Answer Questions</h3>
        {!assessmentId && <p className="kbd">Create an assessment first.</p>}
        {assessmentId && (
          <>
            <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
              {questions.map(q => (
                <div key={q.id} className="card">
                  <div style={{fontWeight:600, marginBottom:8}}>{q.text}</div>
                  <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                    {[0,1,2,3,4].map(m => (
                      <button
                        key={m}
                        className="btn"
                        onClick={()=>setAnswers({...answers, [q.id]: m})}
                        style={{
                          background: answers[q.id]===m
                            ? "linear-gradient(90deg, rgba(52,211,153,.25), rgba(167,139,250,.25))"
                            : undefined
                        }}
                      >
                        {["No","Planned","Partially","Implemented","Optimized"][m]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12}}>
              <button className="btn" onClick={submitAnswers}>Save Answers</button>
              <button className="btn" onClick={refreshSummary} style={{marginLeft:8}}>Refresh Summary</button>
            </div>
          </>
        )}
      </section>

      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", marginTop:16}}>
        <section className="card">
          <h3 style={{marginTop:0}}>4) Evidence Upload</h3>
          <input className="input" type="file" onChange={(e)=> e.target.files?.[0] && uploadEvidence(e.target.files[0])} />
          {uploadMsg && <p className="kbd" style={{marginTop:8}}>{uploadMsg}</p>}
        </section>

        <section className="card">
          <h3 style={{marginTop:0}}>5) Generate Report</h3>
          <button className="btn" onClick={generateReport} disabled={!assessmentId}>Generate DOCX</button>
          {reportLink && (
            <p className="kbd" style={{marginTop:8}}>
              Report ready: <a href={reportLink}>Download</a>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
