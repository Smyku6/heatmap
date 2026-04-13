import React, { useState } from 'react';

import type { HeatmapSettings } from '../types';
import './HeatmapControls.css';

interface HeatmapControlsProps {
  settings: HeatmapSettings;
  onChange: (settings: HeatmapSettings) => void;
}

const HeatmapControls: React.FC<HeatmapControlsProps> = ({ settings, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="heatmap-controls">
      <button className="heatmap-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <span>Opcje heatmapy</span>
        <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="heatmap-controls-content">
          <div className="control-item">
            <label>
              <span>Paleta kolorów</span>
              <select
                value={settings.colorPalette}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    colorPalette: e.target.value as HeatmapSettings['colorPalette']
                  })
                }
              >
                <option value="classic">Klasyczna (niebieski→czerwony)</option>
                <option value="thermal">Termalna (czarny→czerwony)</option>
                <option value="purple">Fioletowa (fiolet→żółty)</option>
                <option value="mono">Monochromatyczna (cyan)</option>
              </select>
            </label>
          </div>

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

          <div className="control-item">
            <label>
              <span>Próg minimalny: {settings.minThreshold}%</span>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={settings.minThreshold}
                onChange={(e) => onChange({ ...settings, minThreshold: parseInt(e.target.value) })}
              />
            </label>
            <small>Ukrywa obszary o niskiej aktywności</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatmapControls;
