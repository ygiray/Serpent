import { useEffect, useState } from 'react';

// Walking skeleton: calls the backend health endpoint and shows the result.
export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Serpent – Child Development Platform</h1>
      {error && <p role="alert">Backend not reachable: {error}</p>}
      {!error && !health && <p>Connecting to backend…</p>}
      {health && (
        <p>
          Backend status: <strong>{health.status}</strong> ({health.app} v{health.version})
        </p>
      )}
    </main>
  );
}
