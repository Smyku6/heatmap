import { getPitch, DEFAULT_PITCH_ID } from '../config/pitches';
import { getPerspectiveTransform, transformPoint } from './perspectiveTransform';
import type {
  TrackPoint,
  SegmentType,
  OrientationType,
  VisualizationData,
  SprintSettings,
  PitchCorners
} from '../types';

/**
 * Parses TCX (Training Center XML) file and extracts GPS tracking points
 *
 * @param xmlString - Raw XML content of the TCX file
 * @returns Array of tracking points with GPS coordinates, time, and heart rate data
 *
 * @example
 * ```typescript
 * const tcxContent = await readFile('activity.tcx', 'utf-8');
 * const points = parseTCX(tcxContent);
 * console.log(`Parsed ${points.length} GPS points`);
 * ```
 */
export const parseTCX = (xmlString: string): TrackPoint[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  const trackpoints = xmlDoc.getElementsByTagName('Trackpoint');
  const points: TrackPoint[] = [];

  for (let i = 0; i < trackpoints.length; i++) {
    const trackpoint = trackpoints[i];
    const position = trackpoint.getElementsByTagName('Position')[0];

    if (position) {
      const latText = position.getElementsByTagName('LatitudeDegrees')[0]?.textContent;
      const lonText = position.getElementsByTagName('LongitudeDegrees')[0]?.textContent;
      const timeText = trackpoint.getElementsByTagName('Time')[0]?.textContent;
      const heartRateText = trackpoint.getElementsByTagName('HeartRateBpm')[0]
        ?.getElementsByTagName('Value')[0]?.textContent;

      if (latText && lonText && timeText) {
        const lat = parseFloat(latText);
        const lon = parseFloat(lonText);

        if (!isNaN(lat) && !isNaN(lon)) {
          points.push({
            lat,
            lon,
            time: new Date(timeText),
            heartRate: heartRateText ? parseInt(heartRateText) : undefined
          });
        }
      }
    }
  }

  return points;
};

// Pobiera współrzędne boiska (domyślne lub wybrane)
const getPitchCorners = (pitchId = DEFAULT_PITCH_ID) => {
  const pitch = getPitch(pitchId);
  return pitch.corners;
};

// Oblicza kąt obrotu boiska dla CSS transform (w stopniach)
// Obliczany na podstawie lewej krawędzi boiska (TL -> BL) w SVG
const calculatePitchRotationAngle = (pitchCornersSVG, orientation) => {
  if (orientation === 'original') {
    return 0; // Bez rotacji
  }

  // Oblicz kąt obecnej orientacji boiska w SVG (lewa krawędź TL -> BL)
  const dx = pitchCornersSVG.bottomLeft.x - pitchCornersSVG.topLeft.x;
  const dy = pitchCornersSVG.bottomLeft.y - pitchCornersSVG.topLeft.y;
  const currentAngleRad = Math.atan2(dy, dx);
  const currentAngleDeg = currentAngleRad * 180 / Math.PI;

  // Dla horizontal: długość boiska powinna być pozioma (kąt = 0° lub 180°)
  // Dla vertical: długość boiska powinna być pionowa (kąt = 90° lub 270°)

  if (orientation === 'horizontal') {
    // Chcemy żeby długość była pozioma (0° w prawo, lub 180° w lewo)
    // Obracamy tak żeby kąt był najbliżej 0° lub 180°
    const targetAngle = Math.abs(currentAngleDeg) < 90 ? 0 : 180;
    return targetAngle - currentAngleDeg;
  } else if (orientation === 'vertical') {
    // Chcemy żeby długość była pionowa (90° w dół, lub 270° w górę)
    // Obracamy tak żeby kąt był najbliżej 90° lub 270°
    const targetAngle = (currentAngleDeg + 90) % 360 < 180 ? 90 : 270;
    return targetAngle - currentAngleDeg;
  }

  return 0;
};

// Konwertuje GPS lat/lon na współrzędne SVG
// Używa transformacji perspektywicznej (homografia) aby zmapować czworokąt GPS na prostokąt canvas
// Zachowuje rzeczywiste proporcje boiska (obliczone z GPS)
export const convertGPSToSVG = (allPoints, canvasWidth = 1000, canvasHeight = 800, pitchCorners = null) => {
  // Oblicz rzeczywiste wymiary boiska w metrach
  const pitchWidth = calculateDistance(
    pitchCorners.topLeft.lat, pitchCorners.topLeft.lon,
    pitchCorners.topRight.lat, pitchCorners.topRight.lon
  );
  const pitchLength = calculateDistance(
    pitchCorners.topLeft.lat, pitchCorners.topLeft.lon,
    pitchCorners.bottomLeft.lat, pitchCorners.bottomLeft.lon
  );

  console.log(`Rzeczywiste wymiary boiska: ${pitchWidth.toFixed(1)}m × ${pitchLength.toFixed(1)}m`);

  // Oblicz ratio boiska
  const pitchRatio = pitchWidth / pitchLength; // szerokość / długość

  // Padding wokół boiska
  const padding = 50;
  const availableWidth = canvasWidth - 2 * padding;
  const availableHeight = canvasHeight - 2 * padding;

  // Dopasuj rozmiar boiska do canvas zachowując proporcje
  let drawWidth, drawHeight;
  const canvasRatio = availableWidth / availableHeight;

  if (pitchRatio > canvasRatio) {
    // Boisko szersze proporcjonalnie - dopasuj do szerokości
    drawWidth = availableWidth;
    drawHeight = availableWidth / pitchRatio;
  } else {
    // Boisko wyższe proporcjonalnie - dopasuj do wysokości
    drawHeight = availableHeight;
    drawWidth = availableHeight * pitchRatio;
  }

  // Wycentruj boisko
  const offsetX = padding + (availableWidth - drawWidth) / 2;
  const offsetY = padding + (availableHeight - drawHeight) / 2;

  // Znajdź zakres GPS wszystkich punktów
  const allLats = [
    pitchCorners.topLeft.lat,
    pitchCorners.topRight.lat,
    pitchCorners.bottomLeft.lat,
    pitchCorners.bottomRight.lat,
    ...allPoints.map(p => p.lat)
  ];
  const allLons = [
    pitchCorners.topLeft.lon,
    pitchCorners.topRight.lon,
    pitchCorners.bottomLeft.lon,
    pitchCorners.bottomRight.lon,
    ...allPoints.map(p => p.lon)
  ];

  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLon = Math.min(...allLons);
  const maxLon = Math.max(...allLons);

  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;

  // Znormalizuj współrzędne GPS do [0,1] × [0,1]
  const normalizeGPS = (lat, lon) => ({
    x: (lon - minLon) / lonRange,
    y: (lat - minLat) / latRange
  });

  // Punkty źródłowe: narożniki boiska w znormalizowanych współrzędnych GPS
  const sourcePoints = [
    normalizeGPS(pitchCorners.topLeft.lat, pitchCorners.topLeft.lon),
    normalizeGPS(pitchCorners.topRight.lat, pitchCorners.topRight.lon),
    normalizeGPS(pitchCorners.bottomRight.lat, pitchCorners.bottomRight.lon),
    normalizeGPS(pitchCorners.bottomLeft.lat, pitchCorners.bottomLeft.lon)
  ];

  // Punkty docelowe: idealny prostokąt na canvas z prawdziwymi proporcjami
  const destPoints = [
    { x: offsetX, y: offsetY },                           // topLeft
    { x: offsetX + drawWidth, y: offsetY },               // topRight
    { x: offsetX + drawWidth, y: offsetY + drawHeight },  // bottomRight
    { x: offsetX, y: offsetY + drawHeight }               // bottomLeft
  ];

  // Oblicz macierz transformacji perspektywicznej
  const perspectiveMatrix = getPerspectiveTransform(sourcePoints, destPoints);

  // Funkcja konwertująca GPS na SVG
  const toSVG = (lat, lon) => {
    // Znormalizuj punkt GPS
    const normalized = normalizeGPS(lat, lon);

    // Zastosuj transformację perspektywiczną
    return transformPoint(normalized.x, normalized.y, perspectiveMatrix);
  };

  return {
    toSVG,
    canvasWidth,
    canvasHeight,
    bounds: { minLat, maxLat, minLon, maxLon }
  };
};

// Oblicza odległość między dwoma punktami GPS (w metrach) - wzór Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // promień Ziemi w metrach
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Oblicza wymiary boiska na podstawie narożników GPS
export const calculatePitchDimensions = (corners) => {
  // Szerokość (górna i dolna krawędź)
  const topWidth = calculateDistance(
    corners.topLeft.lat, corners.topLeft.lon,
    corners.topRight.lat, corners.topRight.lon
  );
  const bottomWidth = calculateDistance(
    corners.bottomLeft.lat, corners.bottomLeft.lon,
    corners.bottomRight.lat, corners.bottomRight.lon
  );
  const width = (topWidth + bottomWidth) / 2;

  // Długość (lewa i prawa krawędź)
  const leftLength = calculateDistance(
    corners.topLeft.lat, corners.topLeft.lon,
    corners.bottomLeft.lat, corners.bottomLeft.lon
  );
  const rightLength = calculateDistance(
    corners.topRight.lat, corners.topRight.lon,
    corners.bottomRight.lat, corners.bottomRight.lon
  );
  const length = (leftLength + rightLength) / 2;

  return {
    width: Math.round(width),
    length: Math.round(length)
  };
};

// Oblicza prędkość w km/h między dwoma punktami
const calculateSpeed = (point1, point2) => {
  const time1 = new Date(point1.time);
  const time2 = new Date(point2.time);
  const timeDiffSeconds = (time2 - time1) / 1000;

  if (timeDiffSeconds === 0) return 0;

  const distance = calculateDistance(point1.lat, point1.lon, point2.lat, point2.lon);
  const speedMetersPerSecond = distance / timeDiffSeconds;
  const speedKmH = speedMetersPerSecond * 3.6;

  return speedKmH;
};

// Wykrywa sprinty w danych trackingowych
export const detectSprints = (trackingPoints, settings = {}) => {
  const {
    minSpeed = 16.5,      // Minimalna prędkość w km/h
    minDuration = 2,      // Minimalna długość sprintu w sekundach
    minDistance = 10      // Minimalny dystans w metrach
  } = settings;

  if (trackingPoints.length < 2) return [];

  const sprints = [];
  let currentSprint = null;

  for (let i = 1; i < trackingPoints.length; i++) {
    const speed = calculateSpeed(trackingPoints[i - 1], trackingPoints[i]);

    if (speed >= minSpeed) {
      if (!currentSprint) {
        // Rozpocznij nowy sprint
        currentSprint = {
          startIndex: i - 1,
          endIndex: i,
          points: [trackingPoints[i - 1], trackingPoints[i]],
          speeds: [speed],
          maxSpeed: speed
        };
      } else {
        // Kontynuuj sprint
        currentSprint.endIndex = i;
        currentSprint.points.push(trackingPoints[i]);
        currentSprint.speeds.push(speed);
        currentSprint.maxSpeed = Math.max(currentSprint.maxSpeed, speed);
      }
    } else {
      // Zakończ sprint jeśli był aktywny
      if (currentSprint) {
        const sprintData = finalizeSprint(currentSprint, minDuration, minDistance);
        if (sprintData) {
          sprints.push(sprintData);
        }
        currentSprint = null;
      }
    }
  }

  // Zakończ ostatni sprint jeśli był aktywny
  if (currentSprint) {
    const sprintData = finalizeSprint(currentSprint, minDuration, minDistance);
    if (sprintData) {
      sprints.push(sprintData);
    }
  }

  return sprints;
};

// Finalizuje sprint i sprawdza czy spełnia minimalne wymagania
const finalizeSprint = (sprint, minDuration, minDistance) => {
  const startTime = new Date(sprint.points[0].time);
  const endTime = new Date(sprint.points[sprint.points.length - 1].time);
  const duration = (endTime - startTime) / 1000; // w sekundach

  // Oblicz całkowity dystans sprintu
  let distance = 0;
  for (let i = 1; i < sprint.points.length; i++) {
    distance += calculateDistance(
      sprint.points[i - 1].lat,
      sprint.points[i - 1].lon,
      sprint.points[i].lat,
      sprint.points[i].lon
    );
  }

  // Sprawdź minimalne wymagania
  if (duration < minDuration || distance < minDistance) {
    return null;
  }

  const avgSpeed = sprint.speeds.reduce((sum, s) => sum + s, 0) / sprint.speeds.length;

  return {
    startPoint: sprint.points[0],
    endPoint: sprint.points[sprint.points.length - 1],
    points: sprint.points,
    duration,
    distance,
    avgSpeed,
    maxSpeed: sprint.maxSpeed,
    startTime: sprint.points[0].time,
    endTime: sprint.points[sprint.points.length - 1].time
  };
};

// Oblicza całkowitą przebiegniętą odległość
export const calculateTotalDistance = (trackingPoints) => {
  if (trackingPoints.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < trackingPoints.length; i++) {
    const prev = trackingPoints[i - 1];
    const curr = trackingPoints[i];
    totalDistance += calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
  }

  return totalDistance; // w metrach
};

// Oblicza czas trwania aktywności
export const calculateDuration = (trackingPoints) => {
  if (trackingPoints.length < 2) return null;

  const startTime = new Date(trackingPoints[0].time);
  const endTime = new Date(trackingPoints[trackingPoints.length - 1].time);

  const durationMs = endTime - startTime;
  const durationSeconds = Math.floor(durationMs / 1000);

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  // Format czasu jako HH:MM
  const formatTime = (date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return {
    hours,
    minutes,
    seconds,
    totalSeconds: durationSeconds,
    formatted: hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`,
    startTime: formatTime(startTime),
    endTime: formatTime(endTime),
    timeRange: `${formatTime(startTime)}-${formatTime(endTime)}`
  };
};

// Dzieli punkty na segmenty czasowe (według czasu, nie liczby punktów)
export const splitIntoSegments = (trackingPoints, segmentType) => {
  if (segmentType === 'full' || trackingPoints.length === 0) {
    return [trackingPoints];
  }

  const count = segmentType === 'halves' ? 2 : segmentType === 'thirds' ? 3 : 4;

  // Oblicz całkowity czas trwania
  const startTime = new Date(trackingPoints[0].time);
  const endTime = new Date(trackingPoints[trackingPoints.length - 1].time);
  const totalDuration = endTime - startTime;
  const segmentDuration = totalDuration / count;

  const segments = [];

  for (let i = 0; i < count; i++) {
    const segmentStartTime = new Date(startTime.getTime() + i * segmentDuration);
    const segmentEndTime = new Date(startTime.getTime() + (i + 1) * segmentDuration);

    // Filtruj punkty dla tego segmentu czasowego
    const segmentPoints = trackingPoints.filter(point => {
      const pointTime = new Date(point.time);
      return pointTime >= segmentStartTime &&
             (i === count - 1 ? pointTime <= segmentEndTime : pointTime < segmentEndTime);
    });

    segments.push(segmentPoints);
  }

  return segments;
};

// Konwertuje punkty trackingu i narożniki boiska na współrzędne SVG
/**
 * Prepares complete visualization data for rendering on pitch
 *
 * Transforms GPS tracking points into SVG coordinates, applies pitch orientation,
 * splits data into time segments, and optionally detects sprints.
 *
 * @param trackingPoints - Array of GPS tracking points from TCX file
 * @param segmentType - How to split the activity ('full' | 'halves' | 'thirds' | 'quarters')
 * @param pitchId - ID of the pitch configuration to use
 * @param orientation - Pitch orientation/rotation ('original' | 'rotated90' | 'rotated180' | 'rotated270')
 * @param sprintSettings - Sprint detection settings, or null to skip sprint detection
 * @returns Complete visualization data ready for rendering
 *
 * @example
 * ```typescript
 * const points = parseTCX(tcxContent);
 * const vizData = prepareVisualizationData(
 *   points,
 *   'halves',
 *   'orlik-kopernika',
 *   'original',
 *   { minSpeed: 16.5, minDuration: 2, minDistance: 10 }
 * );
 * ```
 */
export const prepareVisualizationData = (
  trackingPoints: TrackPoint[],
  segmentType: SegmentType = 'full',
  pitchId: string = DEFAULT_PITCH_ID,
  orientation: OrientationType = 'original',
  sprintSettings: SprintSettings | null = null
): VisualizationData => {
  // Podziel na segmenty
  const segments = splitIntoSegments(trackingPoints, segmentType);

  // Pobierz współrzędne wybranego boiska
  const PITCH_CORNERS = getPitchCorners(pitchId);

  // Wszystkie punkty GPS (boisko + tracking) do obliczenia boundingu
  const allGPSPoints = [
    PITCH_CORNERS.topLeft,
    PITCH_CORNERS.topRight,
    PITCH_CORNERS.bottomLeft,
    PITCH_CORNERS.bottomRight,
    ...trackingPoints
  ];

  const { toSVG, canvasWidth, canvasHeight } = convertGPSToSVG(allGPSPoints, 1000, 800, PITCH_CORNERS);

  // Konwertuj narożniki boiska
  const pitchCornersSVG = {
    topLeft: toSVG(PITCH_CORNERS.topLeft.lat, PITCH_CORNERS.topLeft.lon),
    topRight: toSVG(PITCH_CORNERS.topRight.lat, PITCH_CORNERS.topRight.lon),
    bottomLeft: toSVG(PITCH_CORNERS.bottomLeft.lat, PITCH_CORNERS.bottomLeft.lon),
    bottomRight: toSVG(PITCH_CORNERS.bottomRight.lat, PITCH_CORNERS.bottomRight.lon)
  };

  // Oblicz kąt rotacji dla CSS transform
  const rotationAngle = calculatePitchRotationAngle(pitchCornersSVG, orientation);

  // Konwertuj segmenty punktów trackingu
  const segmentsSVG = segments.map(segmentPoints => {
    const pointsSVG = segmentPoints.map(point => ({
      ...point,
      ...toSVG(point.lat, point.lon)
    }));

    const duration = calculateDuration(segmentPoints);
    const distance = calculateTotalDistance(segmentPoints);

    // Oblicz średnie tętno
    const heartRates = segmentPoints.filter(p => p.heartRate).map(p => p.heartRate);
    const avgHeartRate = heartRates.length > 0
      ? Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length)
      : null;

    // Wykryj sprinty jeśli ustawienia są podane
    let sprints = [];
    if (sprintSettings) {
      const detectedSprints = detectSprints(segmentPoints, sprintSettings);
      // Konwertuj punkty sprintów do współrzędnych SVG
      sprints = detectedSprints.map(sprint => ({
        ...sprint,
        startPoint: {
          ...sprint.startPoint,
          ...toSVG(sprint.startPoint.lat, sprint.startPoint.lon)
        },
        endPoint: {
          ...sprint.endPoint,
          ...toSVG(sprint.endPoint.lat, sprint.endPoint.lon)
        },
        points: sprint.points.map(p => ({
          ...p,
          ...toSVG(p.lat, p.lon)
        }))
      }));
    }

    return {
      trackingPoints: pointsSVG,
      duration,
      distance,
      avgHeartRate,
      pointCount: segmentPoints.length,
      sprints
    };
  });

  // Oblicz całkowite statystyki
  const totalDuration = calculateDuration(trackingPoints);
  const totalDistance = calculateTotalDistance(trackingPoints);
  const allHeartRates = trackingPoints.filter(p => p.heartRate).map(p => p.heartRate);
  const totalAvgHeartRate = allHeartRates.length > 0
    ? Math.round(allHeartRates.reduce((sum, hr) => sum + hr, 0) / allHeartRates.length)
    : null;

  // Pobierz informacje o boisku
  const pitch = getPitch(pitchId);
  const dimensions = calculatePitchDimensions(PITCH_CORNERS);

  // Pobierz datę aktywności z pierwszego punktu
  const activityDate = trackingPoints.length > 0 ? new Date(trackingPoints[0].time) : null;

  return {
    pitchCorners: pitchCornersSVG,
    segments: segmentsSVG,
    canvasWidth,
    canvasHeight,
    totalDuration,
    totalDistance,
    totalAvgHeartRate,
    totalPointCount: trackingPoints.length,
    segmentType,
    rotationAngle, // Kąt rotacji dla CSS transform
    satellite: pitch.satellite || null, // Dane obrazu satelitarnego
    centerCircleRadius: pitch.centerCircleRadius || 5, // Promień koła środkowego w metrach
    goal: pitch.goal || { width: 5, depth: 1 }, // Wymiary bramki w metrach
    penaltyBox: pitch.penaltyBox || { width: 10, depth: 5 }, // Wymiary pola karnego w metrach
    activityDate: activityDate, // Data aktywności
    pitchInfo: {
      id: pitch.id,
      name: pitch.name,
      location: pitch.location,
      dimensions: dimensions
    }
  };
};