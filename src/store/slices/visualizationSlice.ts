/**
 * Visualization Slice - Manages visualization data and processing
 *
 * Handles all visualization-related state and actions including:
 * - Raw tracking points from TCX files
 * - Processed visualization data
 * - Data transformation and regeneration
 */

import { DEFAULT_PITCH_ID } from '../../config/pitches';
import { autoDetectPitch } from '../../utils/pitchDetection';
import { parseTCX, prepareVisualizationData } from '../../utils/tcxParser';

import type { TrackPoint, VisualizationData } from '../../types';
import type { AppState } from '../types';
import type { StateCreator } from 'zustand';

/**
 * Visualization slice interface
 */
export interface VisualizationSlice {
  // State
  rawPoints: TrackPoint[] | null;
  visualizationData: VisualizationData | null;

  // Computed Values
  selectedPitchId: () => string;

  // Actions
  handleFileLoad: (fileContent: string) => void;
  handleLoadPerformance: (tcxContent: string, pitchId: string) => void;
  updateVisualizationData: () => void;
}

/**
 * Creates the visualization data management slice
 *
 * @param set - Zustand set function
 * @param get - Zustand get function
 * @returns Visualization slice implementation
 */
export const createVisualizationSlice: StateCreator<
  AppState,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  VisualizationSlice
> = (set, get) => ({
  // ============================================
  // STATE
  // ============================================
  rawPoints: null,
  visualizationData: null,

  // ============================================
  // COMPUTED VALUES
  // ============================================

  /**
   * Gets the currently selected pitch ID
   *
   * Returns detected pitch or default pitch if none detected.
   */
  selectedPitchId: () => {
    const state = get();
    return state.detectedPitch ?? DEFAULT_PITCH_ID;
  },

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Handles TCX file upload and processing
   *
   * Parses the TCX file, auto-detects pitch, prepares visualization data,
   * and creates a new session that is added to the sessions list.
   *
   * @param fileContent - Raw TCX file content as string
   */
  handleFileLoad: (fileContent) => {
    try {
      const points = parseTCX(fileContent);

      if (points.length > 0) {
        // Auto-detect pitch
        const pitchId = autoDetectPitch(points) ?? DEFAULT_PITCH_ID;

        // Prepare visualization data
        const vizData = prepareVisualizationData(points, 'full', pitchId, 'original', null);

        // Create new session
        const newSession = {
          id: Date.now().toString(),
          rawPoints: points,
          pitchId: pitchId,
          activityDate: vizData.activityDate,
          totalDuration: vizData.totalDuration?.formatted || vizData.totalDuration,
          totalDistance: vizData.totalDistance?.formatted || vizData.totalDistance,
          totalAvgHeartRate: vizData.totalAvgHeartRate,
          totalPointCount: vizData.totalPointCount,
          pitchInfo: vizData.pitchInfo,
          visualizationData: vizData
        };

        // Add to sessions via addSession action
        get().addSession(newSession);
      }
    } catch (error) {
      console.error('Błąd parsowania pliku TCX:', error);
      console.error('Nie można wczytać pliku TCX. Sprawdź format pliku.');
    }
  },

  /**
   * Handles performance file load with specific pitch
   *
   * Similar to handleFileLoad but uses a pre-specified pitch ID
   * instead of auto-detecting it.
   *
   * @param tcxContent - Raw TCX file content as string
   * @param pitchId - ID of the pitch to use
   */
  handleLoadPerformance: (tcxContent, pitchId) => {
    try {
      const points = parseTCX(tcxContent);

      if (points.length > 0) {
        // Prepare visualization data with specified pitch
        const vizData = prepareVisualizationData(points, 'full', pitchId, 'original', null);

        // Create new session
        const newSession = {
          id: Date.now().toString(),
          rawPoints: points,
          pitchId: pitchId,
          activityDate: vizData.activityDate,
          totalDuration: vizData.totalDuration?.formatted || vizData.totalDuration,
          totalDistance: vizData.totalDistance?.formatted || vizData.totalDistance,
          totalAvgHeartRate: vizData.totalAvgHeartRate,
          totalPointCount: vizData.totalPointCount,
          pitchInfo: vizData.pitchInfo,
          visualizationData: vizData
        };

        // Add to sessions via addSession action
        get().addSession(newSession);
      }
    } catch (error) {
      console.error('Błąd parsowania pliku TCX:', error);
      console.error('Nie można wczytać pliku TCX. Sprawdź format pliku.');
    }
  },

  /**
   * Updates visualization data based on current settings
   *
   * Regenerates visualization data when user changes:
   * - Segment type (full/halves/thirds/quarters)
   * - Orientation (rotation)
   * - Sprint detection settings
   *
   * Also handles satellite transform loading for the selected orientation.
   */
  updateVisualizationData: () => {
    const state = get();

    if (state.rawPoints) {
      const vizData = prepareVisualizationData(
        state.rawPoints,
        state.selectedSegment,
        state.detectedPitch ?? DEFAULT_PITCH_ID,
        state.selectedOrientation,
        state.showSprints ? state.sprintSettings : null
      );

      set({ visualizationData: vizData }, false, 'visualization/update');

      // Load default transform for this orientation if exists
      if (vizData.satellite?.transforms?.[state.selectedOrientation]) {
        set(
          { satelliteTransform: vizData.satellite.transforms[state.selectedOrientation] },
          false,
          'visualization/loadSatelliteTransform'
        );
      } else {
        set(
          {
            satelliteTransform: {
              scale: 1.0,
              rotation: 0,
              translateX: 0,
              translateY: 0
            }
          },
          false,
          'visualization/resetSatelliteTransform'
        );
      }
    }
  }
});
