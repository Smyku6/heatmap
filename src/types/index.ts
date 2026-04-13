// ============================================
// BRANDED TYPES (Re-export from branded.ts)
// ============================================

import type { SessionId, PitchId, UserId } from './branded';

export type { SessionId, PitchId, UserId };
export {
  createSessionId,
  createPitchId,
  createUserId,
  isSessionId,
  isPitchId,
  isUserId,
  sessionIdToString,
  pitchIdToString,
  userIdToString
} from './branded';

// ============================================
// STATE TYPES (Re-export from state.ts)
// ============================================

export type {
  LoadingState,
  FileUploadState,
  DragDropUploadState,
  FetchState,
  ValidationState,
  ModalState
} from './state';
export {
  isIdle,
  isLoading,
  isSuccess,
  isError,
  isUploadIdle,
  isUploadParsing,
  isUploadSuccess,
  isUploadError,
  isDragDropIdle,
  isDragDropDragging,
  isDragDropUploading,
  isDragDropError,
  createIdleState,
  createLoadingState,
  createSuccessState,
  createErrorState,
  mapLoadingState
} from './state';

// ============================================
// SESSION TYPES
// ============================================

/**
 * Training session representing a complete football activity
 *
 * Sessions are created from TCX files and contain GPS tracking data,
 * pitch information, and calculated metrics like distance and duration.
 * They are persisted to localStorage and can be loaded for detailed analysis.
 *
 * @property id - Unique session identifier (timestamp-based)
 * @property rawPoints - Original GPS tracking points from TCX file
 * @property pitchId - Identifier of the detected pitch
 * @property activityDate - Date when the activity was recorded
 * @property totalDuration - Activity duration (string or formatted object)
 * @property totalDistance - Total distance traveled (string/number/formatted object)
 * @property totalAvgHeartRate - Average heart rate across activity (null if unavailable)
 * @property totalPointCount - Number of GPS tracking points
 * @property pitchInfo - Metadata about the pitch (name, dimensions, location)
 * @property visualizationData - Processed data ready for canvas rendering
 *
 * @example
 * ```typescript
 * const session: Session = {
 *   id: createSessionId('1234567890'),
 *   rawPoints: parseTCX(tcxContent),
 *   pitchId: createPitchId('orlik-kopernika'),
 *   activityDate: new Date(),
 *   totalDuration: '1:30:00',
 *   totalDistance: 5000,
 *   totalAvgHeartRate: 145,
 *   totalPointCount: 1800,
 *   pitchInfo: { name: 'Orlik Kopernika', dimensions: { width: 40, length: 60 } },
 *   visualizationData: prepareVisualizationData(...)
 * };
 * ```
 */
export interface Session {
  id: SessionId;
  rawPoints: TrackPoint[];
  pitchId: PitchId;
  activityDate: Date | string;
  totalDuration: string | { formatted: string };
  totalDistance: string | number | { formatted: string };
  totalAvgHeartRate: number | null;
  totalPointCount: number;
  pitchInfo: PitchInfo;
  visualizationData: VisualizationData;
}

// ============================================
// TRACKING & GPS TYPES
// ============================================

/**
 * GPS tracking point from TCX file
 *
 * Represents a single GPS measurement with coordinates, timestamp,
 * and optional sensor data (heart rate, altitude, speed).
 *
 * @property lat - Latitude in decimal degrees
 * @property lon - Longitude in decimal degrees
 * @property time - Timestamp of the measurement
 * @property altitude - Elevation in meters (optional)
 * @property distance - Cumulative distance in meters (optional)
 * @property speed - Instantaneous speed in km/h (optional)
 * @property heartRate - Heart rate in BPM (optional)
 */
export interface TrackPoint {
  lat: number;
  lon: number;
  time: Date;
  altitude?: number;
  distance?: number;
  speed?: number;
  heartRate?: number;
}

/**
 * GPS tracking point transformed to SVG canvas coordinates
 *
 * Represents a TrackPoint after perspective transformation,
 * containing both SVG rendering coordinates (x,y) and metadata.
 *
 * @property x - X coordinate on SVG canvas
 * @property y - Y coordinate on SVG canvas
 * @property time - Timestamp of the measurement
 * @property heartRate - Heart rate in BPM (optional)
 * @property speed - Instantaneous speed in km/h (optional)
 */
export interface TransformedPoint {
  x: number;
  y: number;
  time: Date;
  heartRate?: number;
  speed?: number;
}

// ============================================
// PITCH TYPES
// ============================================

export interface PitchInfo {
  id?: PitchId;
  name: string;
  dimensions: {
    width: number;
    length: number;
  };
  location?: string;
}

export interface PitchCorner {
  x: number;
  y: number;
}

export interface PitchCorners {
  topLeft: PitchCorner;
  topRight: PitchCorner;
  bottomLeft: PitchCorner;
  bottomRight: PitchCorner;
}

// ============================================
// VISUALIZATION TYPES
// ============================================

export interface VisualizationData {
  pitchCorners: PitchCorners;
  segments: SegmentData[];
  canvasWidth: number;
  canvasHeight: number;
  rotationAngle: number;
  totalDuration: { formatted: string; seconds: number; timeRange?: string };
  totalDistance: { formatted: string; meters: number };
  totalAvgHeartRate: number | null;
  totalPointCount: number;
  activityDate: Date | string;
  pitchInfo: PitchInfo;
  satellite?: SatelliteData;
  centerCircleRadius?: number;
  goal?: GoalDimensions;
  penaltyBox?: PenaltyBoxDimensions;
}

export interface SegmentData {
  trackingPoints: TransformedPoint[];
  duration: { formatted: string; seconds: number; timeRange?: string };
  distance: { formatted: string; meters: number };
  avgHeartRate: number | null;
  sprints?: Sprint[];
}

export interface SatelliteData {
  image: string; // Path to satellite image
  transforms: {
    [key: string]: SatelliteTransform;
  };
}

export interface SatelliteTransform {
  scale: number;
  rotation: number;
  translateX: number;
  translateY: number;
}

export interface GoalDimensions {
  width: number;
  depth: number; // How far the goal extends beyond the pitch
}

export interface PenaltyBoxDimensions {
  width: number;
  depth: number; // How far it extends into the pitch
}

// ============================================
// SPRINT TYPES
// ============================================

// Sprint points have both GPS coordinates and SVG coordinates after transformation
export type SprintPoint = TrackPoint & TransformedPoint;

// Raw sprint data before SVG transformation
export interface RawSprint {
  startIndex?: number;
  endIndex?: number;
  startPoint: TrackPoint;
  endPoint: TrackPoint;
  points: TrackPoint[];
  duration: number;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  startTime: Date;
  endTime: Date;
}

// Sprint data after SVG transformation (used in visualization)
export interface Sprint {
  startIndex?: number;
  endIndex?: number;
  startPoint: SprintPoint;
  endPoint: SprintPoint;
  points: SprintPoint[];
  duration: number;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  startTime: Date;
  endTime: Date;
}

/**
 * Configuration settings for sprint detection algorithm
 *
 * Defines thresholds for identifying high-speed running segments
 * and display preferences for sprint visualization.
 *
 * @property minSpeed - Minimum speed threshold in km/h (default: 16.5)
 * @property minDuration - Minimum sprint duration in seconds (default: 2)
 * @property minDistance - Minimum sprint distance in meters (default: 10)
 * @property simplified - Use simplified sprint visualization (default: true)
 * @property showNumbers - Display sprint numbers on canvas (default: false)
 *
 * @example
 * ```typescript
 * const settings: SprintSettings = {
 *   minSpeed: 18.0,
 *   minDuration: 3,
 *   minDistance: 15,
 *   simplified: true,
 *   showNumbers: true
 * };
 * ```
 */
export interface SprintSettings {
  minSpeed: number;
  minDuration: number;
  minDistance: number;
  simplified: boolean;
  showNumbers: boolean;
}

// ============================================
// HEATMAP TYPES
// ============================================

/**
 * Configuration settings for heatmap visualization
 *
 * Controls the appearance and behavior of the activity heatmap overlay,
 * including color intensity, opacity, and density calculations.
 *
 * @property intensity - Heat intensity multiplier (higher = more intense colors)
 * @property opacity - Overall heatmap opacity (0.0 - 1.0)
 * @property densityRadius - Radius in pixels for density calculation
 * @property colorPalette - Color scheme ('classic' | 'thermal' | 'purple' | 'mono')
 * @property minThreshold - Minimum density value to display (filters noise)
 *
 * @example
 * ```typescript
 * const settings: HeatmapSettings = {
 *   intensity: 14,
 *   opacity: 0.65,
 *   densityRadius: 10,
 *   colorPalette: 'thermal',
 *   minThreshold: 0
 * };
 * ```
 */
export interface HeatmapSettings {
  intensity: number;
  opacity: number;
  densityRadius: number;
  colorPalette: 'classic' | 'thermal' | 'purple' | 'mono';
  minThreshold: number;
}

// ============================================
// UI STATE TYPES
// ============================================

export type SegmentType = 'full' | 'halves' | 'thirds' | 'quarters';
export type OrientationType = 'original' | 'rotated90' | 'rotated180' | 'rotated270';

// ============================================
// STORE STATE TYPE
// ============================================

export interface AppState {
  // Sessions
  sessions: Session[];
  currentSessionId: string | null;

  // Visualization data
  rawPoints: TrackPoint[] | null;
  visualizationData: VisualizationData | null;

  // UI Settings
  selectedSegment: SegmentType;
  selectedOrientation: OrientationType;
  detectedPitch: string | null;

  // Display toggles
  showHeatmap: boolean;
  showActivityPoints: boolean;
  showSprints: boolean;

  // Settings
  heatmapSettings: HeatmapSettings;
  sprintSettings: SprintSettings;
  satelliteTransform: SatelliteTransform;

  // Computed
  selectedPitchId: () => string;

  // Actions
  addSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;
  clearSessions: () => void;
  loadSessionForAnalysis: (sessionId: string) => void;
  handleFileLoad: (fileContent: string) => void;
  handleLoadPerformance: (tcxContent: string, pitchId: string) => void;
  setSelectedSegment: (segment: SegmentType) => void;
  setSelectedOrientation: (orientation: OrientationType) => void;
  setDetectedPitch: (pitchId: string) => void;
  setShowHeatmap: (show: boolean) => void;
  setShowActivityPoints: (show: boolean) => void;
  setShowSprints: (show: boolean) => void;
  setHeatmapSettings: (settings: HeatmapSettings) => void;
  setSprintSettings: (settings: SprintSettings) => void;
  setSatelliteTransform: (transform: SatelliteTransform) => void;
  handlePitchChange: (pitchId: string) => void;
  updateVisualizationData: () => void;
}
