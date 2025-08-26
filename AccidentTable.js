import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { firestore as db } from './firebase';

function AccidentTable() {
  const [accidents, setAccidents] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'accidents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccidents(data);
    });
    return unsubscribe;
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h3>🚨 Accident Data</h3>
      <table>
        <thead>
          <tr>
            <th>Area Name</th>
            <th>Area Number</th>
            <th>Time</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {accidents.map((item) => (
            <tr key={item.id}>
              <td>{item.areaName}</td>
              <td>{item.areaNumber}</td>
              <td>{item.time}</td>
              <td>{item.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AccidentTable;