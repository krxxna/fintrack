import React, { useState } from 'react';
import { ThemeProvider }  from './contexts/ThemeContext';
import { ToastProvider }  from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider }   from './contexts/DataContext';
import { Sidebar }        from './components/layout/Sidebar';
import { Topbar }         from './components/layout/Topbar';
import { AuthPage }       from './pages/AuthPage';
import { Dashboard }      from './pages/Dashboard';
import { Transactions }   from './pages/Transactions';
import { Analytics }      from './pages/Analytics';
import { Settings }       from './pages/Settings';

// ── Inner app (uses auth context)
function AppInner() {
  const { user } = useAuth();
  const [page, setPage]  = useState('dashboard');

  if (!user) return <AuthPage />;

  const pages = {
    dashboard:    <Dashboard    setPage={setPage} />,
    transactions: <Transactions />,
    analytics:    <Analytics    />,
    settings:     <Settings     />,
  };

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} />
      <div className="main-area">
        <Topbar page={page} setPage={setPage} />
        <main className="page-content">
          {pages[page] || pages.dashboard}
        </main>
      </div>
    </div>
  );
}

// ── Root with all providers
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <AppInner />
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
