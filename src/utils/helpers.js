// src/utils/helpers.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared utility functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format bytes to a human-readable string
 * @param {number} bytes
 * @returns {string} e.g. "2.4 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format a Date object to a readable string
 * @param {Date} date
 * @returns {string} e.g. "May 17, 2026"
 */
export function formatDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Truncate a filename to a max character count, preserving extension
 * @param {string} name
 * @param {number} max
 * @returns {string}
 */
export function truncateFilename(name, max = 30) {
  if (name.length <= max) return name;
  const ext = name.lastIndexOf('.') !== -1 ? name.slice(name.lastIndexOf('.')) : '';
  const base = name.slice(0, max - ext.length - 3);
  return `${base}...${ext}`;
}

/**
 * Get initials from a display name or email
 * @param {string} nameOrEmail
 * @returns {string} e.g. "JD"
 */
export function getInitials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nameOrEmail.slice(0, 2).toUpperCase();
}

/**
 * Map Firebase error codes to friendly messages
 * @param {Error} error - Firebase error object
 * @returns {string}
 */
export function getFirebaseErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'storage/unauthorized': 'You do not have permission to access this file.',
    'storage/quota-exceeded': 'Storage quota exceeded.',
    'storage/unknown': 'An unknown storage error occurred.',
  };
  return messages[error?.code] || error?.message || 'An unexpected error occurred.';
}
