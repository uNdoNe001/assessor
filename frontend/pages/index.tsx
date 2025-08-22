// frontend/pages/index.tsx
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Home() {
  const [health, setHealth] = useState<{status?: string} | null>(null);

  useEffect(() => {
    axios.get('/api/health')               // <— relative path (uses Next rewrite)
      .then(res => setHealth(res.data))
      .catch(() => setHealth({ status: 'error' }));
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Assessor MVP</h1>
      <p>Backend health: <strong>{health ? health.status : '...'}</strong></p>
      <p><a href="/assess">Go to assessment mock →</a></p>
    </main>
  );
}
