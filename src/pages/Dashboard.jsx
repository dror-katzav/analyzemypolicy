import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '4rem', color: 'white' }}>
      <h1>Dashboard (Placeholder)</h1>
      <p>Welcome to your authenticated dashboard.</p>
      <button 
        style={{ marginTop: '2rem', padding: '1rem', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        Sign Out
      </button>
    </div>
  );
};
export default Dashboard;
