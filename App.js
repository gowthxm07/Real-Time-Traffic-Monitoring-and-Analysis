import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import UserDashboard from './UserDashboard';
import PoliceDashboard from './PoliceDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/police" element={<PoliceDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;