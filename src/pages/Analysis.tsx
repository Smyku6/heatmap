import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import HeatmapControls from '../components/HeatmapControls';
import OrientationSelector from '../components/OrientationSelector';
import Pitch from '../components/Pitch';
import PitchInfoBanner from '../components/PitchInfoBanner';
import SegmentSelector from '../components/SegmentSelector';
import SprintControls from '../components/SprintControls';
import SprintStats from '../components/SprintStats';
import TotalSummary from '../components/TotalSummary';
import { useAnalysis } from '../hooks/useAnalysis';

import type { SegmentType, OrientationType, SessionId } from '../types';
import '../App.css';

interface LocationState {
  sessionId?: SessionId;
}

const Analysis = () => {
  const location = useLocation() as ReturnType<typeof useLocation> & { state: LocationState };
  const navigate = useNavigate();

  // Get all analysis state and actions from custom hook
  const {
    visualizationData,
    selectedSegment,
    selectedOrientation,
    showHeatmap,
    showActivityPoints,
    showSprints,
    showAveragePosition,
    heatmapSettings,
    sprintSettings,
    satelliteTransform,
    setSelectedSegment,
    setSelectedOrientation,
    setShowHeatmap,
    setShowActivityPoints,
    setShowSprints,
    setShowAveragePosition,
    setHeatmapSettings,
    setSprintSettings,
    loadSessionForAnalysis,
    updateVisualizationData
  } = useAnalysis();

  // Załaduj sesję gdy przechodzimy z Dashboard
  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state?.sessionId) {
      loadSessionForAnalysis(state.sessionId);
    }
  }, [location.state, loadSessionForAnalysis]);

  // Aktualizuj wizualizację gdy zmieniają się ustawienia
  useEffect(() => {
    updateVisualizationData();
  }, [selectedSegment, selectedOrientation, showSprints, sprintSettings, updateVisualizationData]);

  const handleSegmentChange = (segmentType: SegmentType) => {
    setSelectedSegment(segmentType);
  };

  const handleOrientationChange = (orientation: OrientationType) => {
    setSelectedOrientation(orientation);
  };

  // Jeśli nie ma danych, wróć do Dashboard
  if (!visualizationData) {
    return (
      <div className="empty-state">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }}
        >
          analytics
        </span>
        <p>Brak danych do analizy</p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--color-primary)',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Wróć do Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(202, 253, 0, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="app-header-title">ANALIZA SZCZEGÓŁOWA</h1>
            <p className="app-header-subtitle">Szczegółowa analiza twojej sesji treningowej</p>
          </div>
        </div>
      </header>

      <PitchInfoBanner
        pitchInfo={visualizationData.pitchInfo}
        activityDate={visualizationData.activityDate as Date}
        duration={visualizationData.totalDuration}
      />

      <OrientationSelector
        selectedOrientation={selectedOrientation}
        onChange={handleOrientationChange}
      />

      <div className="controls-row">
        <label className="checkbox-control">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
          />
          <span>Pokaż heatmapę</span>
        </label>

        <label className="checkbox-control">
          <input
            type="checkbox"
            checked={showSprints}
            onChange={(e) => setShowSprints(e.target.checked)}
          />
          <span>Pokaż sprinty</span>
        </label>

        <label className="checkbox-control">
          <input
            type="checkbox"
            checked={showActivityPoints}
            onChange={(e) => setShowActivityPoints(e.target.checked)}
          />
          <span>Pokaż punkty aktywności</span>
        </label>

        <label className="checkbox-control">
          <input
            type="checkbox"
            checked={showAveragePosition}
            onChange={(e) => setShowAveragePosition(e.target.checked)}
          />
          <span>Pokaż średnią pozycję</span>
        </label>
      </div>

      {showHeatmap && <HeatmapControls settings={heatmapSettings} onChange={setHeatmapSettings} />}

      {showSprints && <SprintControls settings={sprintSettings} onChange={setSprintSettings} />}

      <SegmentSelector selectedSegment={selectedSegment} onChange={handleSegmentChange} />

      <div className="pitch-grid">
        {visualizationData.segments.map((segment, index) => (
          <div key={index} className="pitch-wrapper">
            <h3 className="segment-title">
              {selectedSegment === 'full' && 'Całość'}
              {selectedSegment === 'halves' && `${index + 1}. połowa`}
              {selectedSegment === 'thirds' && `${index + 1}. tercja`}
              {selectedSegment === 'quarters' && `${index + 1}. ćwiartka`}
              {segment.duration?.timeRange && (
                <span className="segment-time"> • {segment.duration.timeRange}</span>
              )}
            </h3>

            <div className="pitch-with-controls">
              <div className="pitch-canvas-area">
                <Pitch
                  pitchCorners={visualizationData.pitchCorners}
                  trackingPoints={segment.trackingPoints}
                  width={visualizationData.canvasWidth}
                  height={visualizationData.canvasHeight}
                  duration={segment.duration}
                  distance={segment.distance}
                  avgHeartRate={segment.avgHeartRate}
                  rotationAngle={visualizationData.rotationAngle}
                  showActivityPoints={showActivityPoints}
                  showHeatmap={showHeatmap}
                  heatmapSettings={heatmapSettings}
                  satellite={visualizationData.satellite}
                  satelliteTransform={satelliteTransform}
                  centerCircleRadius={visualizationData.centerCircleRadius}
                  pitchDimensions={visualizationData.pitchInfo.dimensions}
                  goal={visualizationData.goal}
                  penaltyBox={visualizationData.penaltyBox}
                  showAveragePosition={showAveragePosition}
                  showSprints={showSprints}
                  sprints={segment.sprints}
                  sprintSettings={sprintSettings}
                />
              </div>
            </div>

            {showSprints && segment.sprints && <SprintStats sprints={segment.sprints} />}
          </div>
        ))}
      </div>

      {selectedSegment !== 'full' && (
        <TotalSummary
          totalDuration={visualizationData.totalDuration}
          totalDistance={visualizationData.totalDistance}
          totalAvgHeartRate={visualizationData.totalAvgHeartRate}
          totalPointCount={visualizationData.totalPointCount}
        />
      )}
    </>
  );
};

export default Analysis;
