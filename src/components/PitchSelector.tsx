import React from 'react';
import { getPitchesList } from '../config/pitches';
import './PitchSelector.css';

const PitchSelector = ({ selectedPitchId, onChange }) => {
  const pitches = getPitchesList();

  return (
    <div className="pitch-selector">
      <label htmlFor="pitch-select" className="pitch-selector-label">
        Wybierz boisko:
      </label>
      <select
        id="pitch-select"
        value={selectedPitchId}
        onChange={(e) => onChange(e.target.value)}
        className="pitch-selector-dropdown"
      >
        {pitches.map(pitch => (
          <option key={pitch.id} value={pitch.id}>
            {pitch.name} - {pitch.location}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PitchSelector;
