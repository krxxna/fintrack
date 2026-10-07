import React, { useState } from 'react';
import {
  Landmark, Plus, ArrowUpRight, ArrowDownRight, Edit3, Trash2,
  PiggyBank, Target, Calendar, CheckCircle2, Sparkles, TrendingUp
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useCurrency } from '../hooks/useCurrency';
import { fmt } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

export function Savings({ setPage }) {
  const { savingGoals, addSavingGoal, editSavingGoal, deleteSavingGoal, depositToGoal, withdrawFromGoal } = useData();
  const currency = useCurrency();
  const toast = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositType, setDepositType] = useState('deposit'); // 'deposit' | 'withdraw'
  const [depositAmount, setDepositAmount] = useState('');

  const [editGoal, setEditGoal] = useState(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  // Overall calculations
  const totalTarget = savingGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = savingGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallCompletion = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleOpenAdd = () => {
    setEditGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (goal) => {
    setEditGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount);
    setCurrentAmount(goal.currentAmount);
    setDeadline(goal.deadline || '');
    setNotes(goal.notes || '');
    setShowAddModal(true);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || Number(targetAmount) <= 0) {
      toast('Please enter a goal title and target amount', 'error');
      return;
    }

    const data = {
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline,
      notes: notes.trim(),
    };

    if (editGoal) {
      editSavingGoal(editGoal._id, data);
      toast('Savings goal updated', 'success');
    } else {
      addSavingGoal(data);
      toast('New savings goal created!', 'success');
    }
    setShowAddModal(false);
  };

  const handleDelete = (id, goalTitle) => {
    if (window.confirm(`Delete savings goal "${goalTitle}"?`)) {
      deleteSavingGoal(id);
      toast(`Savings goal "${goalTitle}" removed`, 'info');
    }
  };

  const handleOpenDeposit = (goal, type = 'deposit') => {
    setSelectedGoal(goal);
    setDepositType(type);
    setDepositAmount('');
    setShowDepositModal(true);
  };

  const handleExecuteDeposit = (e) => {
    e.preventDefault();
    const num = Number(depositAmount);
    if (!num || num <= 0 || !selectedGoal) {
      toast('Please enter a valid amount', 'error');
      return;
    }

    if (depositType === 'deposit') {
      depositToGoal(selectedGoal._id, num);
      toast(`Deposited ${fmt(num, currency)} into "${selectedGoal.title}"`, 'success');
    } else {
      withdrawFromGoal(selectedGoal._id, num);
      toast(`Withdrew ${fmt(num, currency)} from "${selectedGoal.title}"`, 'info');
    }
    setShowDepositModal(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings & Goals Hub</h1>
          <p className="page-desc">Track progress towards your long-term wealth targets</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={15} /> Create Savings Goal
        </button>
      </div>

      {/* Overview Cards */}
      <div className="three-col" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="stat-label">Total Saved</div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
            {fmt(totalSaved, currency)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            {overallCompletion}% of total {fmt(totalTarget, currency)} goal target
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="stat-label">Remaining to Save</div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text1)' }}>
            {fmt(totalRemaining, currency)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Needed across all active goals</div>
        </div>

        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="stat-label">Active Savings Goals</div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text1)' }}>
            {savingGoals.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Goals in progress</div>
        </div>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {savingGoals.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center' }}>
            <PiggyBank size={38} style={{ color: 'var(--text3)', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>No active savings goals</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4, marginBottom: 20 }}>
              Set up an emergency fund, vacation target, or major purchase goal to start saving.
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={14} /> Create Your First Goal
            </button>
          </div>
        ) : (
          savingGoals.map(g => {
            const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
            return (
              <div key={g._id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span className="badge badge-teal" style={{ marginBottom: 6 }}>{pct}% Complete</span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text1)' }}>{g.title}</h3>
                    {g.notes && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{g.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleOpenEdit(g)} title="Edit goal">
                      <Edit3 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(g._id, g.title)} title="Delete goal">
                      <Trash2 size={14} style={{ color: 'var(--red)' }} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' }}>Saved</span>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
                        {fmt(g.currentAmount, currency)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' }}>Target</span>
                      <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
                        {fmt(g.targetAmount, currency)}
                      </div>
                    </div>
                  </div>

                  {/* Progress meter */}
                  <div className="limit-meter-bar" style={{ height: 10, marginTop: 6, marginBottom: 18 }}>
                    <div className="limit-meter-fill" style={{ width: `${pct}%` }} />
                  </div>

                  {/* Quick Action buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary btn-sm flex-1"
                      style={{ justifyContent: 'center' }}
                      onClick={() => handleOpenDeposit(g, 'deposit')}
                    >
                      <ArrowUpRight size={14} /> Deposit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm flex-1"
                      style={{ justifyContent: 'center' }}
                      onClick={() => handleOpenDeposit(g, 'withdraw')}
                    >
                      <ArrowDownRight size={14} /> Withdraw
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-title">{editGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveGoal}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Goal Title *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Emergency Fund"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Target Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="10000"
                      value={targetAmount}
                      onChange={e => setTargetAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Amount Saved</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={currentAmount}
                      onChange={e => setCurrentAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Deadline (Optional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Description (Optional)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 6 months liquid reserves"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editGoal ? 'Save Changes' : 'Create Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Withdraw Modal */}
      {showDepositModal && selectedGoal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDepositModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-title">
                {depositType === 'deposit' ? 'Deposit to Goal' : 'Withdraw from Goal'}
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowDepositModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteDeposit}>
              <div className="modal-body">
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>Target Goal:</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text1)' }}>{selectedGoal.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
                    Current Saved: {fmt(selectedGoal.currentAmount, currency)} / {fmt(selectedGoal.targetAmount, currency)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {depositType === 'deposit' ? 'Deposit Amount *' : 'Withdrawal Amount *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowDepositModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {depositType === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
