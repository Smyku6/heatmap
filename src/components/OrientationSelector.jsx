import React from 'react';
import './OrientationSelector.css';

const OrientationSelector = ({ selectedOrientation, onChange }) => {
  const orientations = [
    { id: 'original', label: 'Oryginalny', description: 'Bez obrotu' },
    { id: 'vertical', label: 'Pionowy', description: 'Boisko pionowo' },
    { id: 'horizontal', label: 'Poziomy', description: 'Boisko poziomo' }
  ];

  return (
    <div className="orientation-selector">
      <div className="orientation-label">Orientacja boiska:</div>
      <div className="orientation-options">
        {orientations.map(orientation => (
          <label key={orientation.id} className="orientation-option">
            <input
              type="radio"
              name="orientation"
              value={orientation.id}
              checked={selectedOrientation === orientation.id}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="orientation-button">
              <span className="orientation-title">{orientation.label}</span>
              <span className="orientation-desc">{orientation.description}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default OrientationSelector;
