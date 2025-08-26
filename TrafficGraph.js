// (Copy your original TrafficMonitor.js content here, but rename the component to TrafficGraph)
// Add CSS import if needed: import './TrafficMonitor.css';
// For multi-area, add a prop for area and filter query with where('area', '==', area)
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { firestore as db } from "./firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import './TrafficMonitor.css'; // New CSS file

function TrafficGraph() {
  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "traffic_logs"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrafficData(newData);
    });

    return () => unsubscribe();
  }, []);

  const chartData = trafficData.map((item) => ({
    timestamp: item.timestamp,
    level:
      item.traffic_level === "Low"
        ? 1
        : item.traffic_level === "Medium"
        ? 2
        : 3,
  }));

  const getLevelText = (levelNum) =>
    levelNum === 1 ? "Low" : levelNum === 2 ? "Medium" : "High";

  return (
    <div className="traffic-graph">
      <h3>📈 Traffic Level Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 10 }}
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            domain={[0, 4]}
            ticks={[1, 2, 3]}
            tickFormatter={getLevelText}
            width={80}
          />
          <Tooltip
            formatter={(value) => getLevelText(value)}
            labelStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="level"
            stroke="#8884d8"
            strokeWidth={3}
            dot={{ r: 4 }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>

      <h3>📝 Live Traffic Logs</h3>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Traffic Level</th>
            <th>Vehicle Count</th>
          </tr>
        </thead>
        <tbody>
          {trafficData.map((item) => (
            <tr key={item.id}>
              <td>{item.timestamp}</td>
              <td>{item.traffic_level}</td>
              <td>{item.vehicle_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TrafficGraph;