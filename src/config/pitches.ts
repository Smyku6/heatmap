import type { OrientationType, SatelliteTransform } from '../types';

/**
 * GPS coordinates for a single point
 */
export interface GPSCoordinates {
  lat: number;
  lon: number;
}

/**
 * Four corner points defining a pitch boundary in GPS coordinates
 */
export interface GPSPitchCorners {
  topLeft: GPSCoordinates;
  topRight: GPSCoordinates;
  bottomLeft: GPSCoordinates;
  bottomRight: GPSCoordinates;
}

/**
 * Pitch dimensions in meters
 */
interface PitchDimensions {
  width: number;
  length: number;
}

/**
 * Goal dimensions in meters
 */
interface GoalDimensions {
  width: number;
  depth: number;
}

/**
 * Penalty box dimensions in meters
 */
interface PenaltyBoxDimensions {
  width: number;
  depth: number;
}

/**
 * Satellite image configuration for a pitch
 */
interface SatelliteConfig {
  image: string;
  transforms: Record<OrientationType, SatelliteTransform>;
}

/**
 * Complete configuration for a football pitch
 */
export interface PitchConfig {
  id: string;
  name: string;
  location: string;
  corners: GPSPitchCorners;
  dimensions?: PitchDimensions;
  centerCircleRadius?: number;
  goal?: GoalDimensions;
  penaltyBox?: PenaltyBoxDimensions;
  satellite?: SatelliteConfig;
}

/**
 * All configured pitches in the system
 */
export const PITCHES: Record<string, PitchConfig> = {
  'lawendowe-wzgorze-orlik': {
    id: 'lawendowe-wzgorze-orlik',
    name: 'Lawendowe Wzgórze - Orlik',
    location: 'Gdańsk',
    corners: {
      topLeft: { lat: 54.325814, lon: 18.567196 },
      topRight: { lat: 54.325968, lon: 18.567493 },
      bottomLeft: { lat: 54.325438, lon: 18.567764 },
      bottomRight: { lat: 54.325592, lon: 18.568062 }
    },
    centerCircleRadius: 4, // Promień koła środkowego w metrach
    goal: {
      width: 5, // Szerokość bramki w metrach
      depth: 1 // Głębokość bramki w metrach (jak daleko wystaje poza boisko)
    },
    penaltyBox: {
      width: 18.25, // Szerokość pola karnego w metrach
      depth: 7.75 // Głębokość pola karnego w metrach (jak daleko wchodzi w boisko)
    },
    satellite: {
      image: '/images/lawendowe.jpg',
      transforms: {
        original: { scale: 0.94, rotation: 90, translateX: -73, translateY: 0 },
        rotated90: { scale: 0.94, rotation: 90, translateX: -73, translateY: 0 },
        rotated180: { scale: 0.94, rotation: 90, translateX: -73, translateY: 0 },
        rotated270: { scale: 0.94, rotation: 90, translateX: -73, translateY: 0 }
      }
    }
  }
  // Dodaj kolejne boiska tutaj:
  // 'nazwa-boiska': {
  //   id: 'nazwa-boiska',
  //   name: 'Wyświetlana Nazwa',
  //   location: 'Miasto',
  //   corners: {
  //     topLeft: { lat: XX.XXXXXX, lon: XX.XXXXXX },
  //     topRight: { lat: XX.XXXXXX, lon: XX.XXXXXX },
  //     bottomLeft: { lat: XX.XXXXXX, lon: XX.XXXXXX },
  //     bottomRight: { lat: XX.XXXXXX, lon: XX.XXXXXX }
  //   }
  // },
};

/**
 * Default pitch ID used when no pitch is detected
 */
export const DEFAULT_PITCH_ID = 'lawendowe-wzgorze-orlik';

/**
 * Gets pitch configuration by ID
 *
 * @param pitchId - ID of the pitch to retrieve
 * @returns Pitch configuration, or default pitch if ID not found
 *
 * @example
 * ```typescript
 * const pitch = getPitch('lawendowe-wzgorze-orlik');
 * console.log(pitch.name); // "Lawendowe Wzgórze - Orlik"
 * ```
 */
export const getPitch = (pitchId: string): PitchConfig => {
  return PITCHES[pitchId] || PITCHES[DEFAULT_PITCH_ID];
};

/**
 * Gets all available pitches as an array
 *
 * @returns Array of all pitch configurations
 *
 * @example
 * ```typescript
 * const allPitches = getPitchesList();
 * allPitches.forEach(pitch => {
 *   console.log(`${pitch.name} in ${pitch.location}`);
 * });
 * ```
 */
export const getPitchesList = (): PitchConfig[] => {
  return Object.values(PITCHES);
};
