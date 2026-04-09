import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Pitch from './components/Pitch';
import SegmentSelector from './components/SegmentSelector';
import PerformanceSelector from './components/PerformanceSelector';
import TotalSummary from './components/TotalSummary';
import { parseTCX, prepareVisualizationData } from './utils/tcxParser';
import { DEFAULT_PITCH_ID } from './config/pitches';
import { autoDetectPitch } from './utils/pitchDetection';
import './App.css';

function App() {
  const [rawPoints, setRawPoints] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('full');
  const [detectedPitch, setDetectedPitch] = useState(null);

  const handleFileLoad = (fileContent) => {
    try {
      const points = parseTCX(fileContent);

      if (points.length > 0) {
        setRawPoints(points);

        // Auto-wykryj boisko
        const pitchId = autoDetectPitch(points) || DEFAULT_PITCH_ID;
        setDetectedPitch(pitchId);

        const vizData = prepareVisualizationData(points, 'full', pitchId);
        setVisualizationData(vizData);
      }
    } catch (error) {
      console.error('Błąd parsowania pliku TCX:', error);
      alert('Nie można wczytać pliku TCX. Sprawdź format pliku.');
    }
  };

  const handleSegmentChange = (segmentType) => {
    setSelectedSegment(segmentType);
    if (rawPoints && detectedPitch) {
      const vizData = prepareVisualizationData(rawPoints, segmentType, detectedPitch);
      setVisualizationData(vizData);
    }
  };

  const handleLoadPerformance = (tcxContent, pitchId) => {
    try {
      const points = parseTCX(tcxContent);

      if (points.length > 0) {
        setRawPoints(points);
        setDetectedPitch(pitchId);
        setSelectedSegment('full');
        const vizData = prepareVisualizationData(points, 'full', pitchId);
        setVisualizationData(vizData);
      }
    } catch (error) {
      console.error('Błąd parsowania pliku TCX:', error);
      alert('Nie można wczytać pliku TCX. Sprawdź format pliku.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TCX Heatmap Viewer</h1>
        <p>Wizualizacja danych treningowych z Garmin</p>
      </header>

      <main className="app-main">
        <FileUpload onFileLoad={handleFileLoad} />

        <PerformanceSelector onLoadPerformance={handleLoadPerformance} />

        {visualizationData ? (
          <>
            <div className="pitch-info">
              <h2>📍 Boisko: {visualizationData.pitchInfo.name}</h2>
              <p>{visualizationData.pitchInfo.location} • Auto-wykryte</p>
            </div>

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
                  </h3>
                  <Pitch
                    pitchCorners={visualizationData.pitchCorners}
                    trackingPoints={segment.trackingPoints}
                    width={visualizationData.canvasWidth}
                    height={visualizationData.canvasHeight}
                    duration={segment.duration}
                    distance={segment.distance}
                    avgHeartRate={segment.avgHeartRate}
                  />
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
