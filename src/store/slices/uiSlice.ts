/**
 * UI Slice - Manages user interface state and settings
 *
 * Handles all UI-related state including:
 * - Display toggles (heatmap, sprints, activity points)
 * - View settings (segment type, orientation)
 * - Configuration settings (heatmap, sprint, satellite)
 */

import type {
  HeatmapSettings,
  OrientationType,
  PitchId,
  SegmentType,
  SatelliteTransform,
  SprintSettings
} from '../../types';
import type { AppState } from '../types';
import type { StateCreator } from 'zustand';

/**
 * UI slice interface
 */
export interface UISlice {
  // View State
  selectedSegment: SegmentType;
  selectedOrientation: OrientationType;
  detectedPitch: PitchId | null;

  // Display Toggles
  showHeatmap: boolean;
  showActivityPoints: boolean;
  showSprints: boolean;
  showAveragePosition: boolean;

  // Settings
  heatmapSettings: HeatmapSettings;
  sprintSettings: SprintSettings;
  satelliteTransform: SatelliteTransform;

  // Actions
  setSelectedSegment: (segment: SegmentType) => void;
  setSelectedOrientation: (orientation: OrientationType) => void;
  setDetectedPitch: (pitchId: PitchId) => void;
  setShowHeatmap: (show: boolean) => void;
  setShowActivityPoints: (show: boolean) => void;
  setShowSprints: (show: boolean) => void;
  setShowAveragePosition: (show: boolean) => void;
  setHeatmapSettings: (settings: HeatmapSettings) => void;
  setSprintSettings: (settings: SprintSettings) => void;
  setSatelliteTransform: (transform: SatelliteTransform) => void;
  handlePitchChange: (pitchId: PitchId) => void;
}

/**
 * Creates the UI state management slice
 *
 * @param set - Zustand set function
 * @returns UI slice implementation
 */
export const createUISlice: StateCreator<
  AppState,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  UISlice
> = (set) => ({
  // ============================================
  // STATE
  // ============================================

  // View State
  selectedSegment: 'full',
  selectedOrientation: 'original',
  detectedPitch: null,

  // Display Toggles
  showHeatmap: true,
  showActivityPoints: false,
  showSprints: false,
  showAveragePosition: false,

  // Heatmap Settings
  heatmapSettings: {
    intensity: 14,
    opacity: 0.65,
    densityRadius: 10,
    colorPalette: 'classic',
    minThreshold: 0
  },

  // Sprint Settings
  sprintSettings: {
    minSpeed: 16.5,
    minDuration: 2,
    minDistance: 10,
    simplified: true,
    showNumbers: false
  },

  // Satellite Transform
  satelliteTransform: {
    scale: 1.0,
    rotation: 0,
    translateX: 0,
    translateY: 0
  },

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Sets the selected time segment type
   */
  setSelectedSegment: (segment) => set({ selectedSegment: segment }, false, 'ui/setSegment'),

  /**
   * Sets the pitch orientation/rotation
   */
  setSelectedOrientation: (orientation) =>
    set({ selectedOrientation: orientation }, false, 'ui/setOrientation'),

  /**
   * Sets the detected/selected pitch ID
   */
  setDetectedPitch: (pitchId) => set({ detectedPitch: pitchId }, false, 'ui/setPitch'),

  /**
   * Toggles heatmap visibility
   */
  setShowHeatmap: (show) => set({ showHeatmap: show }, false, 'ui/toggleHeatmap'),

  /**
   * Toggles activity points visibility
   */
  setShowActivityPoints: (show) =>
    set({ showActivityPoints: show }, false, 'ui/toggleActivityPoints'),

  /**
   * Toggles sprint visualization
   */
  setShowSprints: (show) => set({ showSprints: show }, false, 'ui/toggleSprints'),

  /**
   * Toggles average position marker visibility
   */
  setShowAveragePosition: (show) =>
    set({ showAveragePosition: show }, false, 'ui/toggleAveragePosition'),

  /**
   * Updates heatmap configuration settings
   */
  setHeatmapSettings: (settings) =>
    set({ heatmapSettings: settings }, false, 'ui/updateHeatmapSettings'),

  /**
   * Updates sprint detection settings
   */
  setSprintSettings: (settings) =>
    set({ sprintSettings: settings }, false, 'ui/updateSprintSettings'),

  /**
   * Updates satellite image transformation
   */
  setSatelliteTransform: (transform) =>
    set({ satelliteTransform: transform }, false, 'ui/updateSatelliteTransform'),

  /**
   * Handles pitch change (alias for setDetectedPitch)
   */
  handlePitchChange: (pitchId) => set({ detectedPitch: pitchId }, false, 'ui/changePitch')
});
