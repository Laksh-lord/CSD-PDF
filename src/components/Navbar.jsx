// src/components/Navbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Top navigation bar with user info, theme toggle, and logout
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';
import { FileText, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  const displayName = user?.displayName || user?.email || 'User';
  const initials = getInitials(displayName);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-brand">
        <FileText size={22} className="navbar-logo-icon" />
        <span className="navbar-logo-text">csd</span>
      </div>

      {/* Right controls */}
      <div className="navbar-right">
        {/* Theme toggle */}
        <button
          className="icon-btn theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User dropdown */}
        <div className="user-menu-wrap">
          <button
            className="user-menu-trigger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={displayName} className="user-avatar-img" />
            ) : (
              <div className="user-avatar">{initials}</div>
            )}
            <span className="user-name">{user?.displayName || 'Account'}</span>
            <ChevronDown size={14} className={`chevron ${menuOpen ? 'open' : ''}`} />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop to close menu */}
              <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <strong>{user?.displayName || 'User'}</strong>
                  <span>{user?.email}</span>
                </div>
                <hr className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
