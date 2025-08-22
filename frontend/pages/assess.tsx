import axios from 'axios';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

type Question = {
  id: number;
  qid: string;
  text: string;
  help?: string;
  answers: string[];
  weight: number;
  iso_refs: string[];
  soc2_refs: string[];
  evidence_required: boolean;
}

export default function Assess() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    axios.get(`${API}/api/questions`).then(res => setQuestions(res.data));
    axios.post(`${API}/api/tenants/bootstrap`).catch(()=>{});
  }, []);

  const q = questions[idx];

  const next = () => setIdx(i => Math.min(i + 1, questions.length - 1));
  const prev = () => setIdx(i => Math.max(i - 1, 0));

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h2>Assessment (Mock)</h2>
      {q ? (
        <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, marginTop: 16 }}>
          <div style={{ marginBottom: 8, opacity: 0.7 }}>
            {idx + 1} / {questions.length}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{q.text}</div>
          {q.help && <div style={{ fontSize: 14, marginBottom: 12 }}>{q.help}</div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {q.answers.map(a => (
              <button
                key={a}
                onClick={() => setAnswers({ ...answers, [q.qid]: a })}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', background: answers[q.qid]===a ? '#eee' : 'white' }}
              >
                {a}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={prev} disabled={idx===0}>Back</button>
            <button onClick={next} disabled={idx===questions.length-1}>Next</button>
          </div>
        </div>
      ) : (
        <p>Loading questions…</p>
      )}
    </main>
  );
}
