// src/components/SearchBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PDF search/filter input
// ─────────────────────────────────────────────────────────────────────────────

import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder="Search your PDFs…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search PDFs"
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
