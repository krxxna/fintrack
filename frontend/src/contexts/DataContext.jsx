import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { generateMockTransactions } from '../utils/mockData';
import { MONTHS } from '../constants/categories';
import { transactionsAPI } from '../services/api';

const DataContext = createContext(null);

export const useData = () => useContext(DataContext);

const DEMO_ACCOUNTS = [
  { _id: 'acc_1', name: 'Chase Checking', type: 'Bank Account', balance: 12450, accountNumber: '•••• 4892', bankName: 'Chase', isDefault: true },
  { _id: 'acc_2', name: 'Visa Personal Debit', type: 'Debit Card', balance: 4850, accountNumber: '•••• 1947', bankName: 'Visa', isDefault: false },
  { _id: 'acc_3', name: 'Physical Cash Wallet', type: 'Cash', balance: 320, accountNumber: 'N/A', bankName: 'Cash', isDefault: false },
];

const DEMO_SAVINGS = [
  { _id: 'sav_1', title: 'Emergency Reserve', targetAmount: 10000, currentAmount: 6400, deadline: '2025-12-31', notes: '3-6 months liquid safety buffer' },
  { _id: 'sav_2', title: 'New Electric Car', targetAmount: 35000, currentAmount: 15750, deadline: '2026-06-30', notes: 'Fund for new EV purchase' },
  { _id: 'sav_3', title: 'Higher Education Fund', targetAmount: 15000, currentAmount: 10200, deadline: '2025-09-01', notes: 'Certifications and courses' },
];

export function DataProvider({ children }) {
  const { user, isDemo } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [savingGoals, setSavingGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const userKey = user?._id || user?.id || user?.email || 'guest';

  // ── Sync data based on logged-in user
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setAccounts([]);
      setSavingGoals([]);
      return;
    }

    if (isDemo) {
      // Demo user
      const localTxns = localStorage.getItem('ft_demo_txns');
      const localAccs = localStorage.getItem('ft_demo_accs');
      const localSavs = localStorage.getItem('ft_demo_savs');

      setTransactions(localTxns ? JSON.parse(localTxns) : generateMockTransactions());
      setAccounts(localAccs ? JSON.parse(localAccs) : DEMO_ACCOUNTS);
      setSavingGoals(localSavs ? JSON.parse(localSavs) : DEMO_SAVINGS);
    } else {
      // Real user: per-user storage / DB sync
      setLoading(true);
      const txnsKey = `ft_txns_${userKey}`;
      const accsKey = `ft_accs_${userKey}`;
      const savsKey = `ft_savs_${userKey}`;

      const savedTxns = localStorage.getItem(txnsKey);
      const savedAccs = localStorage.getItem(accsKey);
      const savedSavs = localStorage.getItem(savsKey);

      setAccounts(savedAccs ? JSON.parse(savedAccs) : [
        { _id: 'acc_main', name: 'Main Checking Account', type: 'Bank Account', balance: 0, accountNumber: '•••• 1001', bankName: 'Main', isDefault: true }
      ]);
      setSavingGoals(savedSavs ? JSON.parse(savedSavs) : []);

      transactionsAPI.list()
        .then(res => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setTransactions(res.data.data);
            localStorage.setItem(txnsKey, JSON.stringify(res.data.data));
          } else if (savedTxns) {
            setTransactions(JSON.parse(savedTxns));
          } else {
            setTransactions([]);
          }
        })
        .catch(() => {
          if (savedTxns) {
            try { setTransactions(JSON.parse(savedTxns)); } catch { setTransactions([]); }
          } else {
            setTransactions([]);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user, isDemo, userKey]);

  // ── Persistence helpers
  const persistTxns = useCallback((newTxns) => {
    setTransactions(newTxns);
    if (!user) return;
    const key = isDemo ? 'ft_demo_txns' : `ft_txns_${userKey}`;
    localStorage.setItem(key, JSON.stringify(newTxns));
  }, [user, isDemo, userKey]);

  const persistAccounts = useCallback((newAccs) => {
    setAccounts(newAccs);
    if (!user) return;
    const key = isDemo ? 'ft_demo_accs' : `ft_accs_${userKey}`;
    localStorage.setItem(key, JSON.stringify(newAccs));
  }, [user, isDemo, userKey]);

  const persistSavings = useCallback((newSavs) => {
    setSavingGoals(newSavs);
    if (!user) return;
    const key = isDemo ? 'ft_demo_savs' : `ft_savs_${userKey}`;
    localStorage.setItem(key, JSON.stringify(newSavs));
  }, [user, isDemo, userKey]);

  // ── Transactions CRUD
  const addTransaction = useCallback((data) => {
    const newT = {
      ...data,
      _id: String(Date.now()),
      date: data.date || new Date().toISOString(),
    };
    const updated = [newT, ...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    persistTxns(updated);

    if (user && !isDemo) {
      transactionsAPI.create(data).catch(err => console.warn('Sync notice:', err.message));
    }
    return newT;
  }, [transactions, persistTxns, user, isDemo]);

  const editTransaction = useCallback((id, data) => {
    const updated = transactions
      .map(t => (t._id === id ? { ...t, ...data } : t))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    persistTxns(updated);

    if (user && !isDemo) {
      transactionsAPI.update(id, data).catch(err => console.warn('Sync notice:', err.message));
    }
  }, [transactions, persistTxns, user, isDemo]);

  const deleteTransaction = useCallback((id) => {
    const updated = transactions.filter(t => t._id !== id);
    persistTxns(updated);

    if (user && !isDemo) {
      transactionsAPI.delete(id).catch(err => console.warn('Sync notice:', err.message));
    }
  }, [transactions, persistTxns, user, isDemo]);

  // ── Accounts CRUD
  const addAccount = useCallback((accData) => {
    const newAcc = {
      ...accData,
      _id: `acc_${Date.now()}`,
      balance: Number(accData.balance) || 0,
      accountNumber: accData.accountNumber || `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
    };
    const updated = [...accounts, newAcc];
    persistAccounts(updated);
    return newAcc;
  }, [accounts, persistAccounts]);

  const editAccount = useCallback((id, accData) => {
    const updated = accounts.map(a => a._id === id ? { ...a, ...accData } : a);
    persistAccounts(updated);
  }, [accounts, persistAccounts]);

  const deleteAccount = useCallback((id) => {
    const updated = accounts.filter(a => a._id !== id);
    persistAccounts(updated);
  }, [accounts, persistAccounts]);

  const transferBetweenAccounts = useCallback((fromId, toId, amount) => {
    const num = Number(amount);
    if (!num || num <= 0) return;

    const fromAcc = accounts.find(a => a._id === fromId);
    const toAcc = accounts.find(a => a._id === toId);

    const updated = accounts.map(a => {
      if (a._id === fromId) return { ...a, balance: a.balance - num };
      if (a._id === toId) return { ...a, balance: a.balance + num };
      return a;
    });

    persistAccounts(updated);
    addTransaction({
      type: 'expense',
      amount: num,
      category: 'Other',
      note: `Account Transfer: ${fromAcc?.name || 'Account'} ➔ ${toAcc?.name || 'Account'}`,
      date: new Date().toISOString(),
    });
  }, [accounts, persistAccounts, addTransaction]);

  // ── Savings Goals CRUD
  const addSavingGoal = useCallback((goalData) => {
    const newGoal = {
      ...goalData,
      _id: `sav_${Date.now()}`,
      targetAmount: Number(goalData.targetAmount) || 1000,
      currentAmount: Number(goalData.currentAmount) || 0,
    };
    const updated = [...savingGoals, newGoal];
    persistSavings(updated);
    return newGoal;
  }, [savingGoals, persistSavings]);

  const editSavingGoal = useCallback((id, goalData) => {
    const updated = savingGoals.map(g => g._id === id ? { ...g, ...goalData } : g);
    persistSavings(updated);
  }, [savingGoals, persistSavings]);

  const deleteSavingGoal = useCallback((id) => {
    const updated = savingGoals.filter(g => g._id !== id);
    persistSavings(updated);
  }, [savingGoals, persistSavings]);

  const depositToGoal = useCallback((id, amount) => {
    const num = Number(amount);
    if (!num || num <= 0) return;

    let goalTitle = 'Saving Goal';
    const updated = savingGoals.map(g => {
      if (g._id === id) {
        goalTitle = g.title;
        return { ...g, currentAmount: g.currentAmount + num };
      }
      return g;
    });

    persistSavings(updated);
    addTransaction({
      type: 'expense',
      amount: num,
      category: 'Other',
      note: `Deposit to Goal: ${goalTitle}`,
      date: new Date().toISOString(),
    });
  }, [savingGoals, persistSavings, addTransaction]);

  const withdrawFromGoal = useCallback((id, amount) => {
    const num = Number(amount);
    if (!num || num <= 0) return;

    let goalTitle = 'Saving Goal';
    const updated = savingGoals.map(g => {
      if (g._id === id) {
        goalTitle = g.title;
        return { ...g, currentAmount: Math.max(0, g.currentAmount - num) };
      }
      return g;
    });

    persistSavings(updated);
    addTransaction({
      type: 'income',
      amount: num,
      category: 'Other',
      note: `Withdrawal from Goal: ${goalTitle}`,
      date: new Date().toISOString(),
    });
  }, [savingGoals, persistSavings, addTransaction]);

  // ── Analytics helpers
  const getSummary = useCallback((txns = transactions) => {
    const income  = txns.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const getMonthlyData = useCallback((year = new Date().getFullYear()) => {
    return MONTHS.map((month, i) => {
      const monthTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === i && d.getFullYear() === year;
      });
      const s = getSummary(monthTxns);
      return {
        month,
        income:  Math.round(s.income),
        expense: Math.round(s.expense),
        net:     Math.round(s.balance),
      };
    });
  }, [transactions, getSummary]);

  const getCategoryData = useCallback((type = 'expense', monthOffset = 0) => {
    const now   = new Date();
    const m     = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const match = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === type && d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    });
    const cats = {};
    match.forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const getCurrentMonthTxns = useCallback(() => {
    const now = new Date();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [transactions]);

  const value = useMemo(() => ({
    transactions,
    accounts,
    savingGoals,
    loading,
    addTransaction,
    editTransaction,
    deleteTransaction,
    addAccount,
    editAccount,
    deleteAccount,
    transferBetweenAccounts,
    addSavingGoal,
    editSavingGoal,
    deleteSavingGoal,
    depositToGoal,
    withdrawFromGoal,
    getSummary,
    getMonthlyData,
    getCategoryData,
    getCurrentMonthTxns,
  }), [
    transactions, accounts, savingGoals, loading,
    addTransaction, editTransaction, deleteTransaction,
    addAccount, editAccount, deleteAccount, transferBetweenAccounts,
    addSavingGoal, editSavingGoal, deleteSavingGoal, depositToGoal, withdrawFromGoal,
    getSummary, getMonthlyData, getCategoryData, getCurrentMonthTxns
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
