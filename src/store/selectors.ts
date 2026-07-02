/**
 * Store Selectors
 *
 * Provides reusable selector functions for accessing store state.
 * These selectors can be used with useAppStore to extract specific
 * pieces of state, preventing unnecessary re-renders.
 */

import type { PitchId } from '../types';
import type { AppState } from './types';

// ============================================
// SESSION SELECTORS
// ============================================

/**
 * Selects all training sessions
 */
export const selectSessions = (state: AppState) => state.sessions;

/**
 * Selects the currently loaded session ID
 */
export const selectCurrentSessionId = (state: AppState) => state.currentSessionId;

/**
 * Selects the currently loaded session
 *
 * Returns null if no session is loaded or session not found.
 */
export const selectCurrentSession = (state: AppState) => {
  if (!state.currentSessionId) {
    return null;
  }
  return state.sessions.find((s) => s.id === state.currentSessionId) ?? null;
};

/**
 * Selects sessions for a specific pitch
 *
 * @param pitchId - ID of the pitch to filter by
 */
export const selectSessionsByPitch = (pitchId: PitchId) => (state: AppState) => {
  return state.sessions.filter((s) => s.pitchId === pitchId);
};

/**
 * Selects the total number of sessions
 */
export const selectSessionCount = (state: AppState) => state.sessions.length;

// ============================================
// UI STATE SELECTORS
// ============================================

/**
 * Selects the current segment type
 */
export const selectSegment = (state: AppState) => state.selectedSegment;

/**
 * Selects the current orientation
 */
export const selectOrientation = (state: AppState) => state.selectedOrientation;

/**
 * Selects all display toggles
 */
export const selectDisplayToggles = (state: AppState) => ({
  showHeatmap: state.showHeatmap,
  showActivityPoints: state.showActivityPoints,
  showSprints: state.showSprints,
  showAveragePosition: state.showAveragePosition
});

/**
 * Selects heatmap settings
 */
export const selectHeatmapSettings = (state: AppState) => state.heatmapSettings;

/**
 * Selects sprint settings
 */
export const selectSprintSettings = (state: AppState) => state.sprintSettings;

/**
 * Selects satellite transform
 */
export const selectSatelliteTransform = (state: AppState) => state.satelliteTransform;

/**
 * Selects the detected/selected pitch ID
 */
export const selectDetectedPitch = (state: AppState) => state.detectedPitch;

// ============================================
// VISUALIZATION SELECTORS
// ============================================

/**
 * Selects raw tracking points
 */
export const selectRawPoints = (state: AppState) => state.rawPoints;

/**
 * Selects visualization data
 */
export const selectVisualizationData = (state: AppState) => state.visualizationData;

/**
 * Selects the currently selected pitch ID (with fallback to default)
 */
export const selectSelectedPitchId = (state: AppState) => state.selectedPitchId();

/**
 * Checks if any data is loaded
 */
export const selectHasData = (state: AppState) => {
  return state.rawPoints !== null && state.visualizationData !== null;
};

/**
 * Selects pitch information from visualization data
 */
export const selectPitchInfo = (state: AppState) => {
  return state.visualizationData?.pitchInfo ?? null;
};

// ============================================
// COMBINED SELECTORS
// ============================================

/**
 * Selects all settings (heatmap + sprint + satellite)
 */
export const selectAllSettings = (state: AppState) => ({
  heatmap: state.heatmapSettings,
  sprint: state.sprintSettings,
  satellite: state.satelliteTransform
});

/**
 * Selects complete view state
 */
export const selectViewState = (state: AppState) => ({
  segment: state.selectedSegment,
  orientation: state.selectedOrientation,
  pitch: state.detectedPitch,
  toggles: {
    showHeatmap: state.showHeatmap,
    showActivityPoints: state.showActivityPoints,
    showSprints: state.showSprints,
    showAveragePosition: state.showAveragePosition
  }
});
