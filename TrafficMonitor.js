// src/TrafficMonitor.js
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

function TrafficMonitor() {
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
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "linear-gradient(to right, #dfe9f3, #ffffff)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        🚦 Real-Time Traffic Monitoring Dashboard
      </h2>

      {/* Graph Section */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: "40px",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>📈 Traffic Level Chart</h3>
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
      </div>

      {/* Logs Section */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>📝 Live Traffic Logs</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ background: "#f4f4f4" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Timestamp</th>
              <th style={{ padding: "10px", textAlign: "left" }}>
                Traffic Level
              </th>
              <th style={{ padding: "10px", textAlign: "left" }}>
                Vehicle Count
              </th>
            </tr>
          </thead>
          <tbody>
            {trafficData.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: "10px" }}>{item.timestamp}</td>
                <td style={{ padding: "10px" }}>{item.traffic_level}</td>
                <td style={{ padding: "10px" }}>{item.vehicle_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TrafficMonitor;
