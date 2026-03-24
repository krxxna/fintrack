import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { getCategoryMeta } from '../constants/categories';
import { fmt, fmtDate } from '../utils/formatters';

export function TxnRow({ txn, compact = false, onEdit, onDelete, currency = 'USD' }) {
  const meta = getCategoryMeta(txn.category);
  const Icon = meta.icon;

  return (
    <div className="txn-row">
      {/* Icon */}
      <div className="txn-icon" style={{ background: `${meta.color}1E` }}>
        <Icon size={16} style={{ color: meta.color }} />
      </div>

      {/* Info */}
      <div className="txn-info">
        <div className="txn-name">{txn.note || txn.category}</div>
        <div className="txn-meta">
          <span className={`badge ${txn.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
            {txn.category}
          </span>
          <span>{fmtDate(txn.date)}</span>
        </div>
      </div>

      {/* Amount */}
      <div
        className="txn-amount"
        style={{ color: txn.type === 'income' ? 'var(--green)' : 'var(--red)' }}
      >
        {txn.type === 'income' ? '+' : '-'}{fmt(txn.amount, currency)}
      </div>

      {/* Actions (hidden until hover) */}
      {!compact && (
        <div className="txn-actions">
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={(e) => { e.stopPropagation(); onEdit?.(txn); }}
            title="Edit"
          >
            <Edit3 size={13} />
          </button>
          <button
            className="btn btn-danger btn-icon btn-sm"
            onClick={(e) => { e.stopPropagation(); onDelete?.(txn._id); }}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
