import React, { useState } from 'react';
import { X, Landmark, Car, GraduationCap, ShieldCheck, Home, Plane, Heart } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const PLAN_ICONS = [
  { label: 'Car', icon: Car, tone: 'violet' },
  { label: 'Education', icon: GraduationCap, tone: 'green' },
  { label: 'Emergency', icon: ShieldCheck, tone: 'blue' },
  { label: 'House', icon: Home, tone: 'violet' },
  { label: 'Vacation', icon: Plane, tone: 'blue' },
  { label: 'Health', icon: Heart, tone: 'green' },
];

export function AddSavingPlanModal({ isOpen, onClose, onAdd }) {
  const toast = useToast();
  const [label, setLabel] = useState('');
  const [percent, setPercent] = useState('25');
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) {
      toast('Please enter a goal name', 'error');
      return;
    }

    const plan = PLAN_ICONS[selectedIdx];
    onAdd({
      label: label.trim(),
      icon: plan.icon,
      percent: Math.min(100, Math.max(0, Number(percent) || 0)),
      tone: plan.tone,
    });
    toast(`Saving plan "${label}" added`, 'success');
    setLabel('');
    setPercent('25');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Landmark size={18} style={{ color: 'var(--teal)' }} /> Add Saving Goal
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Goal Title *</label>
              <input
                className="form-input"
                placeholder="e.g. New Apartment Fund"
                value={label}
                onChange={e => setLabel(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={percent}
                onChange={e => setPercent(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Goal Icon</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 6 }}>
                {PLAN_ICONS.map((p, idx) => {
                  const IconComp = p.icon;
                  const active = selectedIdx === idx;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSelectedIdx(idx)}
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
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
