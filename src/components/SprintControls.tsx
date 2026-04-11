import React, { useState } from 'react';
import type { SprintSettings } from '../types';
import './SprintControls.css';

interface SprintControlsProps {
  settings: SprintSettings;
  onChange: (settings: SprintSettings) => void;
}

const SprintControls: React.FC<SprintControlsProps> = ({ settings, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="sprint-controls">
      <button
        className="sprint-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Opcje sprintów</span>
        <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="sprint-controls-content">

      <div className="control-item">
        <label>
          <span>Minimalna prędkość: {settings.minSpeed} km/h</span>
          <input
            type="range"
            min="15"
            max="25"
            step="0.5"
            value={settings.minSpeed}
            onChange={(e) => onChange({ ...settings, minSpeed: parseFloat(e.target.value) })}
          />
        </label>
        <small>Próg prędkości do wykrycia sprintu</small>
      </div>

      <div className="control-item">
        <label>
          <span>Minimalny czas: {settings.minDuration}s</span>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={settings.minDuration}
            onChange={(e) => onChange({ ...settings, minDuration: parseFloat(e.target.value) })}
          />
        </label>
        <small>Jak długo musi trwać sprint</small>
      </div>

      <div className="control-item">
        <label>
          <span>Minimalny dystans: {settings.minDistance}m</span>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={settings.minDistance}
            onChange={(e) => onChange({ ...settings, minDistance: parseInt(e.target.value) })}
          />
        </label>
        <small>Minimalna długość sprintu</small>
      </div>

      <div className="control-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.simplified}
            onChange={(e) => onChange({ ...settings, simplified: e.target.checked })}
          />
          <span>Uproszczone strzałki</span>
        </label>
        <small>Proste linie zamiast szczegółowych ścieżek</small>
      </div>

      <div className="control-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.showNumbers}
            onChange={(e) => onChange({ ...settings, showNumbers: e.target.checked })}
          />
          <span>Numeruj sprinty</span>
        </label>
        <small>Pokaż numery przy strzałkach</small>
      </div>

        </div>
      )}
    </div>
  );
};

export default SprintControls;
