import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    setStatus('GSD UI initialized');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold">GSD UI</h1>
      <p className="text-muted-foreground mt-2">Status: {status}</p>
    </div>
  );
}

export default App;
