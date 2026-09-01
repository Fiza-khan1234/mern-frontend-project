import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Headphones, 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  UserCheck, 
  LogOut, 
  User as UserIcon,
  Layers,
  Sun,
  Moon,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Dark/Light Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('supportflow_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('supportflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <div className="brand-icon-wrapper">
            <Headphones size={20} />
          </div>
          <span>SupportFlow</span>
          {user?.role && (
            <span className="brand-badge">{user.role}</span>
          )}
        </Link>

        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {isAuthenticated && user && (
          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {/* Customer Links */}
            {user.role === 'customer' && (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link to="/requests/new" onClick={() => setMenuOpen(false)} className={`nav-link ${isActive('/requests/new') ? 'active' : ''}`}>
                  <PlusCircle size={16} /> New Request
                </Link>
              </>
            )}

            {/* Worker Links */}
            {user.role === 'worker' && (
              <>
                <Link to="/worker/dashboard" onClick={() => setMenuOpen(false)} className={`nav-link ${isActive('/worker/dashboard') ? 'active' : ''}`}>
                  <LayoutDashboard size={16} /> Worker Hub
                </Link>
                <Link to={`/worker/profile/${user._id}`} onClick={() => setMenuOpen(false)} className={`nav-link ${isActive(`/worker/profile/${user._id}`) ? 'active' : ''}`}>
                  <UserIcon size={16} /> My Ratings
                </Link>
              </>
            )}

            {/* Admin Links */}
            {user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                  <LayoutDashboard size={16} /> Overview
                </Link>
                <Link to="/admin/worker-requests" onClick={() => setMenuOpen(false)} className={`nav-link ${isActive('/admin/worker-requests') ? 'active' : ''}`}>
                  <UserCheck size={16} /> Worker Requests
                </Link>
                <Link to="/admin/tickets" onClick={() => setMenuOpen(false)} className={`nav-link ${isActive('/admin/tickets') ? 'active' : ''}`}>
                  <Layers size={16} /> All Tickets
                </Link>
                <Link to="/admin/users" onClick={() => setMenuOpen(false)} className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}>
                  <Users size={16} /> Users
                </Link>
              </>
            )}
          </nav>
        )}

        <div className="nav-actions">
          {/* Theme Switcher */}
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {isAuthenticated && user ? (
            <>
              <NotificationBell />
              
              <div className="user-menu-pill">
                <div className="avatar-circle">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '0.25rem',
                  }}
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
