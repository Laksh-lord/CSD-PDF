// src/components/Dashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Main app dashboard: upload zone + PDF grid + search
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import { usePDFs } from '../hooks/usePDFs';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import UploadZone from './UploadZone';
import PDFCard from './PDFCard';
import SearchBar from './SearchBar';
import { FileText, FolderOpen } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

export default function Dashboard() {
  const { pdfs, loading } = usePDFs();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Filter PDFs by search query
  const filteredPDFs = useMemo(() => {
    if (!search.trim()) return pdfs;
    const q = search.toLowerCase();
    return pdfs.filter((p) => p.fileName.toLowerCase().includes(q));
  }, [pdfs, search]);

  // Stats
  const totalSize = pdfs.reduce((acc, p) => acc + (p.fileSize || 0), 0);

  return (
    <div className="app-layout">
      <Navbar />

      <main className="dashboard">
        {/* Welcome header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              My Vault
            </h1>
            <p className="dashboard-subtitle">
              {user?.displayName
                ? `Welcome, ${user.displayName.split(' ')[0]}!`
                : 'Manage your PDFs securely in the cloud.'}
            </p>
          </div>

          {/* Stats chips */}
          <div className="stats-row">
            <div className="stat-chip">
              <FileText size={14} />
              <span>{pdfs.length} {pdfs.length === 1 ? 'file' : 'files'}</span>
            </div>
            {pdfs.length > 0 && (
              <div className="stat-chip">
                <span>{formatFileSize(totalSize)} used</span>
              </div>
            )}
          </div>
        </div>

        {/* Upload zone */}
        <section className="upload-section">
          <UploadZone />
        </section>

        {/* Files section */}
        <section className="files-section">
          <div className="files-header">
            <h2 className="section-title">Your Files</h2>
            {pdfs.length > 0 && (
              <SearchBar value={search} onChange={setSearch} />
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="pdf-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="pdf-card skeleton">
                  <div className="skeleton-icon" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && pdfs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <FolderOpen size={48} />
              </div>
              <h3>No PDFs yet</h3>
              <p>Upload your first PDF to get started.</p>
            </div>
          )}

          {/* No search results */}
          {!loading && pdfs.length > 0 && filteredPDFs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <FileText size={48} />
              </div>
              <h3>No results found</h3>
              <p>No PDFs match "{search}"</p>
            </div>
          )}

          {/* PDF grid */}
          {!loading && filteredPDFs.length > 0 && (
            <div className="pdf-grid">
              {filteredPDFs.map((pdf) => (
                <PDFCard key={pdf.id} pdf={pdf} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
