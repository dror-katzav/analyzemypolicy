import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div style={{ padding: '4rem', color: 'white' }}>
      <h1>Shareable Report</h1>
      <p>Viewing report ID: {id}</p>
      <button 
        style={{ marginTop: '2rem', padding: '1rem', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        Back home
      </button>
    </div>
  );
};
export default Report;
