// src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Root app component — renders auth page or dashboard based on login state
// ─────────────────────────────────────────────────────────────────────────────

import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';

export default function App() {

  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
          },
          success: {
            iconTheme: { primary: 'var(--accent)', secondary: 'var(--bg)' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'var(--bg)' },
          },
        }}
      />

      <Dashboard />
    </>
  );
}
