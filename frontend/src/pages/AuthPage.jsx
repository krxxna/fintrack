import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { useAuth }  from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function AuthPage() {
  const { login, signup, demoLogin, loading } = useAuth();
  const toast = useToast();

  const [mode,   setMode]   = useState('login'); // 'login' | 'signup'
  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [pw,     setPw]     = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error,  setError]  = useState('');

  const reset = () => { setName(''); setEmail(''); setPw(''); setError(''); };

  const handleSubmit = async () => {
    setError('');
    if (!email || !pw) { setError('Please fill all required fields.'); return; }
    if (mode === 'signup' && !name) { setError('Name is required.'); return; }
    if (pw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      if (mode === 'login') {
        await login(email, pw);
        toast('Welcome back!', 'success');
      } else {
        await signup(name, email, pw);
        toast('Account created — welcome!', 'success');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    }
  };

  const handleDemo = async () => {
    setError('');
    try {
      await demoLogin();
      toast('Welcome to FinTrack!', 'success');
    } catch {}
  };

  const switchMode = (m) => { setMode(m); reset(); };

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <div className="auth-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div className="logo-mark">F</div>
          <div>
            <div className="logo-text">FinTrack</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Personal Finance</div>
          </div>
        </div>

        <div className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</div>
        <div className="auth-sub">
          {mode === 'login'
            ? 'Sign in to your financial dashboard'
            : 'Start tracking your money today'}
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Name (signup only) */}
        {mode === 'signup' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <span className="input-addon input-addon-left"><User size={14} /></span>
              <input
                className="form-input has-left"
                placeholder="Alex Morgan"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-group">
            <span className="input-addon input-addon-left"><Mail size={14} /></span>
            <input
              className="form-input has-left"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-group">
            <span className="input-addon input-addon-left"><Lock size={14} /></span>
            <input
              className="form-input has-left has-right"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <span className="input-addon input-addon-right" onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', height: 42 }}
        >
          {loading
            ? <><RefreshCw size={14} className="spin" /> Please wait…</>
            : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <div className="auth-divider-text">or</div>
          <div className="auth-divider-line" />
        </div>

        {/* Demo */}
        <button
          className="btn btn-ghost"
          onClick={handleDemo}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Zap size={14} style={{ color: 'var(--amber)' }} />
          Try Demo Account
        </button>

        {/* Switch mode */}
        <div className="auth-switch">
          {mode === 'login' ? (
            <>Don't have an account? <span onClick={() => switchMode('signup')}>Sign up free</span></>
          ) : (
            <>Already have an account? <span onClick={() => switchMode('login')}>Sign in</span></>
          )}
        </div>
      </div>
    </div>
  );
}
