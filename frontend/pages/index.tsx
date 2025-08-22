import axios from 'axios';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function Home() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    axios.get(`${API}/api/health`).then(res => setHealth(res.data)).catch(() => setHealth({ status: 'error' }));
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>PSS Assessor MVP</h1>
      <p>Backend health: <strong>{health ? health.status : '...'}</strong></p>
      <p><a href="/assess">Go to assessment mock →</a></p>
    </main>
  );
}
