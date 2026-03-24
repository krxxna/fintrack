import React, { useState } from 'react';
import { ThemeProvider }  from './contexts/ThemeContext';
import { ToastProvider }  from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider }   from './contexts/DataContext';
import { Sidebar }        from './components/layout/Sidebar';
import { Topbar }         from './components/layout/Topbar';
import Landing       from './pages/Landing';
import { AuthPage }       from './pages/AuthPage';
import { Dashboard }      from './pages/Dashboard';
import { Transactions }   from './pages/Transactions';
import { Analytics }      from './pages/Analytics';
import { Settings }       from './pages/Settings';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ── Inner app (uses auth context)
function AppInner() {
  const { user } = useAuth();
  const [page, setPage]  = useState('dashboard');

  if (!user) return <Navigate to="/auth" replace />;
  
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

// ── Auth route guard — redirect to dashboard if already logged in
function AuthRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <AuthPage />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/dashboard/*" element={<AppInner />} />
      </Routes>
    </Router>
  );
}

// ── Root with all providers
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
