// src/components/UploadZone.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Drag & drop file upload area with progress bar
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react';
import { usePDFs } from '../hooks/usePDFs';
import toast from 'react-hot-toast';
import { getFirebaseErrorMessage } from '../utils/helpers';
import { UploadCloud, File } from 'lucide-react';

export default function UploadZone() {
  const { uploadPDF, uploadProgress } = usePDFs();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Process the selected file
  const handleFile = useCallback(async (file) => {
    if (!file) return;

    // Validate PDF
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }

    // Validate size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 20MB.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading "${file.name}"…`);

    try {
      await uploadPDF(file);
      toast.success(`"${file.name}" uploaded successfully!`, { id: toastId });
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err), { id: toastId });
    } finally {
      setIsUploading(false);
      // Reset file input so same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [uploadPDF]);

  // Drag event handlers
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  return (
    <div className="upload-zone-wrap">
      {/* Drop area */}
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !isUploading && fileInputRef.current?.click()}
        aria-label="Upload PDF file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden-input"
          onChange={onFileChange}
          disabled={isUploading}
        />

        <div className="upload-zone-inner">
          {isUploading ? (
            <>
              <div className="upload-icon uploading-pulse">
                <File size={36} />
              </div>
              <p className="upload-label">Uploading…</p>
              <p className="upload-hint">{uploadProgress ?? 0}% complete</p>
            </>
          ) : (
            <>
              <div className={`upload-icon ${isDragging ? 'bounce' : ''}`}>
                <UploadCloud size={36} />
              </div>
              <p className="upload-label">
                {isDragging ? 'Drop your PDF here' : 'Drag & drop a PDF'}
              </p>
              <p className="upload-hint">
                or <span className="upload-browse">browse files</span> · Max 20MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Progress bar (shown during upload) */}
      {isUploading && (
        <div className="progress-wrap">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${uploadProgress ?? 0}%` }}
            />
          </div>
          <span className="progress-label">{uploadProgress ?? 0}%</span>
        </div>
      )}
    </div>
  );
}
