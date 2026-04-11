import { getPitchesList, type PitchConfig } from '../config/pitches';
import type { TrackPoint } from '../types';

interface GPSPoint {
  lat: number;
  lon: number;
}

interface PitchPolygon {
  topLeft: GPSPoint;
  topRight: GPSPoint;
  bottomRight: GPSPoint;
  bottomLeft: GPSPoint;
}

/**
 * Checks if a GPS point is inside a polygon using ray casting algorithm
 *
 * @param point - GPS coordinates to test
 * @param polygon - Polygon defined by 4 corner points
 * @returns True if point is inside the polygon
 *
 * @internal
 */
const isPointInPolygon = (point: GPSPoint, polygon: PitchPolygon): boolean => {
  const { lat, lon } = point;
  const vertices = [
    polygon.topLeft,
    polygon.topRight,
    polygon.bottomRight,
    polygon.bottomLeft
  ];

  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].lon, yi = vertices[i].lat;
    const xj = vertices[j].lon, yj = vertices[j].lat;

    const intersect = ((yi > lat) !== (yj > lat))
      && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 * Automatically detects which football pitch the GPS tracking belongs to
 *
 * Compares GPS points against all configured pitch boundaries and returns
 * the pitch with the highest percentage of points inside its area.
 *
 * @param trackingPoints - Array of GPS tracking points from activity
 * @returns Pitch ID if detection successful (≥10% points inside), null otherwise
 *
 * @example
 * ```typescript
 * const points = parseTCX(tcxContent);
 * const pitchId = autoDetectPitch(points);
 *
 * if (pitchId) {
 *   console.log(`Detected pitch: ${pitchId}`);
 * } else {
 *   console.log('Using default pitch');
 * }
 * ```
 */
export const autoDetectPitch = (trackingPoints: TrackPoint[]): string | null => {
  if (!trackingPoints || trackingPoints.length === 0) {
    return null;
  }

  const pitches = getPitchesList();
  let bestMatch: PitchConfig | null = null;
  let maxPointsInside = 0;

  // Dla każdego boiska policz ile punktów jest w środku
  pitches.forEach(pitch => {
    let pointsInside = 0;

    trackingPoints.forEach(point => {
      if (isPointInPolygon(point, pitch.corners)) {
        pointsInside++;
      }
    });

    // Sprawdź czy to lepsze dopasowanie
    if (pointsInside > maxPointsInside) {
      maxPointsInside = pointsInside;
      bestMatch = pitch;
    }
  });

  // Jeśli przynajmniej 10% punktów jest w boisku, uznaj za dopasowanie
  const threshold = trackingPoints.length * 0.1;
  if (maxPointsInside >= threshold && bestMatch !== null) {
    console.log(`Auto-detected pitch: ${(bestMatch as PitchConfig).name} (${maxPointsInside}/${trackingPoints.length} points inside)`);
    return (bestMatch as PitchConfig).id;
  }

  console.log('No pitch detected, using default');
  return null;
};
