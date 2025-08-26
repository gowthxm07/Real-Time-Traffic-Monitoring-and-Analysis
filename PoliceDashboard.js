import React, { useState } from 'react';
import TrafficGraph from './TrafficGraph';
import AccidentTable from './AccidentTable';
import Alert from './Alert';

function PoliceDashboard() {
  const [selectedView, setSelectedView] = useState('traffic');

  return (
    <div style={{ padding: '20px' }}>
      <h2>👮 Police Dashboard</h2>
      <select 
        onChange={(e) => setSelectedView(e.target.value)} 
        style={{ padding: '10px', marginBottom: '20px', fontSize: '16px' }}
      >
        <option value="traffic">Traffic Density</option>
        <option value="accidents">Accidents</option>
      </select>
      {selectedView === 'traffic' ? <TrafficGraph /> : <AccidentTable />}
      <Alert />
    </div>
  );
}

export default PoliceDashboard;