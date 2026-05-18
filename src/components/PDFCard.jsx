// src/components/PDFCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Individual PDF file card with open, download, and delete actions
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { usePDFs } from '../hooks/usePDFs';
import { formatFileSize, formatDate, truncateFilename, getFirebaseErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import { FileText, ExternalLink, Download, Trash2 } from 'lucide-react';

export default function PDFCard({ pdf }) {
  const { deletePDF } = usePDFs();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Open PDF in a new browser tab
  const handleOpen = () => {
    const openUrl = pdf.openURL || pdf.downloadURL;
    const a = document.createElement('a');
    a.href = openUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  // Trigger download via anchor click
  const handleDownload = async () => {
    try {
      const a = document.createElement('a');
      a.href = pdf.downloadURL;
      a.download = pdf.fileName;
      a.rel = 'noopener noreferrer';
      a.click();
      toast.success('Download started!');
    } catch {
      // Fallback: open in new tab if download fails
      window.location.assign(pdf.downloadURL);
    }
  };

  // Delete with confirmation
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Auto-cancel confirm after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading('Deleting file…');
    try {
      await deletePDF(pdf);
      toast.success('File deleted.', { id: toastId });
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err), { id: toastId });
      setIsDeleting(false);
    }
  };

  return (
    <div className={`pdf-card ${isDeleting ? 'deleting' : ''}`}>
      {/* File icon area */}
      <div className="pdf-card-icon">
        <FileText size={28} />
        <span className="pdf-badge">PDF</span>
      </div>

      {/* File info */}
      <div className="pdf-card-info">
        <h3 className="pdf-card-name" title={pdf.fileName}>
          {truncateFilename(pdf.fileName, 32)}
        </h3>
        <div className="pdf-card-meta">
          <span>{formatFileSize(pdf.fileSize)}</span>
          <span className="meta-dot">·</span>
          <span>{formatDate(pdf.createdAt)}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pdf-card-actions">
        <button
          className="card-btn open-btn"
          onClick={handleOpen}
          title="Open in browser"
          disabled={isDeleting}
        >
          <ExternalLink size={15} />
          <span>Open</span>
        </button>

        <button
          className="card-btn download-btn"
          onClick={handleDownload}
          title="Download file"
          disabled={isDeleting}
        >
          <Download size={15} />
          <span>Download</span>
        </button>

        <button
          className={`card-btn delete-btn ${confirmDelete ? 'confirm' : ''}`}
          onClick={handleDelete}
          title={confirmDelete ? 'Click again to confirm delete' : 'Delete file'}
          disabled={isDeleting}
        >
          <Trash2 size={15} />
          <span>{confirmDelete ? 'Confirm?' : 'Delete'}</span>
        </button>
      </div>

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="card-overlay">
          <div className="card-spinner" />
        </div>
      )}
    </div>
  );
}
