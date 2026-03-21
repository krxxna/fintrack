import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { generateMockTransactions } from '../utils/mockData';
import { MONTHS } from '../constants/categories';

const DataContext = createContext(null);

export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState(() => generateMockTransactions());
  const [loading, setLoading] = useState(false);

  // ── CRUD helpers ───────────────────────────────────────────────────────────
  const addTransaction = useCallback((data) => {
    const newT = {
      ...data,
      _id: String(Date.now()),
      date: data.date || new Date().toISOString(),
    };
    setTransactions(prev =>
      [newT, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
    );
    return newT;
  }, []);

  const editTransaction = useCallback((id, data) => {
    setTransactions(prev =>
      prev
        .map(t => (t._id === id ? { ...t, ...data } : t))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    );
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t._id !== id));
  }, []);

  // ── Analytics helpers ──────────────────────────────────────────────────────
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
    loading,
    addTransaction,
    editTransaction,
    deleteTransaction,
    getSummary,
    getMonthlyData,
    getCategoryData,
    getCurrentMonthTxns,
  }), [transactions, loading, addTransaction, editTransaction, deleteTransaction, getSummary, getMonthlyData, getCategoryData, getCurrentMonthTxns]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
