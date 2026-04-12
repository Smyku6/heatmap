import React from 'react';

import type { SegmentType } from '../types';
import './SegmentSelector.css';

interface SegmentSelectorProps {
  selectedSegment: SegmentType;
  onChange: (segment: SegmentType) => void;
}

const SegmentSelector: React.FC<SegmentSelectorProps> = ({ selectedSegment, onChange }) => {
  const segments = [
    { id: 'full', label: 'Całość', description: 'Cała aktywność' },
    { id: 'halves', label: '1/2', description: 'Podziel na 2 połowy' },
    { id: 'thirds', label: '1/3 x 3', description: 'Podziel na 3 części' },
    { id: 'quarters', label: '1/4 x 4', description: 'Podziel na 4 ćwiartki' }
  ];

  return (
    <div className="segment-selector">
      <div className="segment-label">Podział czasu:</div>
      <div className="segment-options">
        {segments.map(segment => (
          <label key={segment.id} className="segment-option">
            <input
              type="radio"
              name="segment"
              value={segment.id}
              checked={selectedSegment === segment.id}
              onChange={(e) => onChange(e.target.value as SegmentType)}
            />
            <span className="segment-button">
              <span className="segment-title">{segment.label}</span>
              <span className="segment-desc">{segment.description}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SegmentSelector;
