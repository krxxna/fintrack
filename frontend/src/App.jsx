import React, { useState } from 'react';
import { ThemeProvider }  from './contexts/ThemeContext';
import { ToastProvider }  from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData }   from './contexts/DataContext';
import { Sidebar }        from './components/layout/Sidebar';
import { Topbar }         from './components/layout/Topbar';
import Landing            from './pages/Landing';
import { AuthPage }       from './pages/AuthPage';
import { Dashboard }      from './pages/Dashboard';
import { Accounts }       from './pages/Accounts';
import { Transactions }   from './pages/Transactions';
import { Analytics }      from './pages/Analytics';
import { Savings }        from './pages/Savings';
import { Settings }       from './pages/Settings';
import { TransactionModal } from './components/TransactionModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { AiAdvisoryModal } from './components/AiAdvisoryModal';
import { useToast }       from './contexts/ToastContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ── Inner authenticated app view
function AppInner() {
  const { user } = useAuth();
  const { addTransaction, editTransaction } = useData();
  const toast = useToast();

  const [page, setPage] = useState('dashboard');
  const [isAddTxnOpen, setIsAddTxnOpen] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) return <Navigate to="/auth" replace />;

  const handleSaveTxn = (data, id) => {
    if (id) {
      editTransaction(id, data);
      toast('Transaction updated', 'success');
    } else {
      addTransaction(data);
      toast('Transaction added successfully', 'success');
    }
  };

  const pages = {
    dashboard: (
      <Dashboard
        setPage={setPage}
        onOpenAddTxn={() => { setEditTxn(null); setIsAddTxnOpen(true); }}
        onOpenAskAi={() => setIsAskAiOpen(true)}
        onOpenAdvisory={() => setIsAdvisoryOpen(true)}
      />
    ),
    accounts: <Accounts setPage={setPage} />,
    transactions: <Transactions />,
    analytics: <Analytics />,
    savings: <Savings setPage={setPage} />,
    settings: <Settings />,
  };

  return (
    <div className="app-layout">
      {/* Unified Navigation Sidebar */}
      <Sidebar page={page} setPage={setPage} />

      <div className="main-area">
        {/* Unified Top Header Bar */}
        <Topbar
          page={page}
          setPage={setPage}
          onOpenAddTxn={() => { setEditTxn(null); setIsAddTxnOpen(true); }}
          onOpenAskAi={() => setIsAskAiOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Dynamic Page Content */}
        <main className="page-content">
          {pages[page] || pages.dashboard}
        </main>
      </div>

      {/* Global Transaction Modal */}
      {(isAddTxnOpen || editTxn) && (
        <TransactionModal
          txn={editTxn}
          onClose={() => { setIsAddTxnOpen(false); setEditTxn(null); }}
          onSave={handleSaveTxn}
        />
      )}

      {/* Global AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
        setPage={setPage}
        onOpenAdvisory={() => setIsAdvisoryOpen(true)}
      />

      {/* Global AI Advisory Modal */}
      <AiAdvisoryModal
        isOpen={isAdvisoryOpen}
        onClose={() => setIsAdvisoryOpen(false)}
      />
    </div>
  );
}

// ── Auth route guard — redirect to dashboard if logged in
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

// ── Root Application with Context Providers
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
