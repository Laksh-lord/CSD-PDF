// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase configuration and service initialization
// Replace the firebaseConfig values with your own from the Firebase Console
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your Firebase project configuration
// These values come from your .env file (see .env.example)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export individual Firebase services
export const auth = getAuth(app);       // Authentication
export const storage = getStorage(app); // File Storage
export const db = getFirestore(app);    // Firestore Database (for metadata)

export default app;
