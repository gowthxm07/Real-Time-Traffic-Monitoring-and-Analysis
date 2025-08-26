import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>🚦 Traffic Monitoring System</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px' }}>Choose your role:</p>
      <button 
        style={{ backgroundColor: '#4CAF50', color: 'white' }} 
        onClick={() => navigate('/user')}
      >
        User
      </button>
      <button 
        style={{ backgroundColor: '#2196F3', color: 'white' }} 
        onClick={() => navigate('/police')}
      >
        Police
      </button>
    </div>
  );
}

export default Home;