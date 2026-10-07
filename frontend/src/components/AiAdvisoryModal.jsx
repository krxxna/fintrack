import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Sparkles, TrendingUp, ShieldAlert, Lightbulb, ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '../contexts/ToastContext';
import { aiAPI } from '../services/api';

export function AiAdvisoryModal({ isOpen, onClose }) {
  const { transactions } = useData();
  const currency = useCurrency();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('investment');

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getSuggestions(transactions);
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('AI suggestions error, fallback active');
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, fetchSuggestions]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--teal), var(--purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>AI Investment & Expense Advisor</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text3)' }}>Tailored wealth strategies powered by AI</div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '6px', padding: '12px 22px 0', borderBottom: '1px solid var(--border)' }}>
          <button
            type="button"
            className={`seg-btn ${activeTab === 'investment' ? 'active' : ''}`}
            onClick={() => setActiveTab('investment')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <TrendingUp size={14} style={{ color: 'var(--teal)' }} /> Investment Strategy
          </button>
          <button
            type="button"
            className={`seg-btn ${activeTab === 'cutbacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('cutbacks')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldAlert size={14} style={{ color: 'var(--red)' }} /> Stop Unusual Expenses
          </button>
          <button
            type="button"
            className={`seg-btn ${activeTab === 'wealth' ? 'active' : ''}`}
            onClick={() => setActiveTab('wealth')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Lightbulb size={14} style={{ color: 'var(--amber)' }} /> Wealth Roadmap
          </button>
        </div>

        {/* Body Content */}
        <div className="modal-body" style={{ minHeight: '320px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text3)' }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: '12px', color: 'var(--teal)' }} />
              <div>Analyzing transaction patterns & generating AI strategies...</div>
            </div>
          ) : (
            <>
              {/* Tab 1: Investment Strategy */}
              {activeTab === 'investment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--text2)', marginBottom: '4px' }}>
                    📈 Smart asset allocation suggestions for surplus cash:
                  </div>

                  {(data?.investments || []).map((inv, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'var(--bg2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--text1)' }}>{inv.title}</strong>
                        <span className="badge badge-teal">{inv.estReturn}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5 }}>{inv.detail}</p>
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Risk level: {inv.riskLevel}</span>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => toast(`Added "${inv.title}" to your investment portfolio watchlist`, 'success')}
                        >
                          Start Strategy <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Stop Unusual Expenses */}
              {activeTab === 'cutbacks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--text2)', marginBottom: '4px' }}>
                    🛑 Flagged spending anomalies & unnecessary recurring expenses:
                  </div>

                  {(data?.expenseCutbacks || []).map((cut, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'var(--bg2)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--red)' }}>{cut.title}</strong>
                        <span className="badge badge-expense">Save {cut.potentialSavings}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5 }}>{cut.detail}</p>
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => toast(`Applied spending cap: ${cut.title}`, 'info')}
                        >
                          Cap / Stop Expense
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Wealth Acceleration */}
              {activeTab === 'wealth' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--text2)', marginBottom: '4px' }}>
                    💡 Actionable financial roadmap to increase net worth:
                  </div>

                  {(data?.wealthAdvice || []).map((w, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'var(--bg2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <strong style={{ fontSize: '14px', color: 'var(--amber)', display: 'block', marginBottom: '6px' }}>
                        Goal {idx + 1}: {w.goal}
                      </strong>
                      <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5 }}>{w.step}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={fetchSuggestions} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh AI Analysis
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
