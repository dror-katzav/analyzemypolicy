import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Wizard from './pages/Wizard';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import Documents from './pages/Documents';
import Advisor from './pages/Advisor';
import { useAuth } from './context/AuthContext';
import { AIChatProvider } from './context/AIChatContext';
import { PoliciesProvider } from './context/PoliciesContext';
import AIChatSidebar from './components/AIChatSidebar';

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

function App() {
  return (
    <PoliciesProvider>
    <AIChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Wizard />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/advisor" element={<ProtectedRoute><Advisor /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
        </Routes>
        <AuthSidebar />
      </Router>
    </AIChatProvider>
    </PoliciesProvider>
  );
}

export default App;
