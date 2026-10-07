import React from 'react';
import {
  LayoutDashboard, Building, Receipt, PieChart, Landmark, Settings,
  LogOut, Sun, Moon, Sparkles, ChevronRight, Zap
} from 'lucide-react';
import { useAuth }  from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, badge: null },
  { id: 'accounts',     label: 'Accounts',     icon: Building,        badge: null },
  { id: 'transactions', label: 'Transactions', icon: Receipt,         badge: 'Live' },
  { id: 'analytics',   label: 'Analytics',    icon: PieChart,        badge: null },
  { id: 'savings',      label: 'Savings Goals',icon: Landmark,        badge: null },
  { id: 'settings',     label: 'Settings',     icon: Settings,        badge: null },
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
    .toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="logo-mark">F</div>
        <div>
          <div className="logo-text">FinTrack</div>
          <div className="logo-sub">Personal Finance</div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Navigation</div>
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}

        <div className="nav-section-label">Preferences</div>
        <div className="nav-item" onClick={toggle}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </div>
      </nav>

      {/* Upgrade Banner */}
      <div className="sidebar-upgrade-wrap">
        <div className="upgrade-card" onClick={() => toast('Premium feature upgrade panel active.', 'info')}>
          <div className="upgrade-card-content">
            <Sparkles size={20} className="upgrade-icon" />
            <strong>Upgrade to Premium</strong>
            <p>Unlock AI insights & unlimited auto-syncing.</p>
            <button type="button" className="upgrade-btn">
              Upgrade Now <Zap size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* User Account Footer */}
      <div className="sidebar-footer">
        <div className="user-card" onClick={() => setPage('settings')} title="Account Settings">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Alex Morgan'}</div>
            <div className="user-email">{user?.email || 'user@fintrack.app'}</div>
          </div>
          <button
            type="button"
            className="logout-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
