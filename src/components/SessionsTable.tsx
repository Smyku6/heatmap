import React from 'react';
import { useNavigate } from 'react-router-dom';

import { isDurationObject, isDistanceObject } from '../utils/typeGuards';

import type { Session } from '../types';
import './SessionsTable.css';

interface SessionsTableProps {
  sessions: Session[];
}

const SessionsTable: React.FC<SessionsTableProps> = ({ sessions }) => {
  const navigate = useNavigate();

  const handleAnalyze = (sessionId: string) => {
    void navigate('/analysis', { state: { sessionId } });
  };

  const formatDuration = (duration: string | { formatted: string } | undefined): string => {
    if (!duration) {return '-';}

    // Use type guard for safe property access
    const durationStr = isDurationObject(duration) ? duration.formatted : String(duration);
    if (!durationStr) {return '-';}

    const match = durationStr.match(/(\d+)h (\d+)m (\d+)s/);
    if (!match) {return durationStr;}
    const [, hours, minutes, seconds] = match;
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  };

  const formatDistance = (distance: string | number | { formatted: string } | undefined): string => {
    if (!distance) {return '-';}

    // Use type guard for safe property access
    let distanceStr: string;
    if (typeof distance === 'number') {
      distanceStr = (distance / 1000).toFixed(2);
    } else if (isDistanceObject(distance)) {
      distanceStr = distance.formatted.replace(' km', '');
    } else if (typeof distance === 'string') {
      distanceStr = distance.replace(' km', '');
    } else {
      distanceStr = '0';
    }
    return parseFloat(distanceStr).toFixed(2);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) {return '-';}
    if (date instanceof Date) {
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    return date;
  };

  if (sessions.length === 0) {
    return (
      <div className="sessions-empty">
        <span className="material-symbols-outlined">inbox</span>
        <p>Brak załadowanych sesji treningowych</p>
      </div>
    );
  }

  return (
    <div className="sessions-table-container">
      <div className="sessions-table-header">
        <h2 className="sessions-table-title">Twoje sesje treningowe</h2>
        <p className="sessions-table-subtitle">Kliknij &quot;Analizuj&quot; aby zobaczyć szczegółową analizę</p>
      </div>

      <div className="sessions-table-wrapper">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Boisko</th>
              <th>Czas trwania</th>
              <th>Dystans</th>
              <th>Średnie tętno</th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>
                  <div className="cell-content">
                    <span className="material-symbols-outlined cell-icon icon-date">calendar_today</span>
                    <span className="cell-text">{formatDate(session.activityDate)}</span>
                  </div>
                </td>
                <td>
                  <div className="cell-content">
                    <span className="material-symbols-outlined cell-icon icon-pitch">location_on</span>
                    <span className="cell-text">{session.pitchInfo?.name || 'Nieznane boisko'}</span>
                  </div>
                </td>
                <td>
                  <div className="cell-content">
                    <span className="material-symbols-outlined cell-icon icon-duration">schedule</span>
                    <span className="cell-text">{formatDuration(session.totalDuration)}</span>
                  </div>
                </td>
                <td>
                  <div className="cell-content">
                    <span className="material-symbols-outlined cell-icon icon-distance">route</span>
                    <span className="cell-text">{formatDistance(session.totalDistance)} km</span>
                  </div>
                </td>
                <td>
                  <div className="cell-content">
                    <span className="material-symbols-outlined cell-icon icon-heart">favorite</span>
                    <span className="cell-text">{session.totalAvgHeartRate ?? '-'} bpm</span>
                  </div>
                </td>
                <td>
                  <button
                    className="analyze-btn"
                    onClick={() => handleAnalyze(session.id)}
                  >
                    <span className="material-symbols-outlined">analytics</span>
                    <span>Analizuj</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionsTable;
