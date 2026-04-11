import React from 'react';
import Pitch from './Pitch';
import { DEFAULT_PITCH_ID } from '../config/pitches';
import { prepareVisualizationData } from '../utils/tcxParser';
import './SquadMaker.css';

const SquadMaker = () => {
  // Przygotuj wizualizację z pustymi punktami tracking (używamy dokładnie tej samej logiki co główny widok)
  const emptyPoints = [];
  const vizData = prepareVisualizationData(
    emptyPoints,
    'full',
    DEFAULT_PITCH_ID,
    'original',
    null
  );

  // Generuj 14 graczy
  const players = Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    name: `Player ${i + 1}`
  }));

  return (
    <div className="squad-maker">
      <div className="squad-maker-header">
        <div className="squad-maker-title-section">
          <h1 className="squad-maker-title">SQUAD MAKER</h1>
          <p className="squad-maker-subtitle">Design your perfect formation</p>
        </div>
        <div className="squad-maker-badge-section">
          <div className="under-construction-badge">
            <span className="material-symbols-outlined">construction</span>
            <span>Under Construction</span>
          </div>
        </div>
      </div>

      <div className="squad-maker-info-top">
        <div className="info-card">
          <span className="material-symbols-outlined">info</span>
          <div className="info-content">
            <h3>Coming Soon</h3>
            <p>This feature is currently under development. Soon you'll be able to:</p>
            <ul>
              <li>Create custom formations (4-3-3, 4-4-2, etc.)</li>
              <li>Drag and drop players on the pitch</li>
              <li>Assign player names and positions</li>
              <li>Save and share your squad lineup</li>
              <li>Export formation images</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="squad-maker-content">
        <div className="squad-maker-pitch-wrapper">
          <Pitch
            pitchCorners={vizData.pitchCorners}
            trackingPoints={[]}
            width={vizData.canvasWidth}
            height={vizData.canvasHeight}
            rotationAngle={vizData.rotationAngle}
            showActivityPoints={false}
            showHeatmap={false}
            satellite={vizData.satellite}
            satelliteTransform={vizData.satellite?.transforms?.original || { scale: 1.0, rotation: 0, translateX: 0, translateY: 0 }}
            centerCircleRadius={vizData.centerCircleRadius}
            pitchDimensions={vizData.pitchInfo.dimensions}
            goal={vizData.goal}
            penaltyBox={vizData.penaltyBox}
            showSprints={false}
          />
        </div>

        <div className="squad-maker-players">
          <h3 className="players-title">Players</h3>
          <div className="players-list">
            {players.map((player) => (
              <div key={player.id} className="player-pill">
                <span className="player-number">{player.id}</span>
                <span className="player-name">{player.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquadMaker;