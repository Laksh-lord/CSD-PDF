// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase configuration and service initialization
// Replace the firebaseConfig values with your own from the Firebase Console
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function hasValidFirebaseConfig() {
  const values = Object.values(firebaseConfig).map((v) => (v || '').trim());
  if (values.some((v) => !v)) return false;
  if (values.some((v) => v.includes('your_'))) return false;
  if (firebaseConfig.messagingSenderId === '123456789012') return false;
  if ((firebaseConfig.appId || '').includes('abcdef1234567890')) return false;
  return true;
}

const shouldInitFirebase = !USE_SUPABASE && hasValidFirebaseConfig();
const app = shouldInitFirebase ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;
export const db = app ? getFirestore(app) : null;

export default app;
