import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import SquadMaker from './pages/SquadMaker';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/heatmap">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="squad-maker" element={<SquadMaker />} />
          <Route path="history" element={<div className="empty-state"><p>History - Coming Soon</p></div>} />
          <Route path="settings" element={<div className="empty-state"><p>Settings - Coming Soon</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;