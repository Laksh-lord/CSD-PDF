// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Provides authentication state throughout the app
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';

// Create context
const AuthContext = createContext(null);

// Custom hook for easy access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(false);
        return;
      }

      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Anonymous sign-in failed:', error);
        setLoading(false);
      }
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  // Sign up with email/password
  const signup = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Set the user's display name
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result;
  };

  // Sign in with email/password
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // Sign in with Google
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Sign out
  const logout = () => signOut(auth);

  const value = { user, loading, signup, login, loginWithGoogle, logout };

  // Don't render children until auth state is determined
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
