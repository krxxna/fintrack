import React, { useMemo, useState } from 'react';
import {
  ArrowRight, Bell, CalendarDays, Car, ChevronRight, CreditCard,
  Dumbbell, GraduationCap, Home, Landmark, Music2, Plus, Search,
  ShieldCheck, Sparkles, Wand2, Wallet, Youtube, Zap, ArrowUpRight,
  ArrowDownRight, Check, DollarSign, PiggyBank
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { useCurrency } from '../hooks/useCurrency';
import { fmt } from '../utils/formatters';
import { AddRecipientModal } from '../components/AddRecipientModal';
import { AddUpcomingModal } from '../components/AddUpcomingModal';
import { AddSavingPlanModal } from '../components/AddSavingPlanModal';

const INITIAL_RECIPIENTS = [
  { name: 'Maya', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80' },
  { name: 'Liam', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80' },
  { name: 'Noor', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80' },
];

const INITIAL_UPCOMING = [
  { label: 'Gym', date: '1 Dec', amount: 20, icon: Dumbbell, tone: 'neutral' },
  { label: 'Youtube', date: '9 Dec', amount: 8, icon: Youtube, tone: 'youtube' },
  { label: 'Rent', date: '17 Dec', amount: 2000, icon: Home, tone: 'neutral' },
  { label: 'Apple Music', date: '22 Dec', amount: 12, icon: Music2, tone: 'music' },
];

const INITIAL_SAVING_PLANS = [
  { label: 'Car', icon: Car, percent: 45, tone: 'violet' },
  { label: 'Education', icon: GraduationCap, percent: 68, tone: 'green' },
  { label: 'Emergency', icon: ShieldCheck, percent: 32, tone: 'blue' },
];

function MiniTrend({ tone = 'green' }) {
  return (
    <svg className={`mini-trend ${tone}`} viewBox="0 0 160 64" aria-hidden="true">
      <path d="M6 42 C22 30 31 50 45 36 S67 18 82 36 S102 52 112 17 S135 35 154 25" />
      <circle cx="112" cy="17" r="5" />
    </svg>
  );
}

function ProgressTicks({ percent, tone }) {
  return (
    <div className="dash-ticks" aria-label={`${percent}% complete`}>
      {Array.from({ length: 32 }).map((_, index) => {
        const active = index < Math.round((percent / 100) * 32);
        return <span key={index} className={active ? tone : ''} />;
      })}
    </div>
  );
}

export function Dashboard({ setPage, onOpenAddTxn, onOpenAskAi, onOpenAdvisory }) {
  const { user, isDemo } = useAuth();
  const { transactions, getSummary, addTransaction } = useData();
  const toast = useToast();
  const currency = useCurrency();

  const userKey = user?._id || user?.id || user?.email || 'default';

  // Per-user recipients state
  const [recipients, setRecipients] = useState(() => {
    if (isDemo) return INITIAL_RECIPIENTS;
    const saved = localStorage.getItem(`ft_recipients_${userKey}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedRecipientIdx, setSelectedRecipientIdx] = useState(0);
  const [transferAmount, setTransferAmount] = useState('100');

  // Per-user upcoming expenses state
  const [upcomingExpenses, setUpcomingExpenses] = useState(() => {
    if (isDemo) return INITIAL_UPCOMING;
    const saved = localStorage.getItem(`ft_upcoming_${userKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Per-user saving goals state
  const [savingPlans, setSavingPlans] = useState(() => {
    if (isDemo) return INITIAL_SAVING_PLANS;
    const saved = localStorage.getItem(`ft_goals_${userKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [expenseLimit, setExpenseLimit] = useState(5000);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Modals state
  const [isAddRecipientOpen, setIsAddRecipientOpen] = useState(false);
  const [isAddUpcomingOpen, setIsAddUpcomingOpen] = useState(false);
  const [isAddSavingOpen, setIsAddSavingOpen] = useState(false);

  // Helper functions to persist per-user state
  const updateRecipients = (newRecipients) => {
    setRecipients(newRecipients);
    if (!isDemo) localStorage.setItem(`ft_recipients_${userKey}`, JSON.stringify(newRecipients));
  };

  const updateUpcoming = (newUpcoming) => {
    setUpcomingExpenses(newUpcoming);
    if (!isDemo) localStorage.setItem(`ft_upcoming_${userKey}`, JSON.stringify(newUpcoming));
  };

  const updateGoals = (newGoals) => {
    setSavingPlans(newGoals);
    if (!isDemo) localStorage.setItem(`ft_goals_${userKey}`, JSON.stringify(newGoals));
  };

  // Financial Calculations from Real User Data
  const now = new Date();
  const thisMonthTxns = useMemo(() => transactions.filter((txn) => {
    const d = new Date(txn.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }), [transactions, now]);

  const monthSummary = getSummary(thisMonthTxns);
  const allSummary = getSummary(transactions);

  // Real financial totals
  const totalBalance = allSummary.balance;
  const totalIncome = monthSummary.income;
  const totalExpenses = monthSummary.expense;

  const availableBalance = totalBalance > 0 ? Math.round(totalBalance * 1.2) : 0;
  const cardBalance = totalBalance > 0 ? Math.round(totalBalance * 0.4) : 0;

  // Dynamic AI insights
  const insights = useMemo(() => [
    {
      id: 'bal-insight',
      eyebrow: 'Balance insight',
      body: totalBalance > 0
        ? `You have ${fmt(totalBalance, currency)} net balance available.`
        : 'Record your first income or deposit to start building your balance.',
      recommendation: totalBalance > 0
        ? 'Transferring 20% into your Emergency Saving Plan will boost goal progress.'
        : 'Click "+ Add Record" above to log your current balance.',
    },
    {
      id: 'sub-insight',
      eyebrow: 'Subscription insight',
      body: upcomingExpenses.length > 0
        ? `You have ${upcomingExpenses.length} upcoming recurring subscriptions scheduled.`
        : 'No active subscription reminders. Add recurring bills to stay ahead.',
      recommendation: 'Auditing unused subscriptions can save up to 15% yearly.',
    },
  ], [totalBalance, currency, upcomingExpenses]);

  // Quick Transfer handler
  const handleQuickTransfer = () => {
    const recipient = recipients[selectedRecipientIdx];
    const amountNum = Number(transferAmount);

    if (!amountNum || amountNum <= 0) {
      toast('Please enter a valid transfer amount', 'error');
      return;
    }

    addTransaction({
      type: 'expense',
      amount: amountNum,
      category: 'Other',
      note: `Quick transfer to ${recipient.name}`,
      date: new Date().toISOString(),
    });

    toast(`Successfully sent ${fmt(amountNum, currency)} to ${recipient.name}!`, 'success');
  };

  // Mark upcoming expense as paid
  const handlePayUpcoming = (itemIndex) => {
    const item = upcomingExpenses[itemIndex];
    addTransaction({
      type: 'expense',
      amount: item.amount,
      category: 'Bills & Utilities',
      note: `Paid upcoming bill: ${item.label}`,
      date: new Date().toISOString(),
    });

    const updated = upcomingExpenses.filter((_, idx) => idx !== itemIndex);
    updateUpcoming(updated);
    toast(`Paid ${item.label} (${fmt(item.amount, currency)})`, 'success');
  };

  // Deposit into saving plan
  const handleDepositSaving = (planIndex) => {
    const plan = savingPlans[planIndex];
    const newPercent = Math.min(100, plan.percent + 15);
    const updated = savingPlans.map((p, idx) => idx === planIndex ? { ...p, percent: newPercent } : p);
    updateGoals(updated);

    addTransaction({
      type: 'expense',
      amount: 150,
      category: 'Other',
      note: `Deposit to ${plan.label} Savings Goal`,
      date: new Date().toISOString(),
    });

    toast(`Deposited ${fmt(150, currency)} to ${plan.label} plan!`, 'success');
  };

  // Apply AI recommendations
  const handleApplyRecommendations = () => {
    // Boost emergency saving plan
    const updated = savingPlans.map(p => p.label === 'Emergency' ? { ...p, percent: Math.min(100, p.percent + 18) } : p);
    updateGoals(updated);
    toast('AI Recommendation Applied: Emergency Fund updated!', 'success');
  };

  const displayName = user?.name?.split(' ')[0] || 'Member';

  return (
    <div className="dashboard-wrapper">
      {/* Top Banner / Header */}
      <div className="dash-hero-banner">
        <div>
          <h2>Welcome back, {displayName}! 👋</h2>
          <p>Here is your personal financial overview and account activity.</p>
        </div>
        <div className="dash-hero-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenAskAi}>
            <Sparkles size={16} style={{ color: 'var(--amber)' }} /> Ask AI Assistant
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenAddTxn}>
            <Plus size={15} /> Add Record
          </button>
        </div>
      </div>

      {/* Main 6-Card Grid */}
      <div className="finlo-grid">
        {/* 1. Balance Card */}
        <article
          className={`balance-card selectable-card ${activeSection === 'dashboard' ? 'is-selected' : ''}`}
          onClick={() => setActiveSection('dashboard')}
        >
          <div className="dash-card-header">
            <p>Total Balance</p>
            <span className="badge badge-teal">Live Account</span>
          </div>

          <div className="balance-value">{fmt(totalBalance, currency)}</div>

          <div className="card-divider" />

          <div className="payment-card-row">
            <div className="visa-badge">VISA</div>
            <div>
              <span>•••• 4892</span>
              <strong>Personal Debit Card</strong>
              <b>{fmt(cardBalance, currency)}</b>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPage('transactions');
              }}
            >
              View ledger <ArrowRight size={16} />
            </button>
          </div>
        </article>

        {/* 2. Quick Transfer Card */}
        <article
          className={`transfer-card selectable-card ${activeSection === 'transfer' ? 'is-selected' : ''}`}
          onClick={() => setActiveSection('transfer')}
        >
          <p>Quick Money Transfer</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>Amount:</span>
            <input
              type="number"
              className="quick-transfer-input"
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <span>Available: {fmt(availableBalance, currency)}</span>

          <div className="recipient-card">
            <div>
              <h2>Choose Recipient</h2>
              <p>Send instantly from wallet</p>
            </div>

            <button
              type="button"
              aria-label="Add recipient"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddRecipientOpen(true);
              }}
              title="Add Recipient"
            >
              <Plus size={22} />
            </button>

            <div className="recipient-list">
              {recipients.map((person, index) => (
                <img
                  key={person.name}
                  className={selectedRecipientIdx === index ? 'selected' : ''}
                  src={person.image}
                  alt={person.name}
                  title={person.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRecipientIdx(index);
                  }}
                />
              ))}
            </div>
          </div>

          <button
            className="transfer-action"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickTransfer();
            }}
          >
            Send {fmt(Number(transferAmount) || 0, currency)} to {recipients[selectedRecipientIdx]?.name || 'Recipient'}
          </button>
        </article>

        {/* 3. Upcoming Expenses Card */}
        <article
          className={`upcoming-card selectable-card ${activeSection === 'upcoming' ? 'is-selected' : ''}`}
          onClick={() => setActiveSection('upcoming')}
        >
          <div className="dash-card-header">
            <h2>Upcoming Bills</h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddUpcomingOpen(true);
              }}
            >
              <Plus size={14} /> Add Bill
            </button>
          </div>

          <div className="upcoming-list">
            {upcomingExpenses.length === 0 ? (
              <div className="empty-sub" style={{ padding: '20px 0' }}>No upcoming bills due.</div>
            ) : (
              upcomingExpenses.map((item, idx) => {
                const IconComponent = item.icon || Dumbbell;
                return (
                  <div className="upcoming-row" key={idx}>
                    <div className={`expense-icon ${item.tone || 'neutral'}`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <strong>{item.label}</strong>
                      <span>Due {item.date}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <b>{fmt(item.amount, currency)}</b>
                      <button
                        type="button"
                        className="mark-paid-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayUpcoming(idx);
                        }}
                      >
                        <Check size={12} /> Pay Now
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        {/* 4. Saving Plan Card */}
        <article
          className={`saving-card selectable-card ${activeSection === 'saving' ? 'is-selected' : ''}`}
          onClick={() => setActiveSection('saving')}
        >
          <div className="dash-card-header">
            <h2>Savings Goals</h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddSavingOpen(true);
              }}
            >
              <Plus size={14} /> New Goal
            </button>
          </div>

          {savingPlans.map((plan, idx) => {
            const IconComp = plan.icon || Car;
            return (
              <div className="saving-plan" key={plan.label}>
                <div className="saving-plan-head">
                  <div>
                    <IconComp size={20} />
                    <strong>{plan.label}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{plan.percent}%</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '3px 8px', fontSize: 11 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDepositSaving(idx);
                      }}
                    >
                      + Deposit
                    </button>
                  </div>
                </div>
                <ProgressTicks percent={plan.percent} tone={plan.tone} />
              </div>
            );
          })}
        </article>

        {/* 5. Cash Flow Card */}
        <article
          className={`cash-card selectable-card ${activeSection === 'cash' ? 'is-selected' : ''}`}
          onClick={() => setActiveSection('cash')}
        >
          <div className="dash-card-header">
            <h2>Cash Flow</h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                const newLimit = prompt('Set monthly expense limit:', expenseLimit);
                if (newLimit && !isNaN(newLimit)) setExpenseLimit(Number(newLimit));
              }}
            >
              Set Limit
            </button>
          </div>

          <div className="cash-flow-row">
            <div>
              <span>Monthly Income</span>
              <strong style={{ color: 'var(--green)' }}>{fmt(totalIncome, currency)}</strong>
            </div>
            <MiniTrend tone="green" />
          </div>

          <div className="cash-flow-row">
            <div>
              <span>Monthly Expenses</span>
              <strong style={{ color: 'var(--red)' }}>{fmt(totalExpenses, currency)}</strong>
            </div>
            <MiniTrend tone="red" />
          </div>

          <div className="expense-limit-row">
            <span>Monthly Expense Limit</span>
            <strong>{fmt(expenseLimit, currency)}</strong>
          </div>

          <div className="limit-meter-bar">
            <div
              className="limit-meter-fill"
              style={{
                width: `${Math.min(100, Math.round((totalExpenses / expenseLimit) * 100))}%`,
              }}
            />
          </div>
        </article>

        {/* 6. AI Insights Card */}
        <article
          className={`ai-insights-card selectable-card ${activeSection === 'ai' ? 'is-selected' : ''}`}
          onClick={() => setActiveSection('ai')}
        >
          <div className="dash-card-header">
            <h2>AI Financial Insights</h2>
            <Sparkles size={18} style={{ color: '#fff' }} />
          </div>

          <div className="insight-stack">
            {insights.map((insight) => (
              <section className="insight-note" key={insight.id}>
                <span>{insight.eyebrow}</span>
                <p>{insight.body}</p>
                <p style={{ fontStyle: 'italic', opacity: 0.9, marginTop: 4 }}>
                  Recommendation: {insight.recommendation}
                </p>
              </section>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            <button className="apply-ai-btn" type="button" onClick={handleApplyRecommendations} style={{ marginTop: 0 }}>
              <Wand2 size={18} />
              Apply Recommended Savings
            </button>
            <button
              className="apply-ai-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenAdvisory) onOpenAdvisory();
              }}
              style={{
                marginTop: 0,
                background: 'rgba(255,255,255,0.15)',
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              <Sparkles size={18} />
              View Investment & Expense Hub
            </button>
          </div>
        </article>
      </div>

      {/* Modals */}
      <AddRecipientModal
        isOpen={isAddRecipientOpen}
        onClose={() => setIsAddRecipientOpen(false)}
        onAdd={(newRecipient) => updateRecipients([...recipients, newRecipient])}
      />

      <AddUpcomingModal
        isOpen={isAddUpcomingOpen}
        onClose={() => setIsAddUpcomingOpen(false)}
        onAdd={(newBill) => updateUpcoming([...upcomingExpenses, newBill])}
      />

      <AddSavingPlanModal
        isOpen={isAddSavingOpen}
        onClose={() => setIsAddSavingOpen(false)}
        onAdd={(newGoal) => updateGoals([...savingPlans, newGoal])}
      />
    </div>
  );
}
