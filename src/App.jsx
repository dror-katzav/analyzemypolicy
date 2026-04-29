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
import AIChatSidebar from './components/AIChatSidebar';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AIChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Wizard />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/documents"
            element={<ProtectedRoute><Documents /></ProtectedRoute>}
          />
          <Route
            path="/advisor"
            element={<ProtectedRoute><Advisor /></ProtectedRoute>}
          />
          <Route
            path="/report/:id"
            element={<ProtectedRoute><Report /></ProtectedRoute>}
          />
        </Routes>
        <AIChatSidebar />
      </Router>
    </AIChatProvider>
  );
}

export default App;
