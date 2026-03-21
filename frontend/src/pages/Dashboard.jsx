import React, { useMemo } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, ChevronRight,
} from 'lucide-react';
import { useData }          from '../contexts/DataContext';
import { StatCard }         from '../components/StatCard';
import { TxnRow }           from '../components/TxnRow';
import { ChartTooltip }     from '../components/ui/ChartTooltip';
import { EmptyState }       from '../components/ui/EmptyState';
import { fmt, pctChange }   from '../utils/formatters';
import { getCategoryMeta }  from '../constants/categories';

export function Dashboard({ setPage }) {
  const { transactions, getSummary, getMonthlyData, getCategoryData } = useData();

  const now      = new Date();
  const allTxns  = transactions;
  const thisMoTxns = useMemo(() => allTxns.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }), [allTxns]);
  const lastMoTxns = useMemo(() => allTxns.filter(t => {
    const d = new Date(t.date);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
  }), [allTxns]);

  const current  = getSummary(thisMoTxns);
  const previous = getSummary(lastMoTxns);
  const monthly  = getMonthlyData();
  const pieData  = getCategoryData('expense');
  const recent   = allTxns.slice(0, 8);

  const savingsRate = current.income > 0
    ? Math.round(((current.income - current.expense) / current.income) * 100)
    : 0;

  const stats = [
    {
      label:    'Total Balance',
      value:    fmt(current.income - current.expense),
      icon:     Wallet,
      iconColor:'var(--teal)',
      iconBg:   'var(--teal-glow)',
      change:   pctChange(current.balance, previous.balance),
    },
    {
      label:    'Monthly Income',
      value:    fmt(current.income),
      icon:     ArrowUpRight,
      iconColor:'var(--green)',
      iconBg:   'var(--green-glow)',
      change:   pctChange(current.income, previous.income),
    },
    {
      label:    'Monthly Expense',
      value:    fmt(current.expense),
      icon:     ArrowDownRight,
      iconColor:'var(--red)',
      iconBg:   'var(--red-glow)',
      change:   pctChange(current.expense, previous.expense),
    },
    {
      label:    'Savings Rate',
      value:    `${savingsRate}%`,
      icon:     TrendingUp,
      iconColor:'var(--amber)',
      iconBg:   'var(--amber-glow)',
      change:   undefined,
      changeSuffix: 'of monthly income',
    },
  ];

  return (
    <div>
      {/* ── Stat Cards */}
      <div className="stats-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── Charts Row */}
      <div className="charts-grid">
        {/* Area Chart */}
        <div className="card card-p">
          <div className="card-header">
            <div>
              <div className="card-title">Income vs Expenses</div>
              <div className="card-sub">Monthly overview · {now.getFullYear()}</div>
            </div>
            <div className="chart-legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: '#0EA5E9' }} />Income</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#EF4444' }} />Expense</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0EA5E9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `$${v / 1000}k` : `$${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income"  name="Income"  stroke="#0EA5E9" strokeWidth={2} fill="url(#gi)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2} fill="url(#ge)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Pie */}
        <div className="card card-p">
          <div className="card-header">
            <div>
              <div className="card-title">Spending Breakdown</div>
              <div className="card-sub">This month by category</div>
            </div>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={42} outerRadius={62}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={getCategoryMeta(entry.name).color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.slice(0, 5).map((d, i) => (
                  <div key={i} className="pie-legend-item">
                    <div className="pie-legend-name">
                      <div className="pie-dot" style={{ background: getCategoryMeta(d.name).color }} />
                      <span>{d.name}</span>
                    </div>
                    <div className="pie-legend-val">{fmt(d.value)}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState title="No expenses" subtitle="No expense data recorded for this month" />
          )}
        </div>
      </div>

      {/* ── Recent Transactions */}
      <div className="card card-p">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Transactions</div>
            <div className="card-sub">{recent.length} latest entries</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage('transactions')}>
            View all <ChevronRight size={13} />
          </button>
        </div>
        {recent.length > 0 ? (
          <div className="txn-list">
            {recent.map(t => <TxnRow key={t._id} txn={t} compact />)}
          </div>
        ) : (
          <EmptyState title="No transactions yet" subtitle="Add your first income or expense to get started" />
        )}
      </div>
    </div>
  );
}
