import React, { useState } from 'react';
import { Shield, Download, Key, Bell, Moon, Globe, Trash2, RefreshCw } from 'lucide-react';
import { useAuth }  from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useCurrency, fmt } from '../hooks/useCurrency';
import { useData }  from '../contexts/DataContext';
import { fmt as formatCurrency } from '../utils/formatters';

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="settings-row">
      <div className="settings-row-info">
        <div className="settings-row-label">{label}</div>
        {desc && <div className="settings-row-desc">{desc}</div>}
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export function Settings() {
  const { user, updateProfile, logout, isDemo } = useAuth();
  const { theme, toggle, isDark }               = useTheme();
  const toast  = useToast();
  const { transactions } = useData();
  const currentCurrency = useCurrency();

  const [name,     setName]     = useState(user?.name  || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [saving,   setSaving]   = useState(false);

  // Notification prefs (local only in demo)
  const [notifPush,    setNotifPush]    = useState(true);
  const [notifWeekly,  setNotifWeekly]  = useState(false);
  const [notifBudget,  setNotifBudget]  = useState(true);
  const [notifLarge,   setNotifLarge]   = useState(true);

  const initials = user?.name
    ?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      if (!isDemo) {
        await updateProfile({ name, currency });
      }
      toast('Profile updated successfully', 'success');
    } catch {
      toast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.amount.toFixed(2),
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new URL(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `fintrack-export-${Date.now()}.csv`;
    link.click();
    toast('Export started — check your downloads', 'success');
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-desc">Manage your account & preferences</div>
        </div>
      </div>

      {/* ── Profile Section */}
      <div className="settings-section">
        <div className="settings-section-title">Profile</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <div
            className="avatar avatar-lg"
            style={{ background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text1)' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
            {isDemo && (
              <span className="badge badge-amber" style={{ marginTop: 6 }}>Demo Account</span>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Display Name</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Currency</label>
            <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="USD">$ USD – US Dollar</option>
              <option value="EUR">€ EUR – Euro</option>
              <option value="GBP">£ GBP – British Pound</option>
              <option value="INR">₹ INR – Indian Rupee</option>
              <option value="JPY">¥ JPY – Japanese Yen</option>
              <option value="CAD">$ CAD – Canadian Dollar</option>
              <option value="AUD">$ AUD – Australian Dollar</option>
            </select>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
              Current: {Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currentCurrency,
                maximumFractionDigits: 0
              }).format(1234.56)}
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0, marginTop: 14 }}>
          <label className="form-label">Email Address</label>
          <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.55 }} />
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={handleProfileSave} disabled={saving}>
            {saving ? <><RefreshCw size={13} className="spin" />Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Appearance */}
      <div className="settings-section">
        <div className="settings-section-title">Appearance</div>
        <ToggleRow
          label="Dark Mode"
          desc="Switch between dark and light theme"
          checked={isDark}
          onChange={toggle}
        />
      </div>

      {/* ── Notifications */}
      <div className="settings-section">
        <div className="settings-section-title">Notifications</div>
        <ToggleRow
          label="Push Notifications"
          desc="Browser notifications for important events"
          checked={notifPush}
          onChange={v => { setNotifPush(v); toast(`Push notifications ${v ? 'enabled' : 'disabled'}`, 'info'); }}
        />
        <ToggleRow
          label="Weekly Summary"
          desc="Get a weekly spending digest every Monday"
          checked={notifWeekly}
          onChange={v => { setNotifWeekly(v); toast(`Weekly reports ${v ? 'enabled' : 'disabled'}`, 'info'); }}
        />
        <ToggleRow
          label="Budget Alerts"
          desc="Alert when approaching category budget limits"
          checked={notifBudget}
          onChange={v => { setNotifBudget(v); toast(`Budget alerts ${v ? 'enabled' : 'disabled'}`, 'info'); }}
        />
        <ToggleRow
          label="Large Transaction Alerts"
          desc="Alert for transactions over $500"
          checked={notifLarge}
          onChange={v => { setNotifLarge(v); toast(`Large transaction alerts ${v ? 'enabled' : 'disabled'}`, 'info'); }}
        />
      </div>

      {/* ── Security */}
      <div className="settings-section">
        <div className="settings-section-title">Security</div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Change Password</div>
            <div className="settings-row-desc">Last updated 30 days ago</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => toast('Password reset email sent to ' + user?.email, 'info')}
          >
            <Key size={13} /> Change
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Two-Factor Authentication</div>
            <div className="settings-row-desc">Add an extra layer of account security</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => toast('2FA setup coming in a future update', 'info')}
          >
            <Shield size={13} /> Enable 2FA
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Active Sessions</div>
            <div className="settings-row-desc">1 active session (this device)</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { logout(); toast('All sessions ended', 'info'); }}>
            Sign Out All
          </button>
        </div>
      </div>

      {/* ── Data & Export */}
      <div className="settings-section">
        <div className="settings-section-title">Data & Export</div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Export Transactions</div>
            <div className="settings-row-desc">Download all transactions as CSV</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label" style={{ color: 'var(--red)' }}>Delete Account</div>
            <div className="settings-row-desc">Permanently remove all data — irreversible</div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => toast('Account deletion requires email confirmation', 'error')}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* ── About */}
      <div className="settings-section">
        <div className="settings-section-title">About</div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Version</div>
          </div>
          <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>v1.0.0</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Stack</div>
          </div>
          <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
            React · Node.js · MongoDB
          </span>
        </div>
      </div>
    </div>
  );
}
