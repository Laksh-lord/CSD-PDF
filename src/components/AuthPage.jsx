// src/components/AuthPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Login / Sign-up page with Google OAuth option
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFirebaseErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Eye, EyeOff, FileText } from 'lucide-react';

export default function AuthPage() {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await signup(form.email, form.password, form.name);
        toast.success('Account created! Welcome to csd.');
      }
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel - branding */}
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="brand-logo-wrap">
            <FileText size={40} />
          </div>
          <h1 className="brand-name">csd</h1>
          <p className="brand-tagline">
            Your secure cloud storage for PDFs.<br />
            Access your documents from anywhere, on any device.
          </p>
          <div className="brand-features">
            {['Encrypted cloud storage', 'Instant browser preview', 'Access from any device'].map((f) => (
              <div key={f} className="brand-feature">
                <span className="brand-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="auth-brand-decoration">
          <div className="deco-circle deco-1" />
          <div className="deco-circle deco-2" />
          <div className="deco-circle deco-3" />
        </div>
      </div>

      {/* Right panel - form */}
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
            <p>{mode === 'login' ? 'Sign in to your vault' : 'Start storing your PDFs securely'}</p>
          </div>

          {/* Google Sign In */}
          <button className="btn-google" onClick={handleGoogle} disabled={isLoading}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider"><span>or</span></div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required={mode === 'signup'}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={isLoading}>
              {isLoading
                ? <span className="btn-spinner" />
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              className="link-btn"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
