// src/components/UploadZone.jsx
import { useState, useRef, useCallback } from 'react';
import { usePDFs } from '../hooks/usePDFs';
import toast from 'react-hot-toast';
import { getFirebaseErrorMessage } from '../utils/helpers';
import { FileUp, FileText } from 'lucide-react';

export default function UploadZone() {
  const { uploadPDF, uploadProgress } = usePDFs();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed.');
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 20MB.');
        return;
      }

      setIsUploading(true);
      const toastId = toast.loading(`Uploading "${file.name}"…`);

      try {
        await uploadPDF(file);
        toast.success(`"${file.name}" uploaded successfully!`, { id: toastId });
      } catch (error) {
        toast.error(getFirebaseErrorMessage(error), { id: toastId });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [uploadPDF],
  );

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  return (
    <div className="upload-zone-wrap">
      <div
        className={`upload-zone upload-zone--obsidian ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === 'Enter' && !isUploading && fileInputRef.current?.click()}
        aria-label="Upload PDF file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden-input"
          onChange={(event) => handleFile(event.target.files[0])}
          disabled={isUploading}
        />

        <div className="upload-zone-inner">
          <div className={`upload-icon upload-icon--obsidian ${isDragging ? 'bounce' : ''} ${isUploading ? 'uploading-pulse' : ''}`}>
            {isUploading ? <FileText size={34} /> : <FileUp size={34} />}
          </div>

          <h2 className="upload-title">
            {isUploading ? 'INITIALIZING TRANSFER' : 'INITIALIZE UPLOAD'}
          </h2>

          <p className="upload-hint upload-hint--obsidian">
            {isDragging
              ? 'Drop data stream here'
              : 'Drop PDF data stream here or click to browse'}
          </p>

          {!isUploading && (
            <p className="upload-subhint">Max size: 20MB · Secure cloud pipeline</p>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="progress-wrap progress-wrap--obsidian">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${uploadProgress ?? 0}%` }} />
          </div>
          <span className="progress-label">{uploadProgress ?? 0}%</span>
        </div>
      )}
    </div>
  );
}
