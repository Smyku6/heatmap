import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Pitch from './components/Pitch';
import SegmentSelector from './components/SegmentSelector';
import TotalSummary from './components/TotalSummary';
import { parseTCX, prepareVisualizationData } from './utils/tcxParser';
import './App.css';

function App() {
  const [rawPoints, setRawPoints] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('full');

  const handleFileLoad = (fileContent) => {
    try {
      const points = parseTCX(fileContent);

      if (points.length > 0) {
        setRawPoints(points);
        const vizData = prepareVisualizationData(points, 'full');
        setVisualizationData(vizData);
      }
    } catch (error) {
      console.error('Błąd parsowania pliku TCX:', error);
      alert('Nie można wczytać pliku TCX. Sprawdź format pliku.');
    }
  };

  const handleSegmentChange = (segmentType) => {
    setSelectedSegment(segmentType);
    if (rawPoints) {
      const vizData = prepareVisualizationData(rawPoints, segmentType);
      setVisualizationData(vizData);
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

        {visualizationData ? (
          <>
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
