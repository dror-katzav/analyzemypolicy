import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Wizard from './pages/Wizard';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import Documents from './pages/Documents';
import Advisor from './pages/Advisor';
import Security from './pages/Security';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';
import { AIChatProvider } from './context/AIChatContext';
import { PoliciesProvider } from './context/PoliciesContext';
import AIChatSidebar from './components/AIChatSidebar';

const PAGE_TITLES = {
  '/': 'AnalyzeMyPolicy — Institutional-Grade Policy Monitoring',
  '/analyze': 'Analyze a Policy — AnalyzeMyPolicy',
  '/dashboard': 'Dashboard — AnalyzeMyPolicy',
  '/documents': 'Documents — AnalyzeMyPolicy',
  '/advisor': 'Advisor — AnalyzeMyPolicy',
  '/security': 'Security & Privacy — AnalyzeMyPolicy',
};

function TitleManager() {
  const location = useLocation();
  useEffect(() => {
    const base = '/' + (location.pathname.split('/')[1] ?? '');
    document.title = PAGE_TITLES[base] ?? PAGE_TITLES[location.pathname] ?? 'AnalyzeMyPolicy';
  }, [location.pathname]);
  return null;
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  // lg:mr-[300px] reserves space for the permanent 300px AI sidebar on desktop
  return <div className="lg:mr-[300px]">{children}</div>;
};

// Renders the sidebar only when authenticated
const AuthSidebar = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AIChatSidebar /> : null;
};

// Public page that still needs sidebar margin when user is logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated
    ? <div className="lg:mr-[300px]">{children}</div>
    : <>{children}</>;
};

function App() {
  return (
    <PoliciesProvider>
    <AIChatProvider>
      <Router>
        <TitleManager />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Wizard />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/advisor" element={<ProtectedRoute><Advisor /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/security" element={<PublicRoute><Security /></PublicRoute>} />
          <Route path="*" element={<PublicRoute><NotFound /></PublicRoute>} />
        </Routes>
        <AuthSidebar />
      </Router>
    </AIChatProvider>
    </PoliciesProvider>
  );
}

export default App;
