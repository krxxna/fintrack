import React, { useState } from 'react';
import { X, Sparkles, Wand2, Send, Bot, ArrowRight, ShieldAlert, TrendingUp, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../hooks/useCurrency';
import { fmt } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';
import { aiAPI } from '../services/api';

export function AiAssistantDrawer({ isOpen, onClose, setPage, onOpenAdvisory }) {
  const { user } = useAuth();
  const { transactions, getSummary, getCategoryData } = useData();
  const currency = useCurrency();
  const toast = useToast();

  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your FinTrack AI Advisor. Ask me about investments, stopping unusual expenses, or growing your savings!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const summary = getSummary(transactions);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      // Call backend AI route
      const res = await aiAPI.askChat(text, summary);
      const replyText = res.data?.reply || `Based on your balance of ${fmt(summary.balance, currency)}, allocating 20% to SIPs or low-cost index funds is recommended.`;

      let action = null;
      if (text.toLowerCase().includes('invest')) {
        action = { label: 'Open Investment Hub', type: 'advisory' };
      } else if (text.toLowerCase().includes('spend') || text.toLowerCase().includes('expense')) {
        action = { label: 'View Transactions', page: 'transactions' };
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: replyText,
          action,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Based on your recent transactions, your net surplus is ${fmt(summary.balance, currency)}. Keeping category spending below 75% will boost monthly investments by +20%.`,
          action: { label: 'Open Investment Hub', type: 'advisory' },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ai-drawer">
        {/* Header */}
        <div className="ai-drawer-header">
          <div className="ai-drawer-title">
            <div className="ai-badge-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>FinTrack AI Assistant</h3>
              <p>Personalized financial intelligence</p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="ai-chips">
          <button type="button" onClick={() => handleSend('How to do more investment?')}>
            <TrendingUp size={13} style={{ color: 'var(--teal)' }} /> 📈 Investment strategy
          </button>
          <button type="button" onClick={() => handleSend('How to stop unusual expenses?')}>
            <ShieldAlert size={13} style={{ color: 'var(--red)' }} /> 🛑 Stop unusual expenses
          </button>
          <button type="button" onClick={() => handleSend('Give me smart savings advice')}>
            <Wand2 size={13} style={{ color: 'var(--amber)' }} /> 💡 Savings advice
          </button>
        </div>

        {/* Messages Body */}
        <div className="ai-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`ai-msg-bubble ${msg.sender}`}>
              <div className="ai-msg-header">
                <span className="ai-msg-sender">{msg.sender === 'ai' ? 'FinTrack AI' : 'You'}</span>
                <span className="ai-msg-time">{msg.timestamp}</span>
              </div>
              <p className="ai-msg-text">{msg.text}</p>
              {msg.action && (
                <button
                  type="button"
                  className="ai-msg-action"
                  onClick={() => {
                    if (msg.action.type === 'advisory' && onOpenAdvisory) {
                      onOpenAdvisory();
                      onClose();
                    } else if (msg.action.page) {
                      setPage(msg.action.page);
                      onClose();
                    }
                  }}
                >
                  {msg.action.label} <ArrowRight size={14} />
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div className="ai-msg-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={14} className="spin" /> Thinking...
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div style={{ padding: '8px 16px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (onOpenAdvisory) onOpenAdvisory();
              onClose();
            }}
            style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
          >
            <TrendingUp size={13} style={{ color: 'var(--teal)' }} /> Open Full AI Investment & Advisory Hub
          </button>
        </div>

        {/* Input Bar */}
        <div className="ai-drawer-footer">
          <input
            type="text"
            className="ai-input"
            placeholder="Ask AI about investments, expenses..."
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button type="button" className="ai-send-btn" onClick={() => handleSend()} disabled={loading}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
