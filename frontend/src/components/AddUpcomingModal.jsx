import React, { useState } from 'react';
import { X, Calendar, Dumbbell, Youtube, Home, Music2, Zap, Car, BookOpen } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useCurrency } from '../hooks/useCurrency';

const ICON_OPTIONS = [
  { label: 'Gym', icon: Dumbbell, tone: 'neutral' },
  { label: 'YouTube', icon: Youtube, tone: 'youtube' },
  { label: 'Rent', icon: Home, tone: 'neutral' },
  { label: 'Music', icon: Music2, tone: 'music' },
  { label: 'Utilities', icon: Zap, tone: 'neutral' },
  { label: 'Transport', icon: Car, tone: 'neutral' },
];

export function AddUpcomingModal({ isOpen, onClose, onAdd }) {
  const toast = useToast();
  const currency = useCurrency();

  const [label, setLabel] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedIconIdx, setSelectedIconIdx] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim() || !amount || Number(amount) <= 0) {
      toast('Please enter a valid label and amount', 'error');
      return;
    }

    const iconItem = ICON_OPTIONS[selectedIconIdx];
    onAdd({
      label: label.trim(),
      date: dateStr ? new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '15 Dec',
      amount: Number(amount),
      icon: iconItem.icon,
      tone: iconItem.tone,
    });
    toast(`Upcoming expense "${label}" created`, 'success');
    setLabel('');
    setAmount('');
    setDateStr('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} style={{ color: 'var(--teal)' }} /> Add Upcoming Expense
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Expense Title *</label>
              <input
                className="form-input"
                placeholder="e.g. Netflix Subscription"
                value={label}
                onChange={e => setLabel(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Icon Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 6 }}>
                {ICON_OPTIONS.map((item, idx) => {
                  const IconComp = item.icon;
                  const active = selectedIconIdx === idx;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSelectedIconIdx(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: active ? '1px solid var(--teal)' : '1px solid var(--border)',
                        background: active ? 'var(--teal-glow)' : 'var(--bg2)',
                        color: active ? 'var(--teal)' : 'var(--text2)',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      <IconComp size={15} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Reminder</button>
          </div>
        </form>
      </div>
    </div>
  );
}
