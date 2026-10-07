import React, { useState } from 'react';
import {
  CreditCard, Plus, ArrowRightLeft, Trash2, Edit3, Landmark, Wallet,
  Building, DollarSign, TrendingUp, CheckCircle2, Shield
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useCurrency } from '../hooks/useCurrency';
import { fmt } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

export function Accounts({ setPage }) {
  const { accounts, addAccount, editAccount, deleteAccount, transferBetweenAccounts } = useData();
  const currency = useCurrency();
  const toast = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editAcc, setEditAcc] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('Bank Account');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');

  // Transfer states
  const [fromAccId, setFromAccId] = useState(accounts[0]?._id || '');
  const [toAccId, setToAccId] = useState(accounts[1]?._id || '');
  const [transferAmount, setTransferAmount] = useState('');

  // Net Worth Calculations
  const totalAssets = accounts.filter(a => a.type !== 'Credit Card').reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === 'Credit Card').reduce((s, a) => s + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleOpenAdd = () => {
    setEditAcc(null);
    setName('');
    setType('Bank Account');
    setBalance('');
    setAccountNumber('');
    setBankName('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (acc) => {
    setEditAcc(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance);
    setAccountNumber(acc.accountNumber);
    setBankName(acc.bankName || '');
    setShowAddModal(true);
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Please enter an account name', 'error');
      return;
    }

    const data = {
      name: name.trim(),
      type,
      balance: Number(balance) || 0,
      accountNumber: accountNumber ? `•••• ${accountNumber.slice(-4)}` : '•••• 1234',
      bankName: bankName.trim() || 'Bank',
    };

    if (editAcc) {
      editAccount(editAcc._id, data);
      toast('Account updated successfully', 'success');
    } else {
      addAccount(data);
      toast('Account added successfully', 'success');
    }
    setShowAddModal(false);
  };

  const handleDelete = (id, accName) => {
    if (window.confirm(`Are you sure you want to delete ${accName}?`)) {
      deleteAccount(id);
      toast(`Account ${accName} deleted`, 'info');
    }
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    const amt = Number(transferAmount);
    if (!fromAccId || !toAccId || fromAccId === toAccId || !amt || amt <= 0) {
      toast('Please select two different accounts and a valid transfer amount', 'error');
      return;
    }

    transferBetweenAccounts(fromAccId, toAccId, amt);
    toast(`Transferred ${fmt(amt, currency)} between accounts`, 'success');
    setShowTransferModal(false);
    setTransferAmount('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts & Net Worth</h1>
          <p className="page-desc">Manage bank accounts, debit/credit cards, and cash wallets</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setShowTransferModal(true)}>
            <ArrowRightLeft size={15} /> Transfer Between Accounts
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={15} /> Add Account
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="three-col" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="stat-label">Total Net Worth</div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text1)' }}>
            {fmt(netWorth, currency)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Combined liquid & card assets</div>
        </div>

        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="stat-label">Total Liquid Assets</div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
            {fmt(totalAssets, currency)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Checking, savings & cash</div>
        </div>

        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="stat-label">Active Accounts</div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text1)' }}>
            {accounts.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Connected financial accounts</div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {accounts.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center' }}>
            <Building size={36} style={{ color: 'var(--text3)', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>No accounts added yet</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4, marginBottom: 20 }}>
              Add your checking, debit card, or cash wallet to start tracking your net worth.
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={14} /> Add Your First Account
            </button>
          </div>
        ) : (
          accounts.map(acc => (
            <div key={acc._id} className="card" style={{ padding: 24, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: 6 }}>{acc.type}</span>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text1)' }}>{acc.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{acc.accountNumber}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => handleOpenEdit(acc)}
                    title="Edit account"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => handleDelete(acc._id, acc.name)}
                    title="Delete account"
                  >
                    <Trash2 size={14} style={{ color: 'var(--red)' }} />
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Current Balance</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text1)', marginTop: 4 }}>
                  {fmt(acc.balance, currency)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Account Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-title">{editAcc ? 'Edit Account' : 'Add New Financial Account'}</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAccount}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Account Name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Chase Freedom Checking"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Account Type</label>
                    <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                      <option value="Bank Account">Bank Account</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash Wallet</option>
                      <option value="Investment">Investment</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Balance *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={balance}
                      onChange={e => setBalance(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Account / Card Number (Last 4 Digits)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 4892"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editAcc ? 'Save Changes' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Between Accounts Modal */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTransferModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-title">Transfer Between Accounts</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowTransferModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">From Account (Source)</label>
                  <select className="form-select" value={fromAccId} onChange={e => setFromAccId(e.target.value)}>
                    {accounts.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({fmt(a.balance, currency)})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To Account (Destination)</label>
                  <select className="form-select" value={toAccId} onChange={e => setToAccId(e.target.value)}>
                    {accounts.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({fmt(a.balance, currency)})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transfer Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={e => setTransferAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTransferModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Execute Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
