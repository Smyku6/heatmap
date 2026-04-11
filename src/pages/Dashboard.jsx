import React from 'react';
import { useApp } from '../context/AppContext';
import FileSelector from '../components/FileSelector';
import PitchInfoBanner from '../components/PitchInfoBanner';
import Pitch from '../components/Pitch';
import SegmentSelector from '../components/SegmentSelector';
import OrientationSelector from '../components/OrientationSelector';
import TotalSummary from '../components/TotalSummary';
import HeatmapControls from '../components/HeatmapControls';
import SprintControls from '../components/SprintControls';
import SprintStats from '../components/SprintStats';
import '../App.css';

const Dashboard = () => {
  const {
    visualizationData,
    selectedSegment,
    selectedOrientation,
    showHeatmap,
    showActivityPoints,
    showSprints,
    heatmapSettings,
    sprintSettings,
    satelliteTransform,
    setSelectedSegment,
    setSelectedOrientation,
    setShowHeatmap,
    setShowActivityPoints,
    setShowSprints,
    setHeatmapSettings,
    setSprintSettings,
    setSatelliteTransform,
    handleFileLoad,
    handleLoadPerformance
  } = useApp();

  const handleSegmentChange = (segmentType) => {
    setSelectedSegment(segmentType);
  };

  const handleOrientationChange = (orientation) => {
    setSelectedOrientation(orientation);
  };

  return (
    <>
      <header className="app-header">
        <h1 className="app-header-title">DASHBOARD</h1>
        <p className="app-header-subtitle">Witaj ponownie. Twoje dane są gotowe do analizy.</p>
      </header>

      {!visualizationData && (
        <FileSelector
          onFileLoad={handleFileLoad}
          onLoadPerformance={handleLoadPerformance}
        />
      )}

      {visualizationData ? (
        <>
          <PitchInfoBanner
            pitchInfo={visualizationData.pitchInfo}
            activityDate={visualizationData.activityDate}
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
          </div>

          {showHeatmap && (
            <HeatmapControls
              settings={heatmapSettings}
              onChange={setHeatmapSettings}
            />
          )}

          {showSprints && (
            <SprintControls
              settings={sprintSettings}
              onChange={setSprintSettings}
            />
          )}

          <SegmentSelector
            selectedSegment={selectedSegment}
            onChange={handleSegmentChange}
          />

          <div className="pitch-grid">
            {visualizationData.segments.map((segment, index) => (
              <div key={index} className="pitch-wrapper">
                <h3 className="segment-title">
                  {selectedSegment === 'full' && 'Całość'}
                  {selectedSegment === 'halves' && `${index + 1}. połowa`}
                  {selectedSegment === 'thirds' && `${index + 1}. tercja`}
                  {selectedSegment === 'quarters' && `${index + 1}. ćwiartka`}
                  {segment.duration && segment.duration.timeRange && (
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
                      showSprints={showSprints}
                      sprints={segment.sprints}
                      sprintSettings={sprintSettings}
                    />
                  </div>
                </div>

                {/* Statystyki sprintów dla tego segmentu */}
                {showSprints && segment.sprints && (
                  <SprintStats sprints={segment.sprints} />
                )}
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
      ) : (
        <div className="empty-state">
          <p>Wczytaj plik TCX, aby zobaczyć dane na boisku</p>
        </div>
      )}
    </>
  );
};

export default Dashboard;