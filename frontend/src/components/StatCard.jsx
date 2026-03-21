import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({ label, value, icon: Icon, iconColor, iconBg, change, changeSuffix = 'vs last month' }) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="card card-p stat-card" style={{ padding: '20px' }}>
      {Icon && (
        <div className="stat-icon" style={{ background: iconBg }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change !== undefined && (
        <div className="stat-change">
          {isPositive && <ArrowUpRight size={12} className="up" />}
          {isNegative && <ArrowDownRight size={12} className="down" />}
          {(isPositive || isNegative) && (
            <span className={isPositive ? 'up' : 'down'}>{Math.abs(change)}%</span>
          )}
          <span>{changeSuffix}</span>
        </div>
      )}
    </div>
  );
}
