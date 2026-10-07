import React, { useState } from 'react';
import { Sun, Moon, Bell, Plus, Sparkles, Search, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

const PAGE_META = {
  dashboard:    ['Dashboard Overview',    'Real-time financial activity & accounts'],
  accounts:     ['Accounts & Net Worth',  'Manage bank accounts, debit/credit cards & wallets'],
  transactions: ['Transactions Ledger',   'Filter, search & manage records'],
  analytics:    ['Financial Analytics',    'Monthly cash flow & category spending'],
  savings:      ['Savings & Goals Hub',   'Track targets, deposit funds & build wealth'],
  settings:     ['Account Settings',      'Profile preferences & security'],
};

export function Topbar({ page, setPage, onOpenAddTxn, onOpenAskAi, searchTerm, setSearchTerm }) {
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const [showNotifs, setShowNotifs] = useState(false);

  const [title, subtitle] = PAGE_META[page] || ['Dashboard', 'Financial overview'];

  const notifications = [
    { id: 1, title: 'Upcoming Gym Bill', time: 'Due in 2 days', type: 'info', action: 'upcoming' },
    { id: 2, title: 'Budget Limit Alert', time: '80% Food budget used', type: 'warning', action: 'cash' },
    { id: 3, title: 'Weekly Spending Summary', time: 'Net balance +14%', type: 'success', action: 'analytics' },
  ];

  return (
    <header className="topbar">
      {/* Title section */}
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        <p className="topbar-subtitle">{subtitle}</p>
      </div>

      {/* Global Search Bar */}
      <div className="topbar-search">
        <Search size={15} className="topbar-search-icon" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search transactions, bills, categories..."
          value={searchTerm || ''}
          onChange={e => {
            if (setSearchTerm) setSearchTerm(e.target.value);
            if (page !== 'transactions' && e.target.value.trim().length > 0) {
              setPage('transactions');
            }
          }}
        />
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        {/* Ask AI Pill Button */}
        <button className="topbar-ai-btn" onClick={onOpenAskAi} type="button" title="Open AI Assistant">
          <Sparkles size={16} />
          <span>Ask AI</span>
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            title="Notifications"
            type="button"
          >
            <Bell size={17} />
            <span className="notif-dot" />
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <strong>Notifications</strong>
                <span className="badge badge-teal">3 new</span>
              </div>
              <div className="notif-list">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className="notif-item"
                    onClick={() => {
                      setShowNotifs(false);
                      if (n.action === 'analytics') setPage('analytics');
                      else setPage('dashboard');
                      toast(`Opened: ${n.title}`, 'info');
                    }}
                  >
                    {n.type === 'warning' ? <AlertTriangle size={15} style={{ color: 'var(--amber)' }} /> : <CheckCircle2 size={15} style={{ color: 'var(--teal)' }} />}
                    <div style={{ flex: 1 }}>
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button className="icon-btn" onClick={toggle} title="Toggle Theme" type="button">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Add Transaction Button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenAddTxn}
          type="button"
          style={{ marginLeft: 4 }}
        >
          <Plus size={15} />
          <span>Add Record</span>
        </button>
      </div>
    </header>
  );
}
