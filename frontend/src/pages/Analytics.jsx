import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useData }         from '../contexts/DataContext';
import { ChartTooltip }    from '../components/ui/ChartTooltip';
import { EmptyState }      from '../components/ui/EmptyState';
import { fmt }             from '../utils/formatters';
import { getCategoryMeta } from '../constants/categories';

const CHART_COLORS = ['#0EA5E9','#EF4444','#22C55E','#F59E0B','#8B5CF6','#06B6D4','#EC4899','#64748B'];

export function Analytics() {
  const { transactions, getMonthlyData, getCategoryData } = useData();
  const [chartMode, setChartMode] = useState('area');   // 'area' | 'bar'
  const [catType,   setCatType]   = useState('expense'); // 'expense' | 'income'

  const monthly   = getMonthlyData();
  const pieData   = getCategoryData(catType);
  const totalPie  = pieData.reduce((s, d) => s + d.value, 0);

  // KPI cards
  const now     = new Date();
  const allYear = transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
  const totalIncome  = allYear.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0);
  const totalExpense = allYear.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const bestIncome = monthly.reduce((a, b) => b.income  > a.income  ? b : a, monthly[0] || {});
  const highestExp = monthly.reduce((a, b) => b.expense > a.expense ? b : a, monthly[0] || {});
  const avgSavings = Math.round(monthly.reduce((s, m) => s + (m.income - m.expense), 0) / 12);

  const kpis = [
    { label: 'YTD Income',            value: fmt(totalIncome),      color: 'var(--green)' },
    { label: 'YTD Expenses',          value: fmt(totalExpense),     color: 'var(--red)'   },
    { label: 'Best Income Month',     value: bestIncome.month || '–', sub: fmt(bestIncome.income || 0),  color: 'var(--teal)'  },
    { label: 'Avg Monthly Savings',   value: fmt(avgSavings),        color: avgSavings >= 0 ? 'var(--green)' : 'var(--red)' },
    { label: 'Peak Expense Month',    value: highestExp.month || '–', sub: fmt(highestExp.expense || 0), color: 'var(--amber)' },
    { label: 'Total Transactions',    value: transactions.length,   color: 'var(--purple)' },
  ];

  return (
    <div>
      {/* ── Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-desc">Financial insights · {now.getFullYear()}</div>
        </div>
        <div className="segment">
          {[['area', 'Area Chart'], ['bar', 'Bar Chart']].map(([v, l]) => (
            <button key={v} className={`seg-btn ${chartMode === v ? 'active' : ''}`} onClick={() => setChartMode(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {kpis.map((k, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div className="stat-label">{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: k.color, letterSpacing: '-0.5px' }}>
              {k.value}
            </div>
            {k.sub && (
              <div style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 3 }}>{k.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* ── Main Chart */}
      <div className="card card-p" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Monthly Cash Flow</div>
            <div className="card-sub">Income, Expenses & Net · {now.getFullYear()}</div>
          </div>
          <div className="chart-legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: '#0EA5E9' }} />Income</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#EF4444' }} />Expense</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#22C55E' }} />Net</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          {chartMode === 'area' ? (
            <AreaChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/></linearGradient>
                <linearGradient id="a2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
                <linearGradient id="a3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/><stop offset="95%" stopColor="#22C55E" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `$${v / 1000}k` : `$${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income"  name="Income"  stroke="#0EA5E9" strokeWidth={2} fill="url(#a1)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2} fill="url(#a2)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="net"     name="Net"     stroke="#22C55E" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#a3)" dot={false} activeDot={{ r: 3 }} />
            </AreaChart>
          ) : (
            <BarChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `$${v / 1000}k` : `$${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="income"  name="Income"  fill="#0EA5E9" fillOpacity={0.85} radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expense" fill="#EF4444" fillOpacity={0.85} radius={[4,4,0,0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ── Bottom Row: Pie + Category List */}
      <div className="two-col">
        {/* Pie Chart */}
        <div className="card card-p">
          <div className="card-header">
            <div>
              <div className="card-title">Category Distribution</div>
              <div className="card-sub">This month · {catType}</div>
            </div>
            <div className="type-toggle">
              {['expense', 'income'].map(t => (
                <button
                  key={t}
                  className={`type-btn ${catType === t ? `active ${t}` : ''}`}
                  onClick={() => setCatType(t)}
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} dataKey="value" paddingAngle={3}>
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={getCategoryMeta(e.name).color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="pie-legend">
                {pieData.map((d, i) => {
                  const pct = totalPie ? Math.round((d.value / totalPie) * 100) : 0;
                  const color = getCategoryMeta(d.name).color;
                  return (
                    <div key={i}>
                      <div className="pie-legend-item">
                        <div className="pie-legend-name">
                          <div className="pie-dot" style={{ background: color }} />
                          <span>{d.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{pct}%</span>
                          <div className="pie-legend-val">{fmt(d.value)}</div>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState title={`No ${catType} data`} subtitle="Record some transactions to see analytics" />
          )}
        </div>

        {/* Top Spenders */}
        <div className="card card-p">
          <div className="card-header">
            <div className="card-title">Top Spending Categories</div>
          </div>

          {pieData.slice(0, 7).length > 0 ? (
            pieData.slice(0, 7).map((d, i) => {
              const pct   = totalPie ? Math.round((d.value / totalPie) * 100) : 0;
              const color = getCategoryMeta(d.name).color;
              const Icon  = getCategoryMeta(d.name).icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, background: `${color}1E`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text1)' }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{fmt(d.value)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 28, textAlign: 'right' }}>
                    {pct}%
                  </span>
                </div>
              );
            })
          ) : (
            <EmptyState title="No data" subtitle="No expense data available for this month" />
          )}
        </div>
      </div>
    </div>
  );
}
