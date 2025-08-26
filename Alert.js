import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { firestore as db } from './firebase';

function Alert() {
  const [alertMessage, setAlertMessage] = useState(null);
  const HIGH_TRAFFIC_DURATION = 5 * 60 * 1000; // 5 minutes in ms

  useEffect(() => {
    const q = query(collection(db, 'traffic_logs'), orderBy('timestamp', 'desc'), limit(10)); // Last 10 logs
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recentLogs = snapshot.docs.map(doc => doc.data());
      // Check if last 5 logs (assuming 10s interval) are 'High'
      const highTrafficLogs = recentLogs.filter(log => log.traffic_level === 'High');
      if (highTrafficLogs.length >= 5) { // ~50s, adjust based on upload interval
        const firstHigh = new Date(highTrafficLogs[highTrafficLogs.length - 1].timestamp);
        const lastHigh = new Date(highTrafficLogs[0].timestamp);
        if (lastHigh - firstHigh >= HIGH_TRAFFIC_DURATION) {
          setAlertMessage(`High Traffic Alert in ${highTrafficLogs[0].area || 'Area'}! Dispatch to nearby station.`);
        } else {
          setAlertMessage(null);
        }
      } else {
        setAlertMessage(null);
      }
    });
    return unsubscribe;
  }, []);

  if (!alertMessage) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#FF0000',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      zIndex: 1000,
      textAlign: 'center'
    }}>
      <h2>⚠️ ALERT</h2>
      <p>{alertMessage}</p>
      <button onClick={() => setAlertMessage(null)} style={{ backgroundColor: 'white', color: '#FF0000' }}>Dismiss</button>
    </div>
  );
}

export default Alert;