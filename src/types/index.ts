// ============================================
// SESSION TYPES
// ============================================

export interface Session {
  id: string;
  rawPoints: TrackPoint[];
  pitchId: string;
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

export interface TrackPoint {
  lat: number;
  lon: number;
  time: Date;
  altitude?: number;
  distance?: number;
  speed?: number;
  heartRate?: number;
}

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
  id?: string;
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

export interface Sprint {
  startIndex: number;
  endIndex: number;
  points: TransformedPoint[];
  duration: number;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  startTime: Date;
  endTime: Date;
}

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

export interface HeatmapSettings {
  intensity: number;
  opacity: number;
  densityRadius: number;
  colorPalette: 'classic' | 'fire' | 'cool' | 'rainbow';
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
