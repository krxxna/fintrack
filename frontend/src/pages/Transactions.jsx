import React, { useState, useMemo } from 'react';
import { Plus, Search, X, Receipt } from 'lucide-react';
import { useData }               from '../contexts/DataContext';
import { useCurrency }           from '../hooks/useCurrency';
import { useToast }              from '../contexts/ToastContext';
import { TxnRow }                from '../components/TxnRow';
import { TransactionModal }      from '../components/TransactionModal';
import { EmptyState }            from '../components/ui/EmptyState';
import { fmt }                   from '../utils/formatters';
import { CATEGORIES, MONTHS }    from '../constants/categories';

export function Transactions() {
  const { transactions, addTransaction, editTransaction, deleteTransaction, getSummary } = useData();
  const toast = useToast();
  const currency = useCurrency();

  const [showModal,  setShowModal]  = useState(false);
  const [editTxn,    setEditTxn]    = useState(null);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter,  setCatFilter]  = useState('');
  const [monthFilter,setMonthFilter]= useState('');

  // ── Filtering
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        t.note?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      const matchType  = typeFilter === 'all' || t.type === typeFilter;
      const matchCat   = !catFilter  || t.category === catFilter;
      const matchMonth = !monthFilter ||
        new Date(t.date).getMonth() === Number(monthFilter);
      return matchSearch && matchType && matchCat && matchMonth;
    });
  }, [transactions, search, typeFilter, catFilter, monthFilter]);

  const summary = getSummary(filtered);
  const hasFilters = search || typeFilter !== 'all' || catFilter || monthFilter;

  // ── CRUD handlers
  const handleSave = (data, id) => {
    if (id) {
      editTransaction(id, data);
      toast('Transaction updated', 'success');
    } else {
      addTransaction(data);
      toast('Transaction added', 'success');
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    deleteTransaction(id);
    toast('Transaction deleted', 'info');
  };

  const openEdit = (txn) => { setEditTxn(txn); setShowModal(true); };
  const openAdd  = ()    => { setEditTxn(null);  setShowModal(true); };
  const closeModal = ()  => { setShowModal(false); setEditTxn(null); };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCatFilter('');
    setMonthFilter('');
  };

  return (
    <div>
      {/* ── Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-desc">
            {filtered.length} of {transactions.length} records
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add Transaction
        </button>
      </div>

      {/* ── Summary Mini Cards */}
      <div className="three-col" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Income',   value: fmt(summary.income, currency),                color: 'var(--green)' },
          { label: 'Total Expenses', value: fmt(summary.expense, currency),               color: 'var(--red)' },
          { label: 'Net Balance',    value: fmt(summary.balance, currency), color: summary.balance >= 0 ? 'var(--teal)' : 'var(--red)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: s.color, letterSpacing: '-0.5px' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by note or category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Type */}
        <div className="type-toggle">
          {['all', 'income', 'expense'].map(t => (
            <button
              key={t}
              className={`type-btn ${typeFilter === t ? `active ${t}` : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Category */}
        <select
          className="form-select"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Month */}
        <select
          className="form-select"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 130 }}
        >
          <option value="">All Months</option>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* ── Transaction List */}
      <div className="card" style={{ padding: '6px 8px' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            subtitle={hasFilters ? 'Try adjusting your search or filters' : 'Add your first transaction to get started'}
            action={
              !hasFilters && (
                <button className="btn btn-primary btn-sm" onClick={openAdd}>
                  <Plus size={13} /> Add Transaction
                </button>
              )
            }
          />
        ) : (
          <div className="txn-list">
            {filtered.map(t => (
              <TxnRow
                key={t._id}
                txn={t}
                onEdit={openEdit}
                onDelete={handleDelete}
                currency={currency}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal */}
      {showModal && (
        <TransactionModal
          txn={editTxn}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
