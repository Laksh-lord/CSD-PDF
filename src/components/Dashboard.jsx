// src/components/Dashboard.jsx
import { useMemo, useState } from 'react';
import { usePDFs } from '../hooks/usePDFs';
import Navbar from './Navbar';
import UploadZone from './UploadZone';
import PDFCard from './PDFCard';
import SearchBar from './SearchBar';
import { FileText, Layers3, Sparkles } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

export default function Dashboard() {
  const { pdfs, loading } = usePDFs();
  const [search, setSearch] = useState('');

  const filteredPDFs = useMemo(() => {
    if (!search.trim()) return pdfs;
    const query = search.toLowerCase();
    return pdfs.filter((pdf) => pdf.fileName.toLowerCase().includes(query));
  }, [pdfs, search]);

  const totalSize = pdfs.reduce((total, pdf) => total + (pdf.fileSize || 0), 0);

  return (
    <div className="app-layout app-layout--obsidian">
      <Navbar />

      <main className="dashboard-shell">
        <section className="hero-panel">
          <div className="system-pill">SYSTEM STATUS: OPERATIONAL</div>
          <h1 className="hero-title">
            CSD<span>PDF</span>
          </h1>
          <p className="hero-copy">
            A dark command center for storing, previewing, and shipping PDFs at speed.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <FileText size={14} />
              <span>{pdfs.length} {pdfs.length === 1 ? 'file' : 'files'}</span>
            </div>
            <div className="hero-stat">
              <Layers3 size={14} />
              <span>{formatFileSize(totalSize)} buffered</span>
            </div>
            <div className="hero-stat hero-stat--accent">
              <Sparkles size={14} />
              <span>neon workspace</span>
            </div>
          </div>
        </section>

        <section className="upload-panel">
          <UploadZone />
        </section>

        <section className="files-panel">
          <div className="files-panel-header">
            <div>
              <h2 className="section-title">ACTIVE DATA STREAMS</h2>
              <p className="section-caption">Browse stored PDFs and keep your pipeline moving.</p>
            </div>

            {pdfs.length > 0 && <SearchBar value={search} onChange={setSearch} />}
          </div>

          {loading && (
            <div className="pdf-stack">
              {[1, 2, 3].map((index) => (
                <div key={index} className="pdf-card skeleton">
                  <div className="pdf-card-icon skeleton-icon" />
                  <div className="pdf-card-info">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                  <div className="skeleton-actions">
                    <div className="skeleton-chip" />
                    <div className="skeleton-chip" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && pdfs.length === 0 && (
            <div className="empty-state empty-state--obsidian">
              <div className="empty-icon">
                <FileText size={44} />
              </div>
              <h3>No streams yet</h3>
              <p>Drop your first PDF into the command zone to bring the buffer online.</p>
            </div>
          )}

          {!loading && pdfs.length > 0 && filteredPDFs.length === 0 && (
            <div className="empty-state empty-state--obsidian">
              <div className="empty-icon">
                <Sparkles size={44} />
              </div>
              <h3>No matches found</h3>
              <p>No PDFs matched “{search}”.</p>
            </div>
          )}

          {!loading && filteredPDFs.length > 0 && (
            <div className="pdf-stack">
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
