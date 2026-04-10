import React from 'react';
import './HeatmapControls.css';

const HeatmapControls = ({ settings, onChange }) => {
  return (
    <div className="heatmap-controls">
      <h4>Ustawienia heatmapy</h4>

      <div className="control-item">
        <label>
          <span>Promień: {settings.intensity}px</span>
          <input
            type="range"
            min="10"
            max="80"
            step="5"
            value={settings.intensity}
            onChange={(e) => onChange({ ...settings, intensity: parseInt(e.target.value) })}
          />
        </label>
      </div>

      <div className="control-item">
        <label>
          <span>Przezroczystość: {Math.round(settings.opacity * 100)}%</span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.opacity * 100}
            onChange={(e) => onChange({ ...settings, opacity: parseInt(e.target.value) / 100 })}
          />
        </label>
      </div>

      <div className="control-item">
        <label>
          <span>Agregacja: {settings.densityRadius}px</span>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={settings.densityRadius}
            onChange={(e) => onChange({ ...settings, densityRadius: parseInt(e.target.value) })}
          />
        </label>
        <small>Im większa wartość, tym bardziej rozmyte skupiska</small>
      </div>
    </div>
  );
};

export default HeatmapControls;
