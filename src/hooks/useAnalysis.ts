import useAppStore from '../store/useAppStore';

/**
 * Custom hook for Analysis page
 * Provides individual selectors to avoid re-render issues
 */
export const useAnalysis = () => {
  // State selectors
  const visualizationData = useAppStore((state) => state.visualizationData);
  const selectedSegment = useAppStore((state) => state.selectedSegment);
  const selectedOrientation = useAppStore((state) => state.selectedOrientation);
  const showHeatmap = useAppStore((state) => state.showHeatmap);
  const showActivityPoints = useAppStore((state) => state.showActivityPoints);
  const showSprints = useAppStore((state) => state.showSprints);
  const showAveragePosition = useAppStore((state) => state.showAveragePosition);
  const heatmapSettings = useAppStore((state) => state.heatmapSettings);
  const sprintSettings = useAppStore((state) => state.sprintSettings);
  const satelliteTransform = useAppStore((state) => state.satelliteTransform);

  // Action selectors
  const setSelectedSegment = useAppStore((state) => state.setSelectedSegment);
  const setSelectedOrientation = useAppStore((state) => state.setSelectedOrientation);
  const setShowHeatmap = useAppStore((state) => state.setShowHeatmap);
  const setShowActivityPoints = useAppStore((state) => state.setShowActivityPoints);
  const setShowSprints = useAppStore((state) => state.setShowSprints);
  const setShowAveragePosition = useAppStore((state) => state.setShowAveragePosition);
  const setHeatmapSettings = useAppStore((state) => state.setHeatmapSettings);
  const setSprintSettings = useAppStore((state) => state.setSprintSettings);
  const loadSessionForAnalysis = useAppStore((state) => state.loadSessionForAnalysis);
  const updateVisualizationData = useAppStore((state) => state.updateVisualizationData);

  return {
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
  };
};
