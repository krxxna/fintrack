import React from 'react';
import {
  LayoutDashboard, Receipt, PieChart, Settings,
  LogOut, Sun, Moon, Zap,
} from 'lucide-react';
import { useAuth }  from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

const NAV_MAIN = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, badge: null },
  { id: 'transactions', label: 'Transactions', icon: Receipt,         badge: 'Live' },
  { id: 'analytics',   label: 'Analytics',    icon: PieChart,        badge: null },
];
const NAV_ACCOUNT = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast('Signed out successfully', 'info');
  };

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">F</div>
        <div>
          <div className="logo-text">FinTrack</div>
          <div className="logo-sub">Personal Finance</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {NAV_MAIN.map(n => (
          <div
            key={n.id}
            className={`nav-item ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <n.icon size={17} />
            {n.label}
            {n.badge && <span className="nav-badge">{n.badge}</span>}
          </div>
        ))}

        <div className="nav-section-label">Account</div>
        {NAV_ACCOUNT.map(n => (
          <div
            key={n.id}
            className={`nav-item ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <n.icon size={17} />
            {n.label}
          </div>
        ))}

        {/* Theme toggle */}
        <div className="nav-item" onClick={toggle}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </div>
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="user-card" onClick={handleLogout} title="Sign out">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <LogOut size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
