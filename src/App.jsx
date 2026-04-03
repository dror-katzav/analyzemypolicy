import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Wizard from './pages/Wizard';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyze" element={<Wizard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report/:id" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;
