import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import PitchInfoBanner from './components/PitchInfoBanner';
import Pitch from './components/Pitch';
import SegmentSelector from './components/SegmentSelector';
import OrientationSelector from './components/OrientationSelector';
import PerformanceSelector from './components/PerformanceSelector';
import TotalSummary from './components/TotalSummary';
import SatelliteControls from './components/SatelliteControls';
import HeatmapControls from './components/HeatmapControls';
import SprintControls from './components/SprintControls';
import SprintStats from './components/SprintStats';
import { parseTCX, prepareVisualizationData } from './utils/tcxParser';
import { DEFAULT_PITCH_ID } from './config/pitches';
import { autoDetectPitch } from './utils/pitchDetection';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [rawPoints, setRawPoints] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('full');
  const [selectedOrientation, setSelectedOrientation] = useState('original');
  const [detectedPitch, setDetectedPitch] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showActivityPoints, setShowActivityPoints] = useState(false);
  const [showSprints, setShowSprints] = useState(false);
  const [heatmapSettings, setHeatmapSettings] = useState({
    intensity: 14,
    opacity: 0.65,
    densityRadius: 10,
    colorPalette: 'classic',
    minThreshold: 0
  });
  const [sprintSettings, setSprintSettings] = useState({
    minSpeed: 16.5,
    minDuration: 2,
    minDistance: 10,
    simplified: true,
    showNumbers: false
  });
  const [satelliteTransform, setSatelliteTransform] = useState({
    scale: 1.0,
    rotation: 0,
    translateX: 0,
    translateY: 0
  });

  const handleFileLoad = (fileContent) => {
    try {
      const points = parseTCX(fileContent);

      if (points.length > 0) {
        setRawPoints(points);

        // Auto-wykryj boisko
        const pitchId = autoDetectPitch(points) || DEFAULT_PITCH_ID;
        setDetectedPitch(pitchId);

        const vizData = prepareVisualizationData(points, 'full', pitchId, selectedOrientation, showSprints ? sprintSettings : null);
        setVisualizationData(vizData);

        // Wczytaj domyślną transformację dla tej orientacji jeśli istnieje
        if (vizData.satellite?.transforms?.[selectedOrientation]) {
          setSatelliteTransform(vizData.satellite.transforms[selectedOrientation]);
        } else {
          setSatelliteTransform({ scale: 1.0, rotation: 0, translateX: 0, translateY: 0 });
        }
      }
    } catch (error) {
      console.error('Błąd parsowania pliku TCX:', error);
      alert('Nie można wczytać pliku TCX. Sprawdź format pliku.');
    }
  };

  const handleSegmentChange = (segmentType) => {
    setSelectedSegment(segmentType);
    if (rawPoints && detectedPitch) {
      const vizData = prepareVisualizationData(rawPoints, segmentType, detectedPitch, selectedOrientation, showSprints ? sprintSettings : null);
      setVisualizationData(vizData);
    }
  };

  const handleOrientationChange = (orientation) => {
    setSelectedOrientation(orientation);
    if (rawPoints && detectedPitch) {
      const vizData = prepareVisualizationData(rawPoints, selectedSegment, detectedPitch, orientation, showSprints ? sprintSettings : null);
      setVisualizationData(vizData);

      // Wczytaj domyślną transformację dla nowej orientacji jeśli istnieje
      if (vizData.satellite?.transforms?.[orientation]) {
        setSatelliteTransform(vizData.satellite.transforms[orientation]);
      } else {
        setSatelliteTransform({ scale: 1.0, rotation: 0, translateX: 0, translateY: 0 });
      }
    }
  };

  const handleLoadPerformance = (tcxContent, pitchId) => {
    try {
      const points = parseTCX(tcxContent);

      if (points.length > 0) {
        setRawPoints(points);
        setDetectedPitch(pitchId);
        setSelectedSegment('full');
        const vizData = prepareVisualizationData(points, 'full', pitchId, selectedOrientation, showSprints ? sprintSettings : null);
        setVisualizationData(vizData);

        // Wczytaj domyślną transformację dla tej orientacji jeśli istnieje
        if (vizData.satellite?.transforms?.[selectedOrientation]) {
          setSatelliteTransform(vizData.satellite.transforms[selectedOrientation]);
        } else {
          setSatelliteTransform({ scale: 1.0, rotation: 0, translateX: 0, translateY: 0 });
        }
      }
    } catch (error) {
      console.error('Błąd parsowania pliku TCX:', error);
      alert('Nie można wczytać pliku TCX. Sprawdź format pliku.');
    }
  };

  // Przelicz dane gdy zmieniają się ustawienia sprintów lub checkbox sprintów
  useEffect(() => {
    if (rawPoints && detectedPitch) {
      const vizData = prepareVisualizationData(
        rawPoints,
        selectedSegment,
        detectedPitch,
        selectedOrientation,
        showSprints ? sprintSettings : null
      );
      setVisualizationData(vizData);
    }
  }, [showSprints, sprintSettings]);

  return (
    <div className="app">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="app-main">
        <header className="app-header">
          <h1 className="app-header-title">DASHBOARD</h1>
          <p className="app-header-subtitle">Witaj ponownie. Twoje dane są gotowe do analizy.</p>
        </header>

        <FileUpload onFileLoad={handleFileLoad} />

        <PerformanceSelector onLoadPerformance={handleLoadPerformance} />

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

                    {/* Konfigurator satelity - ukryty, odkomentuj do konfiguracji nowych boisk */}
                    {/* {visualizationData.satellite && (
                      <div className="satellite-controls-side">
                        <SatelliteControls
                          transform={satelliteTransform}
                          onChange={setSatelliteTransform}
                          pitchId={detectedPitch}
                        />
                      </div>
                    )} */}
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
      </main>
    </div>
  );
}

export default App;
