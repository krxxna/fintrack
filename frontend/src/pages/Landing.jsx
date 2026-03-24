import React, { useState, useEffect } from 'react';
import { Wallet, BarChart3, Shield, Globe, ArrowRight, Moon, Sun } from 'lucide-react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved ? saved === 'dark' : true;
    setIsDark(dark);
    document.documentElement.classList.toggle('light', !dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('light', !newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  return (
    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

const Landing = () => {
  return (
    <div className="landing-page">
      {/* ── Navbar ────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <a href="/" className="landing-brand">
            <div className="landing-brand-icon">
              <Wallet size={22} />
            </div>
            <div className="landing-brand-text">
              <h1>Fintrack</h1>
              <p>Modern Finance Dashboard</p>
            </div>
          </a>

          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#demo" className="landing-nav-link">Demo</a>
            <ThemeToggle />
            <a href="/auth" className="landing-nav-cta">Get Started</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <h1 className="landing-fade-up">
            Master your <span>finances</span>
          </h1>
          <p className="landing-fade-up landing-fade-up-delay-1">
            Track expenses, analyze spending patterns, multi-currency support, and achieve financial clarity with our beautifully designed dashboard.
          </p>
          <div className="landing-hero-actions landing-fade-up landing-fade-up-delay-2">
            <a href="/auth" className="landing-hero-btn-primary">
              <span>Start Free Trial</span>
              <ArrowRight size={18} />
            </a>
            <a href="/auth" className="landing-hero-btn-secondary">
              Watch Demo
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="landing-features" id="features">
        <div className="landing-section-label">Features</div>
        <h2 className="landing-section-title">Everything you need</h2>
        <p className="landing-section-desc">
          Powerful tools to take control of your financial life, all in one place.
        </p>

        <div className="landing-features-grid">
          <div className="landing-feature-card landing-fade-up landing-fade-up-delay-1">
            <div className="landing-feature-icon teal">
              <BarChart3 size={22} />
            </div>
            <h3>Real-time Tracking</h3>
            <p>Every transaction instantly categorized and tracked with smart analytics.</p>
          </div>

          <div className="landing-feature-card landing-fade-up landing-fade-up-delay-2">
            <div className="landing-feature-icon purple">
              <Moon size={22} />
            </div>
            <h3>Dark / Light Mode</h3>
            <p>Beautiful themes for day or night viewing with seamless switching.</p>
          </div>

          <div className="landing-feature-card landing-fade-up landing-fade-up-delay-3">
            <div className="landing-feature-icon green">
              <Shield size={22} />
            </div>
            <h3>Privacy First</h3>
            <p>Your data stays yours forever. Secure authentication and encryption.</p>
          </div>

          <div className="landing-feature-card landing-fade-up landing-fade-up-delay-4">
            <div className="landing-feature-icon amber">
              <Globe size={22} />
            </div>
            <h3>Multi-currency</h3>
            <p>$ € £ ₹ ¥ — automatic switching and real-time conversions.</p>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ──────────────────────────────────────────── */}
      <section className="landing-stats" id="demo">
        <div className="landing-stats-inner">
          <div className="landing-stat-item">
            <h3>10K+</h3>
            <p>Active Users</p>
          </div>
          <div className="landing-stat-item">
            <h3>$2M+</h3>
            <p>Tracked Monthly</p>
          </div>
          <div className="landing-stat-item">
            <h3>99.9%</h3>
            <p>Uptime</p>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <h2>Ready to get started?</h2>
          <p>No credit card needed. Free forever.</p>
          <a href="/auth" className="landing-hero-btn-primary">
            <span>Start Free Trial</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <p>&copy; 2024 Fintrack. Built with ❤️. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
