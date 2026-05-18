// src/context/ThemeContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Manages dark/light mode preference with localStorage persistence
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export function ThemeProvider({ children }) {
  // Initialize from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('pdfvault-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply theme class to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pdfvault-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
