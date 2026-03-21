import React from 'react';
import { Sun, Moon, Bell, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PAGE_META = {
  dashboard:    ['Dashboard',    'Your financial overview at a glance'],
  transactions: ['Transactions', 'Manage your income & expenses'],
  analytics:    ['Analytics',    'Insights, trends & spending breakdown'],
  settings:     ['Settings',     'Account preferences & security'],
};

export function Topbar({ page, setPage }) {
  const { theme, toggle } = useTheme();
  const [title, subtitle] = PAGE_META[page] || ['', ''];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
        <div className="topbar-subtitle">{subtitle}</div>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="icon-btn" title="Notifications">
          <Bell size={16} />
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setPage('transactions')}
          style={{ marginLeft: 4 }}
        >
          <Plus size={14} />
          Add Transaction
        </button>
      </div>
    </header>
  );
}
