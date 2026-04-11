import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseTCX, prepareVisualizationData } from '../utils/tcxParser';
import { DEFAULT_PITCH_ID } from '../config/pitches';
import { autoDetectPitch } from '../utils/pitchDetection';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // State management - wszystkie stany z App.jsx
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

  const selectedPitchId = detectedPitch || DEFAULT_PITCH_ID;

  // Effect do aktualizacji wizualizacji
  useEffect(() => {
    if (rawPoints) {
      const vizData = prepareVisualizationData(
        rawPoints,
        selectedSegment,
        selectedPitchId,
        selectedOrientation,
        showSprints ? sprintSettings : null
      );
      setVisualizationData(vizData);

      // Wczytaj domyślną transformację dla tej orientacji jeśli istnieje
      if (vizData.satellite?.transforms?.[selectedOrientation]) {
        setSatelliteTransform(vizData.satellite.transforms[selectedOrientation]);
      } else {
        setSatelliteTransform({ scale: 1.0, rotation: 0, translateX: 0, translateY: 0 });
      }
    }
  }, [rawPoints, selectedSegment, selectedPitchId, selectedOrientation, showSprints, sprintSettings]);

  // Handler do ładowania pliku
  const handleFileLoad = (fileContent) => {
    try {
      const points = parseTCX(fileContent);

      if (points.length > 0) {
        setRawPoints(points);

        // Auto-wykryj boisko
        const pitchId = autoDetectPitch(points) || DEFAULT_PITCH_ID;
        setDetectedPitch(pitchId);
      }
    } catch (error) {
      console.error('Błąd parsowania pliku TCX:', error);
      alert('Nie można wczytać pliku TCX. Sprawdź format pliku.');
    }
  };

  // Handler do ładowania performance
  const handleLoadPerformance = (tcxContent, pitchId) => {
    try {
      const points = parseTCX(tcxContent);

      if (points.length > 0) {
        setRawPoints(points);
        setDetectedPitch(pitchId);
        setSelectedSegment('full');
      }
    } catch (error) {
      console.error('Błąd parsowania pliku TCX:', error);
      alert('Nie można wczytać pliku TCX. Sprawdź format pliku.');
    }
  };

  // Handler do zmiany boiska
  const handlePitchChange = (pitchId) => {
    setDetectedPitch(pitchId);
  };

  const value = {
    // State
    rawPoints,
    visualizationData,
    selectedSegment,
    selectedOrientation,
    detectedPitch,
    showHeatmap,
    showActivityPoints,
    showSprints,
    heatmapSettings,
    sprintSettings,
    satelliteTransform,
    selectedPitchId,

    // Setters
    setRawPoints,
    setVisualizationData,
    setSelectedSegment,
    setSelectedOrientation,
    setDetectedPitch,
    setShowHeatmap,
    setShowActivityPoints,
    setShowSprints,
    setHeatmapSettings,
    setSprintSettings,
    setSatelliteTransform,

    // Handlers
    handleFileLoad,
    handleLoadPerformance,
    handlePitchChange
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};