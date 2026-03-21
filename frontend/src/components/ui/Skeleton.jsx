import React from 'react';

export function Skeleton({ width, height, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: width || '100%', height: height || 16, ...style }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card card-p stat-card">
      <Skeleton width={100} height={11} style={{ marginBottom: 12 }} />
      <Skeleton width={140} height={28} style={{ marginBottom: 10 }} />
      <Skeleton width={80} height={11} />
    </div>
  );
}

export function TxnRowSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
      <Skeleton width={38} height={38} style={{ borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Skeleton width="55%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="35%" height={11} />
      </div>
      <Skeleton width={70} height={14} style={{ borderRadius: 4 }} />
    </div>
  );
}

export function ChartSkeleton({ height = 220 }) {
  return <Skeleton width="100%" height={height} style={{ borderRadius: 10 }} />;
}
