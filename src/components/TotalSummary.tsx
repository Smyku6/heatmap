import React from 'react';
import './TotalSummary.css';

interface TotalSummaryProps {
  totalDuration: { formatted: string; seconds: number } | string;
  totalDistance: { formatted: string; meters: number } | number;
  totalAvgHeartRate: number | null;
  totalPointCount: number;
}

const TotalSummary: React.FC<TotalSummaryProps> = ({
  totalDuration,
  totalDistance,
  totalAvgHeartRate,
  totalPointCount
}) => {
  return (
    <div className="total-summary">
      <h2 className="total-title">TOTAL - Podsumowanie</h2>
      <div className="total-stats">
        {totalDuration && (
          <div className="total-stat-item">
            <span className="total-stat-label">Całkowity czas:</span>
            <span className="total-stat-value">
              {typeof totalDuration === 'string' ? totalDuration : totalDuration.formatted}
            </span>
          </div>
        )}
        {totalDistance !== undefined && (
          <div className="total-stat-item">
            <span className="total-stat-label">Całkowity dystans:</span>
            <span className="total-stat-value">
              {typeof totalDistance === 'number'
                ? (totalDistance / 1000).toFixed(2)
                : (totalDistance.meters / 1000).toFixed(2)}{' '}
              km
            </span>
          </div>
        )}
        {totalAvgHeartRate && (
          <div className="total-stat-item">
            <span className="total-stat-label">Średnie tętno:</span>
            <span className="total-stat-value">{totalAvgHeartRate} bpm</span>
          </div>
        )}
        <div className="total-stat-item">
          <span className="total-stat-label">Wszystkie punkty GPS:</span>
          <span className="total-stat-value">{totalPointCount}</span>
        </div>
      </div>
    </div>
  );
};

export default TotalSummary;
