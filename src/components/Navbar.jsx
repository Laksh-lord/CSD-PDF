// src/components/Navbar.jsx
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

  const displayName = user?.displayName || user?.email || 'Account';
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  return (
    <nav className="navbar navbar--obsidian">
      <div className="navbar-brand">
        <div className="navbar-logo-mark">
          <FileText size={18} className="navbar-logo-icon" />
        </div>
        <div className="navbar-brand-copy">
          <span className="navbar-logo-text">csdpdf</span>
          <span className="navbar-logo-subtext">obsidian flux</span>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="icon-btn icon-btn--ghost theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="user-menu-wrap">
          <button
            className="user-menu-trigger"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={displayName} className="user-avatar-img" />
            ) : (
              <div className="user-avatar">{initials}</div>
            )}
            <span className="user-name">{user?.displayName || 'Operator'}</span>
            <ChevronDown size={14} className={`chevron ${menuOpen ? 'open' : ''}`} />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="menu-backdrop"
                onClick={() => setMenuOpen(false)}
                aria-label="Close account menu"
              />
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <strong>{user?.displayName || 'Operator'}</strong>
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
