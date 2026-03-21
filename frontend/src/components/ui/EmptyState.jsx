import React from 'react';
import { Receipt } from 'lucide-react';

export function EmptyState({ icon: Icon = Receipt, title = 'Nothing here', subtitle = '', action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={22} style={{ color: 'var(--text3)' }} />
      </div>
      <div className="empty-title">{title}</div>
      {subtitle && <div className="empty-sub">{subtitle}</div>}
      {action}
    </div>
  );
}
