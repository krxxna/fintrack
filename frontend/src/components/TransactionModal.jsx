import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import { toInputDate } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

export function TransactionModal({ onClose, txn = null, onSave }) {
  const toast = useToast();
  const isEdit = !!txn;

  const [type,     setType]     = useState(txn?.type     || 'expense');
  const [amount,   setAmount]   = useState(txn?.amount   || '');
  const [category, setCategory] = useState(txn?.category || '');
  const [note,     setNote]     = useState(txn?.note     || '');
  const [date,     setDate]     = useState(txn?.date ? toInputDate(txn.date) : toInputDate(new Date()));
  const [errors,   setErrors]   = useState({});

  const cats = CATEGORIES.filter(c => c.type === type || c.type === 'both');

  // reset category when type changes
  useEffect(() => {
    if (!txn) setCategory('');
  }, [type]);

  const validate = () => {
    const e = {};
    if (!amount || isNaN(amount) || Number(amount) <= 0) e.amount = 'Enter a valid amount';
    if (!category) e.category = 'Select a category';
    if (!date)     e.date     = 'Select a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = {
      type,
      amount:   parseFloat(Number(amount).toFixed(2)),
      category,
      note:     note.trim(),
      date:     new Date(date).toISOString(),
    };
    onSave(data, txn?._id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Type toggle */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="type-toggle">
              <button
                className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                onClick={() => setType('income')}
              >
                <ArrowUpRight size={14} /> Income
              </button>
              <button
                className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                onClick={() => setType('expense')}
              >
                <ArrowDownRight size={14} /> Expense
              </button>
            </div>
          </div>

          {/* Amount + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Amount *</label>
              <div className="input-group">
                <span className="input-addon input-addon-left" style={{ fontSize: 14, fontWeight: 600 }}>$</span>
                <input
                  className={`form-input has-left ${errors.amount ? 'input-error' : ''}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setErrors(p => ({ ...p, amount: '' })); }}
                  style={errors.amount ? { borderColor: 'var(--red)' } : {}}
                />
              </div>
              {errors.amount && <div className="form-error">{errors.amount}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date *</label>
              <input
                className="form-input"
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })); }}
                style={errors.date ? { borderColor: 'var(--red)' } : {}}
              />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>
          </div>

          <div style={{ marginTop: 14 }} />

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}
            >
              {cats.map(cat => {
                const Icon    = cat.icon;
                const active  = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => { setCategory(cat.name); setErrors(p => ({ ...p, category: '' })); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      padding: '10px 6px',
                      borderRadius: 9,
                      border: `1px solid ${active ? cat.color + '60' : 'var(--border)'}`,
                      background: active ? cat.color + '18' : 'var(--bg2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      color: active ? cat.color : 'var(--text3)',
                      fontSize: 11,
                      fontFamily: 'var(--font)',
                      fontWeight: active ? 600 : 400,
                      textAlign: 'center',
                      lineHeight: 1.3,
                    }}
                  >
                    <Icon size={15} style={{ color: active ? cat.color : 'var(--text3)' }} />
                    {cat.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
            {errors.category && <div className="form-error" style={{ marginTop: 6 }}>{errors.category}</div>}
          </div>

          {/* Note */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Note (optional)</label>
            <input
              className="form-input"
              placeholder="What was this for?"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
