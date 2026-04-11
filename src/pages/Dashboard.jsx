import React from 'react';
import { useApp } from '../context/AppContext';
import FileSelector from '../components/FileSelector';
import SessionsTable from '../components/SessionsTable';
import '../App.css';

const Dashboard = () => {
  const {
    sessions,
    handleFileLoad,
    handleLoadPerformance
  } = useApp();

  return (
    <>
      <header className="app-header">
        <h1 className="app-header-title">DASHBOARD</h1>
        <p className="app-header-subtitle">Witaj ponownie. Twoje dane są gotowe do analizy.</p>
      </header>

      <FileSelector
        onFileLoad={handleFileLoad}
        onLoadPerformance={handleLoadPerformance}
      />

      {sessions.length > 0 && (
        <SessionsTable sessions={sessions} />
      )}
    </>
  );
};

export default Dashboard;
