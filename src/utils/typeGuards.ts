/**
 * Runtime Type Guards for type-safe data validation
 *
 * These functions provide runtime type checking to ensure data integrity
 * when working with external data sources (localStorage, TCX files, user input).
 */

import type {
  Session,
  TrackPoint,
  TransformedPoint,
  PitchCorners,
  PitchCorner,
  VisualizationData,
  SegmentData,
  Sprint,
  RawSprint,
  SprintSettings,
  HeatmapSettings,
  PitchInfo,
  SegmentType,
  OrientationType
} from '../types';

/**
 * Type guard for TrackPoint objects
 *
 * Validates that an object has the required properties of a GPS tracking point
 * from a TCX file.
 *
 * @param obj - Object to validate
 * @returns True if object is a valid TrackPoint
 *
 * @example
 * ```typescript
 * const data = JSON.parse(localStorage.getItem('point'));
 * if (isTrackPoint(data)) {
 *   console.log(`Point at ${data.lat}, ${data.lon}`);
 * }
 * ```
 */
export function isTrackPoint(obj: unknown): obj is TrackPoint {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'lat' in obj &&
    typeof obj.lat === 'number' &&
    'lon' in obj &&
    typeof obj.lon === 'number' &&
    'time' in obj &&
    (obj.time instanceof Date || typeof obj.time === 'string')
  );
}

/**
 * Type guard for TransformedPoint objects
 *
 * Validates that an object has both GPS coordinates and SVG canvas coordinates.
 *
 * @param obj - Object to validate
 * @returns True if object is a valid TransformedPoint
 */
export function isTransformedPoint(obj: unknown): obj is TransformedPoint {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'x' in obj &&
    typeof obj.x === 'number' &&
    'y' in obj &&
    typeof obj.y === 'number' &&
    'time' in obj &&
    (obj.time instanceof Date || typeof obj.time === 'string')
  );
}

/**
 * Type guard for duration objects
 *
 * Validates the format of duration data (formatted string + seconds).
 *
 * @param duration - Value to validate
 * @returns True if value matches duration object format
 *
 * @example
 * ```typescript
 * if (isDurationObject(session.totalDuration)) {
 *   console.log(`Duration: ${session.totalDuration.formatted}`);
 * }
 * ```
 */
export function isDurationObject(
  duration: unknown
): duration is { formatted: string; seconds: number; timeRange?: string } {
  return (
    typeof duration === 'object' &&
    duration !== null &&
    'formatted' in duration &&
    typeof duration.formatted === 'string' &&
    'seconds' in duration &&
    typeof duration.seconds === 'number'
  );
}

/**
 * Type guard for distance objects
 *
 * Validates the format of distance data (formatted string + meters).
 *
 * @param distance - Value to validate
 * @returns True if value matches distance object format
 */
export function isDistanceObject(
  distance: unknown
): distance is { formatted: string; meters: number } {
  return (
    typeof distance === 'object' &&
    distance !== null &&
    'formatted' in distance &&
    typeof distance.formatted === 'string' &&
    'meters' in distance &&
    typeof distance.meters === 'number'
  );
}

/**
 * Type guard for PitchCorner objects
 *
 * Validates SVG canvas corner coordinates.
 *
 * @param obj - Object to validate
 * @returns True if object is a valid PitchCorner
 */
export function isPitchCorner(obj: unknown): obj is PitchCorner {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'x' in obj &&
    typeof obj.x === 'number' &&
    'y' in obj &&
    typeof obj.y === 'number'
  );
}

/**
 * Type guard for PitchCorners objects
 *
 * Validates that an object contains all four pitch corners in SVG coordinates.
 *
 * @param obj - Object to validate
 * @returns True if object is valid PitchCorners
 */
export function isPitchCorners(obj: unknown): obj is PitchCorners {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'topLeft' in obj &&
    isPitchCorner(obj.topLeft) &&
    'topRight' in obj &&
    isPitchCorner(obj.topRight) &&
    'bottomLeft' in obj &&
    isPitchCorner(obj.bottomLeft) &&
    'bottomRight' in obj &&
    isPitchCorner(obj.bottomRight)
  );
}

/**
 * Type guard for PitchInfo objects
 *
 * Validates pitch metadata and dimensions.
 *
 * @param obj - Object to validate
 * @returns True if object is valid PitchInfo
 */
export function isPitchInfo(obj: unknown): obj is PitchInfo {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof obj.name === 'string' &&
    'dimensions' in obj &&
    typeof obj.dimensions === 'object' &&
    obj.dimensions !== null &&
    'width' in obj.dimensions &&
    typeof obj.dimensions.width === 'number' &&
    'length' in obj.dimensions &&
    typeof obj.dimensions.length === 'number'
  );
}

/**
 * Type guard for Sprint objects (transformed)
 *
 * Validates sprint data with SVG coordinates.
 *
 * @param obj - Object to validate
 * @returns True if object is a valid Sprint
 */
export function isSprint(obj: unknown): obj is Sprint {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'startPoint' in obj &&
    'endPoint' in obj &&
    'points' in obj &&
    Array.isArray(obj.points) &&
    'duration' in obj &&
    typeof obj.duration === 'number' &&
    'distance' in obj &&
    typeof obj.distance === 'number' &&
    'avgSpeed' in obj &&
    typeof obj.avgSpeed === 'number' &&
    'maxSpeed' in obj &&
    typeof obj.maxSpeed === 'number'
  );
}

/**
 * Type guard for RawSprint objects (before transformation)
 *
 * Validates sprint data with GPS coordinates only.
 *
 * @param obj - Object to validate
 * @returns True if object is a valid RawSprint
 */
export function isRawSprint(obj: unknown): obj is RawSprint {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'startPoint' in obj &&
    isTrackPoint(obj.startPoint) &&
    'endPoint' in obj &&
    isTrackPoint(obj.endPoint) &&
    'points' in obj &&
    Array.isArray(obj.points) &&
    obj.points.every(isTrackPoint) &&
    'duration' in obj &&
    typeof obj.duration === 'number' &&
    'distance' in obj &&
    typeof obj.distance === 'number'
  );
}

/**
 * Type guard for SegmentData objects
 *
 * Validates time segment data with tracking points and metrics.
 *
 * @param obj - Object to validate
 * @returns True if object is valid SegmentData
 */
export function isSegmentData(obj: unknown): obj is SegmentData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'trackingPoints' in obj &&
    Array.isArray(obj.trackingPoints) &&
    'duration' in obj &&
    isDurationObject(obj.duration) &&
    'distance' in obj &&
    isDistanceObject(obj.distance) &&
    'avgHeartRate' in obj &&
    (obj.avgHeartRate === null || typeof obj.avgHeartRate === 'number')
  );
}

/**
 * Type guard for VisualizationData objects
 *
 * Validates complete visualization data structure.
 *
 * @param obj - Object to validate
 * @returns True if object is valid VisualizationData
 */
export function isVisualizationData(obj: unknown): obj is VisualizationData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'pitchCorners' in obj &&
    isPitchCorners(obj.pitchCorners) &&
    'segments' in obj &&
    Array.isArray(obj.segments) &&
    obj.segments.every(isSegmentData) &&
    'canvasWidth' in obj &&
    typeof obj.canvasWidth === 'number' &&
    'canvasHeight' in obj &&
    typeof obj.canvasHeight === 'number' &&
    'totalDuration' in obj &&
    isDurationObject(obj.totalDuration) &&
    'totalDistance' in obj &&
    isDistanceObject(obj.totalDistance) &&
    'pitchInfo' in obj &&
    isPitchInfo(obj.pitchInfo)
  );
}

/**
 * Type guard for Session objects
 *
 * Validates complete session data structure from localStorage.
 *
 * @param obj - Object to validate
 * @returns True if object is a valid Session
 *
 * @example
 * ```typescript
 * const data = JSON.parse(localStorage.getItem('session'));
 * if (isSession(data)) {
 *   console.log(`Session: ${data.id}`);
 * } else {
 *   console.error('Invalid session data');
 * }
 * ```
 */
export function isSession(obj: unknown): obj is Session {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof obj.id === 'string' &&
    'rawPoints' in obj &&
    Array.isArray(obj.rawPoints) &&
    'pitchId' in obj &&
    typeof obj.pitchId === 'string' &&
    'activityDate' in obj &&
    'totalPointCount' in obj &&
    typeof obj.totalPointCount === 'number' &&
    'pitchInfo' in obj &&
    isPitchInfo(obj.pitchInfo) &&
    'visualizationData' in obj &&
    isVisualizationData(obj.visualizationData)
  );
}

/**
 * Type guard for HeatmapSettings objects
 *
 * Validates heatmap configuration settings.
 *
 * @param obj - Object to validate
 * @returns True if object is valid HeatmapSettings
 */
export function isHeatmapSettings(obj: unknown): obj is HeatmapSettings {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'intensity' in obj &&
    typeof obj.intensity === 'number' &&
    'opacity' in obj &&
    typeof obj.opacity === 'number' &&
    'densityRadius' in obj &&
    typeof obj.densityRadius === 'number' &&
    'colorPalette' in obj &&
    typeof obj.colorPalette === 'string' &&
    'minThreshold' in obj &&
    typeof obj.minThreshold === 'number'
  );
}

/**
 * Type guard for SprintSettings objects
 *
 * Validates sprint detection configuration.
 *
 * @param obj - Object to validate
 * @returns True if object is valid SprintSettings
 */
export function isSprintSettings(obj: unknown): obj is SprintSettings {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'minSpeed' in obj &&
    typeof obj.minSpeed === 'number' &&
    'minDuration' in obj &&
    typeof obj.minDuration === 'number' &&
    'minDistance' in obj &&
    typeof obj.minDistance === 'number' &&
    'simplified' in obj &&
    typeof obj.simplified === 'boolean' &&
    'showNumbers' in obj &&
    typeof obj.showNumbers === 'boolean'
  );
}

/**
 * Type guard for SegmentType values
 *
 * Validates segment type literals.
 *
 * @param value - Value to validate
 * @returns True if value is a valid SegmentType
 */
export function isSegmentType(value: unknown): value is SegmentType {
  return (
    value === 'full' ||
    value === 'halves' ||
    value === 'thirds' ||
    value === 'quarters'
  );
}

/**
 * Type guard for OrientationType values
 *
 * Validates orientation type literals.
 *
 * @param value - Value to validate
 * @returns True if value is a valid OrientationType
 */
export function isOrientationType(value: unknown): value is OrientationType {
  return (
    value === 'original' ||
    value === 'rotated90' ||
    value === 'rotated180' ||
    value === 'rotated270'
  );
}

/**
 * Type guard array validator
 *
 * Creates a type guard for arrays with specific element type.
 *
 * @param itemGuard - Type guard function for array elements
 * @returns Type guard function for array
 *
 * @example
 * ```typescript
 * const isTrackPointArray = isArrayOf(isTrackPoint);
 * if (isTrackPointArray(data)) {
 *   // data is TrackPoint[]
 * }
 * ```
 */
export function isArrayOf<T>(
  itemGuard: (item: unknown) => item is T
): (arr: unknown) => arr is T[] {
  return (arr: unknown): arr is T[] => {
    return Array.isArray(arr) && arr.every(itemGuard);
  };
}
