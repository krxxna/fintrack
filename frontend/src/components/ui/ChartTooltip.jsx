import React from 'react';
import { fmt } from '../../utils/formatters';

export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: 'var(--bg1)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
      minWidth: 130,
    }}>
      {label && (
        <div style={{ fontSize: 11.5, color: 'var(--text3)', marginBottom: 7, fontWeight: 500 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{ fontSize: 13, fontFamily: 'var(--mono)', color: p.color || 'var(--text1)', fontWeight: 500, marginBottom: i < payload.length - 1 ? 4 : 0 }}
        >
          <span style={{ color: 'var(--text2)', fontFamily: 'var(--font)', fontWeight: 400, fontSize: 12 }}>{p.name}: </span>
          {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}
