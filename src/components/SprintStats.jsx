import React from 'react';
import './SprintStats.css';

const SprintStats = ({ sprints }) => {
  if (!sprints || sprints.length === 0) {
    return (
      <div className="sprint-stats">
        <h4>📊 Statystyki sprintów</h4>
        <p className="no-sprints">Nie wykryto sprintów</p>
      </div>
    );
  }

  const totalDistance = sprints.reduce((sum, s) => sum + s.distance, 0);
  const avgDistance = totalDistance / sprints.length;
  const avgDuration = sprints.reduce((sum, s) => sum + s.duration, 0) / sprints.length;
  const maxSpeed = Math.max(...sprints.map(s => s.maxSpeed));
  const avgSpeed = sprints.reduce((sum, s) => sum + s.avgSpeed, 0) / sprints.length;

  return (
    <div className="sprint-stats">
      <h4>📊 Statystyki sprintów</h4>
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Liczba sprintów</span>
          <span className="stat-value">{sprints.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Łączny dystans</span>
          <span className="stat-value">{totalDistance.toFixed(0)}m</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Średnia długość</span>
          <span className="stat-value">{avgDistance.toFixed(1)}m</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Średni czas</span>
          <span className="stat-value">{avgDuration.toFixed(1)}s</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Max prędkość</span>
          <span className="stat-value highlight">{maxSpeed.toFixed(1)} km/h</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Średnia prędkość</span>
          <span className="stat-value">{avgSpeed.toFixed(1)} km/h</span>
        </div>
      </div>
    </div>
  );
};

export default SprintStats;
