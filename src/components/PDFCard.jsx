// src/components/PDFCard.jsx
import { useMemo, useState } from 'react';
import { usePDFs } from '../hooks/usePDFs';
import { formatFileSize, formatDate, truncateFilename, getFirebaseErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import { FileText, ExternalLink, Download, Trash2 } from 'lucide-react';

export default function PDFCard({ pdf }) {
  const { deletePDF } = usePDFs();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const activity = useMemo(() => {
    const sizeSeed = pdf?.fileSize || 0;
    return Math.min(94, Math.max(36, 40 + Math.round(sizeSeed / 250000)));
  }, [pdf?.fileSize]);

  const handleOpen = () => {
    const openUrl = pdf.openURL || pdf.downloadURL;
    const anchor = document.createElement('a');
    anchor.href = openUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.click();
  };

  const handleDownload = async () => {
    try {
      const anchor = document.createElement('a');
      anchor.href = pdf.downloadURL;
      anchor.download = pdf.fileName;
      anchor.rel = 'noopener noreferrer';
      anchor.click();
      toast.success('Download started!');
    } catch {
      window.location.assign(pdf.downloadURL);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading('Deleting file…');

    try {
      await deletePDF(pdf);
      toast.success('File deleted.', { id: toastId });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error), { id: toastId });
      setIsDeleting(false);
    }
  };

  return (
    <article className={`pdf-card pdf-card--obsidian ${isDeleting ? 'deleting' : ''}`}>
      <div className="pdf-card-main">
        <div className="pdf-card-icon pdf-card-icon--obsidian">
          <FileText size={24} />
        </div>

        <div className="pdf-card-info">
          <h3 className="pdf-card-name" title={pdf.fileName}>
            {truncateFilename(pdf.fileName, 34)}
          </h3>
          <div className="pdf-card-meta">
            <span>SIZE: {formatFileSize(pdf.fileSize)}</span>
            <span className="meta-dot">|</span>
            <span>{formatDate(pdf.createdAt)}</span>
          </div>
          <div className="pdf-card-status-row">
            <span className="pdf-status-tag">VERIFIED</span>
            <div className="pdf-meter" aria-hidden="true">
              <span className="pdf-meter-fill" style={{ width: `${activity}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="pdf-card-actions">
        <button className="card-icon-btn" onClick={handleOpen} title="Open in browser" disabled={isDeleting}>
          <ExternalLink size={16} />
        </button>
        <button className="card-icon-btn" onClick={handleDownload} title="Download file" disabled={isDeleting}>
          <Download size={16} />
        </button>
        <button
          className={`card-icon-btn danger ${confirmDelete ? 'confirm' : ''}`}
          onClick={handleDelete}
          title={confirmDelete ? 'Click again to confirm delete' : 'Delete file'}
          disabled={isDeleting}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {isDeleting && (
        <div className="card-overlay">
          <div className="card-spinner" />
        </div>
      )}
    </article>
  );
}
